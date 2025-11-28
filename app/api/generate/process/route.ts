import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { updateJobStatus } from '@/lib/job-queue'
import { uploadImageToR2 } from '@/lib/r2-storage'
import { BASE_PROMPT_TEMPLATE, REALISTIC_PROMPT_TEMPLATE, PIXAR_PROMPT_TEMPLATE } from '@/lib/constants'
import { StyleType, BrainstormResult } from '@/lib/types'

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

async function processJob(jobId: string) {
  try {
    const job = await prisma.generationJob.findUnique({
      where: { id: jobId },
    })

    if (!job) {
      console.error('任务不存在:', jobId)
      return
    }

    // 更新状态为处理中
    await updateJobStatus(jobId, 'processing')

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      throw new Error('OpenRouter API Key 未配置')
    }

    // Step 1: Brainstorm
    const brainstormData = await brainstorm(job.theme)

    // Step 2: Construct full prompt
    const fullPrompt = constructFullPrompt(
      job.theme,
      brainstormData.coreObjects || [job.theme],
      brainstormData.detailedItems || ['相关物品'],
      brainstormData.envElements || ['简单背景'],
      job.style as StyleType
    )

    // Step 3: Generate image
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

    const imageUrl = message.images[0].image_url.url

    if (!imageUrl) {
      throw new Error('图片生成失败')
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
      publicUrl = await uploadImageToR2(base64Image, `images/${Date.now()}-${job.theme}.png`)
    } catch (error) {
      console.error('R2 上传失败，使用本地 base64:', error)
    }

    // 保存到数据库
    let user = await prisma.user.findUnique({
      where: { clerkId: job.userId },
    })

    if (!user) {
      user = await prisma.user.create({
        data: { clerkId: job.userId },
      })
    }

    const image = await prisma.image.create({
      data: {
        url: publicUrl,
        prompt: fullPrompt,
        theme: job.theme,
        style: job.style,
        userId: user.id,
      },
    })

    // 更新任务状态为完成
    await updateJobStatus(jobId, 'completed', publicUrl)

    console.log('任务完成:', { jobId, imageId: image.id })
  } catch (error: any) {
    console.error('处理任务失败:', jobId, error)
    await updateJobStatus(jobId, 'failed', undefined, error.message)
  }
}

export async function POST(request: NextRequest) {
  try {
    // 验证请求来源（可选：添加密钥验证）
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    // 获取所有待处理的任务
    const pendingJobs = await prisma.generationJob.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
      take: 5, // 一次最多处理 5 个任务
    })

    console.log('处理待处理任务:', pendingJobs.length)

    // 处理每个任务
    for (const job of pendingJobs) {
      await processJob(job.id)
    }

    return NextResponse.json({
      processed: pendingJobs.length,
      message: `已处理 ${pendingJobs.length} 个任务`,
    })
  } catch (error: any) {
    console.error('处理任务队列失败:', error)
    return NextResponse.json(
      { error: error.message || '处理失败' },
      { status: 500 }
    )
  }
}
