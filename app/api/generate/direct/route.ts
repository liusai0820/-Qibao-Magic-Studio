import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { uploadImageToR2 } from '@/lib/r2-storage'
import { BASE_PROMPT_TEMPLATE, REALISTIC_PROMPT_TEMPLATE, PIXAR_PROMPT_TEMPLATE } from '@/lib/constants'
import { StyleType, BrainstormResult } from '@/lib/types'

/**
 * 直接生成图片（不使用任务队列）
 * 用于快速响应，避免超时问题
 */

const constructFullPrompt = (
  theme: string,
  coreObjects: string[],
  detailedItems: string[],
  envElements: string[],
  style: StyleType = 'claymation'
): string => {
  let template = BASE_PROMPT_TEMPLATE
  if (style === 'realistic') {
    template = REALISTIC_PROMPT_TEMPLATE
  } else if (style === 'pixar') {
    template = PIXAR_PROMPT_TEMPLATE
  }
  
  let prompt = template
  prompt = prompt.replace(/{THEME_PLACEHOLDER}/g, theme)
  prompt = prompt.replace('{CORE_OBJECTS_PLACEHOLDER}', coreObjects.join(', '))
  prompt = prompt.replace('{DETAILED_ITEMS_PLACEHOLDER}', detailedItems.join(', '))
  prompt = prompt.replace('{ENV_ELEMENTS_PLACEHOLDER}', envElements.join(', '))
  return prompt
}

async function brainstorm(theme: string): Promise<BrainstormResult> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    },
    body: JSON.stringify({
      model: process.env.BRAINSTORM_MODEL || 'google/gemini-2.0-flash-exp',
      messages: [
        {
          role: 'user',
          content: `你是一个儿童教育内容创意助手。根据主题"${theme}"，为2-5岁幼儿生成适合制作黏土海报的物体清单。
            
请返回 JSON 格式的结果，包含：
1. coreObjects: 5-8 个与主题相关的核心、标志性大物体（中文描述）
2. detailedItems: 8-12 个与主题相关的具体小物品（中文描述）
3. envElements: 3-5 个背景或环境元素（中文描述）

描述要简短且具有画面感。只返回 JSON，不要其他内容。`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  const content = data.choices[0].message.content

  try {
    return JSON.parse(content)
  } catch {
    return {
      coreObjects: [theme],
      detailedItems: ['相关物品'],
      envElements: ['简单背景'],
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { theme, style = 'claymation' } = await request.json()

    if (!theme) {
      return NextResponse.json({ error: '请输入主题' }, { status: 400 })
    }

    console.log('开始直接生成:', { userId, theme, style })

    // Step 1: Brainstorm
    console.log('Step 1: 正在构思...')
    const brainstormData = await brainstorm(theme)

    // Step 2: Construct full prompt
    console.log('Step 2: 正在构建提示词...')
    const fullPrompt = constructFullPrompt(
      theme,
      brainstormData.coreObjects || [theme],
      brainstormData.detailedItems || ['相关物品'],
      brainstormData.envElements || ['简单背景'],
      style as StyleType
    )

    // Step 3: Generate image
    console.log('Step 3: 正在生成图片...')
    const imageResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      },
      body: JSON.stringify({
        model: process.env.IMAGE_MODEL || 'google/gemini-2.0-flash-exp',
        messages: [
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
        modalities: ['image', 'text'],
        image_config: {
          aspect_ratio: '3:4',
          image_size: '4K',
        },
      }),
    })

    if (!imageResponse.ok) {
      const error = await imageResponse.text()
      throw new Error(`Image generation failed: ${imageResponse.status} - ${error}`)
    }

    const imageData = await imageResponse.json()
    const message = imageData.choices[0].message

    if (!message.images || message.images.length === 0) {
      throw new Error('图片生成失败')
    }

    let imageUrl = message.images[0].image_url.url

    if (!imageUrl) {
      throw new Error('图片生成失败')
    }

    // Step 4: Upload to R2
    console.log('Step 4: 正在上传到R2...')
    let base64Image = imageUrl
    if (imageUrl.startsWith('http')) {
      const imgResponse = await fetch(imageUrl)
      const buffer = await imgResponse.arrayBuffer()
      base64Image = `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`
    }

    let publicUrl = base64Image
    try {
      const timestamp = Date.now()
      const sanitizedTheme = theme.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_').substring(0, 30)
      publicUrl = await uploadImageToR2(base64Image, `images/${userId}/${timestamp}-${sanitizedTheme}.png`)
    } catch (error) {
      console.error('R2 上传失败，使用本地 base64:', error)
    }

    // Step 5: Save to database
    console.log('Step 5: 正在保存到数据库...')
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      user = await prisma.user.create({
        data: { clerkId: userId },
      })
    }

    const image = await prisma.image.create({
      data: {
        url: publicUrl,
        prompt: fullPrompt,
        theme: theme,
        style: style,
        userId: user.id,
      },
    })

    console.log('生成完成:', { imageId: image.id })

    return NextResponse.json({
      success: true,
      id: image.id,
      url: publicUrl,
      theme: theme,
      style: style,
      timestamp: Date.now(),
    })
  } catch (error: any) {
    console.error('直接生成失败:', error)
    return NextResponse.json(
      { error: error.message || '生成失败' },
      { status: 500 }
    )
  }
}
