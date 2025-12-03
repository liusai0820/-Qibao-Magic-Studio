import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { uploadImageToR2 } from '@/lib/r2-storage'
import { generateAvatarMergePrompt } from '@/lib/image-processing'

const constructFullPrompt = (
  userImageDescription: string,
  cartoonCharacters: string,
  scene: string
): string => {
  return `
【任务】用户头像与卡通角色合成

【用户上传的照片分析】
用户已上传了一张真实照片。你必须：
1. 首先仔细观察和分析用户照片中的人物
2. 识别用户的面部特征、发型、肤色、穿着等细节
3. 记住用户的外观特征

【用户照片描述】
${userImageDescription || '用户上传的真实照片'}

【合成要求】
- 卡通角色：${cartoonCharacters}
- 场景环境：${scene}

【生成指示】
1. 将用户的真实面孔与卡通角色进行自然融合
2. 用户应该是画面的主要焦点之一
3. 保持用户的面部特征清晰可见和可识别
4. 整体风格采用皮克斯3D动画风格
5. 用户与卡通角色应该有自然的互动
6. 背景为${scene}
7. 整体画面充满欢乐、温馨的气息

【重要】这是一张合成照片，用户的真实照片是基础，必须清晰展示用户的面孔和身体。
  `.trim()
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: '未授权，请先登录' }, { status: 401 })
    }

    const formData = await request.formData()
    const userImage = formData.get('userImage') as File
    const userImageDescription = formData.get('userImageDescription') as string
    const cartoonCharacters = formData.get('cartoonCharacters') as string
    const scene = formData.get('scene') as string
    const style = formData.get('style') as string || 'pixar'

    if (!userImage) {
      return NextResponse.json({ error: '请上传用户头像' }, { status: 400 })
    }

    if (!cartoonCharacters || !scene) {
      return NextResponse.json({ error: '请提供卡通角色和场景信息' }, { status: 400 })
    }

    // 将用户图片转换为 base64
    const userImageBuffer = await userImage.arrayBuffer()
    const userImageBase64 = Buffer.from(userImageBuffer).toString('base64')
    const userImageMimeType = userImage.type || 'image/jpeg'

    console.log('生成用户头像合成图片:', {
      userId,
      userImageSize: userImage.size,
      cartoonCharacters,
      scene,
    })

    // 构建完整提示词
    const fullPrompt = constructFullPrompt(
      userImageDescription,
      cartoonCharacters,
      scene
    )

    // 调用 OpenRouter Gemini API 生成图片
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenRouter API Key 未配置' }, { status: 500 })
    }

    console.log('调用 OpenRouter API，图片大小:', userImageBase64.length)

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
            content: [
              {
                type: 'text',
                text: fullPrompt,
              },
              {
                type: 'image',
                image: userImageBase64,
                media_type: userImageMimeType,
              },
            ],
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
      console.error('Gemini API 错误:', error)
      throw new Error(`图片生成失败: ${imageResponse.status} - ${error}`)
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
      publicUrl = await uploadImageToR2(
        base64Image,
        `images/${userId}/avatar-merge/${Date.now()}.png`
      )
    } catch (error) {
      console.error('R2 上传失败，使用本地 base64:', error)
    }

    // 保存到数据库
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
        theme: `${cartoonCharacters} - 用户头像合成`,
        style: 'pixar-avatar-merge',
        userId: user.id,
      },
    })

    return NextResponse.json({
      id: image.id,
      url: image.url,
      prompt: image.prompt,
      theme: image.theme,
      timestamp: image.createdAt.getTime(),
    })
  } catch (error: any) {
    console.error('生成用户头像合成图片失败:', error)
    return NextResponse.json(
      { error: error.message || '生成失败，请稍后重试' },
      { status: 500 }
    )
  }
}
