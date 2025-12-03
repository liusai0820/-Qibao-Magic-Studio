import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { uploadImageToR2 } from '@/lib/r2-storage'
import { STORYBOOK_IMAGE_PROMPT } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { 
      prompt, 
      style, 
      characterSheet: characterSheetString,
      referenceImageUrl,
      storyId, 
      pageNumber 
    } = await request.json()

    if (!prompt || !style || !characterSheetString) {
      return NextResponse.json({ error: '缺少必填参数' }, { status: 400 })
    }

    const characterSheet = JSON.parse(characterSheetString)

    // 构建专业化的图像生成prompt
    const fullPrompt = STORYBOOK_IMAGE_PROMPT
      .replace('{CHARACTER_SHEET}', JSON.stringify(characterSheet))
      .replace('{PAGE_PROMPT}', prompt)
      .replace('{ART_STYLE}', style)

    // 构建消息内容
    const messageContent: any[] = [{ type: 'text', text: fullPrompt }]
    
    // 如果有参考图，添加到消息中（用于角色一致性）
    if (referenceImageUrl) {
      messageContent.unshift({
        type: 'image_url',
        image_url: { url: referenceImageUrl }
      })
      messageContent[1].text = `Reference image above shows the main character. Please maintain consistent character appearance based on the character sheet.\n\n${fullPrompt}`
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      },
      body: JSON.stringify({
        model: process.env.IMAGE_MODEL || 'google/gemini-2.0-flash-exp',
        messages: [{ 
          role: 'user', 
          content: messageContent
        }],
        modalities: ['image', 'text'],
        image_config: { 
          aspect_ratio: '1:1',  // 方形图片，避免拉伸
          image_size: '2K' 
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`生成图像失败: ${error}`)
    }

    const data = await response.json()
    const message = data.choices[0].message

    if (!message.images || message.images.length === 0) {
      throw new Error('图片生成失败')
    }

    let imageUrl = message.images[0].image_url.url

    // 上传到 R2 存储
    try {
      let base64Image = imageUrl
      if (imageUrl.startsWith('http')) {
        const imgResponse = await fetch(imageUrl)
        const buffer = await imgResponse.arrayBuffer()
        base64Image = `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`
      }
      const filename = storyId 
        ? `storybook/${userId}/${storyId}/page-${pageNumber}.png`
        : `storybook/${userId}/temp/${Date.now()}-page${pageNumber}.png`
      imageUrl = await uploadImageToR2(base64Image, filename)
    } catch (e) {
      console.error('R2 上传失败，使用原始URL:', e)
    }

    return NextResponse.json({ imageUrl })
  } catch (error: any) {
    console.error('Generate image error:', error)
    return NextResponse.json({ error: error.message || '生成图像失败' }, { status: 500 })
  }
}
