import { NextRequest, NextResponse } from 'next/server'
import { uploadImageToR2 } from '@/lib/r2-storage'

export async function POST(request: NextRequest) {
  try {
    const { imageData, instruction } = await request.json()

    if (!imageData || !instruction) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenRouter API Key 未配置' }, { status: 500 })
    }

    // 使用 vision 模型进行图片编辑
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Clay Magic Studio',
      },
      body: JSON.stringify({
        model: process.env.BRAINSTORM_MODEL || 'google/gemini-2.0-flash-exp',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/png',
                  data: imageData.replace(/^data:image\/\w+;base64,/, ''),
                },
              },
              {
                type: 'text',
                text: `请根据以下指令编辑这张图片：${instruction}。保持黏土风格不变。请返回编辑后的图片的详细描述，以便我们可以重新生成。`,
              },
            ],
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    const editDescription = data.choices[0].message.content

    // 使用编辑描述重新生成图片
    const enhancedDescription = `${editDescription}

质量要求: 4K Ultra HD 分辨率, 3:4 竖版宽高比, 最高质量, Cinema 4D 级别精细度`

    const generateResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Clay Magic Studio',
      },
      body: JSON.stringify({
        model: process.env.IMAGE_MODEL || 'google/gemini-2.0-flash-exp',
        messages: [
          {
            role: 'user',
            content: enhancedDescription,
          },
        ],
        modalities: ['image', 'text'],
        image_config: {
          aspect_ratio: '3:4',
          image_size: '4K',
        },
      }),
    })

    if (!generateResponse.ok) {
      const error = await generateResponse.text()
      throw new Error(`Image generation failed: ${generateResponse.status} - ${error}`)
    }

    const generateData = await generateResponse.json()
    const message = generateData.choices[0].message

    if (!message.images || message.images.length === 0) {
      return NextResponse.json({ error: '编辑失败' }, { status: 500 })
    }

    const newImageUrl = message.images[0].image_url.url

    if (!newImageUrl) {
      return NextResponse.json({ error: '编辑失败' }, { status: 500 })
    }

    // 如果是 base64 数据 URL，直接使用；否则转换
    let base64Image = newImageUrl
    if (newImageUrl.startsWith('http')) {
      const imgResponse = await fetch(newImageUrl)
      const buffer = await imgResponse.arrayBuffer()
      base64Image = `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`
    }

    // 上传到 R2
    let publicUrl = base64Image
    try {
      publicUrl = await uploadImageToR2(base64Image, `images/edited/${Date.now()}.png`)
    } catch (error) {
      console.error('R2 上传失败，使用本地 base64:', error)
      // 如果 R2 上传失败，继续使用 base64
    }

    return NextResponse.json({
      imageUrl: publicUrl,
    })
  } catch (error: any) {
    console.error('Edit error:', error)
    return NextResponse.json(
      { error: error.message || '编辑失败，请稍后重试' },
      { status: 500 }
    )
  }
}
