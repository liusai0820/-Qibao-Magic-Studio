import { NextRequest, NextResponse } from 'next/server'
import { BASE_PROMPT_TEMPLATE, REALISTIC_PROMPT_TEMPLATE } from '@/lib/constants'
import { BrainstormResult, StyleType } from '@/lib/types'
import { uploadImageToR2 } from '@/lib/r2-storage'

const constructFullPrompt = (
  theme: string,
  coreObjects: string[],
  detailedItems: string[],
  envElements: string[],
  style: StyleType = 'claymation'
): string => {
  const template = style === 'realistic' ? REALISTIC_PROMPT_TEMPLATE : BASE_PROMPT_TEMPLATE
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
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Clay Magic Studio',
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
    const { theme, style = 'claymation' } = await request.json()

    if (!theme) {
      return NextResponse.json({ error: '请输入主题' }, { status: 400 })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenRouter API Key 未配置' }, { status: 500 })
    }

    // Step 1: Brainstorm
    const brainstormData = await brainstorm(theme)

    // Step 2: Construct full prompt
    const fullPrompt = constructFullPrompt(
      theme,
      brainstormData.coreObjects || [theme],
      brainstormData.detailedItems || ['相关物品'],
      brainstormData.envElements || ['简单背景'],
      style as StyleType
    )

    // Step 3: Generate image via OpenRouter with modalities
    const enhancedPrompt = `${fullPrompt}`

    const imageResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Qibao Magic Studio',
      },
      body: JSON.stringify({
        model: process.env.IMAGE_MODEL || 'google/gemini-2.0-flash-exp',
        messages: [
          {
            role: 'user',
            content: enhancedPrompt,
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
      return NextResponse.json({ error: '图片生成失败' }, { status: 500 })
    }

    const imageUrl = message.images[0].image_url.url

    if (!imageUrl) {
      return NextResponse.json({ error: '图片生成失败' }, { status: 500 })
    }

    // 如果是 base64 数据 URL，直接使用；否则转换
    let base64Image = imageUrl
    if (imageUrl.startsWith('http')) {
      const imgResponse = await fetch(imageUrl)
      const buffer = await imgResponse.arrayBuffer()
      base64Image = `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`
    }

    // 上传到 R2
    let publicUrl = base64Image
    try {
      publicUrl = await uploadImageToR2(base64Image, `images/${Date.now()}-${theme}.png`)
    } catch (error) {
      console.error('R2 上传失败，使用本地 base64:', error)
      // 如果 R2 上传失败，继续使用 base64
    }

    return NextResponse.json({
      imageUrl: publicUrl,
      prompt: fullPrompt,
    })
  } catch (error: any) {
    console.error('Generate error:', error)
    return NextResponse.json(
      { error: error.message || '生成失败，请稍后重试' },
      { status: 500 }
    )
  }
}
