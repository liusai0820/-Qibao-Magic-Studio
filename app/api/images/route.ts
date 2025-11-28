import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET: 获取当前用户的所有图片
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        images: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    })

    if (!user) {
      return NextResponse.json({ images: [] })
    }

    const images = user.images.map((img) => ({
      id: img.id,
      url: img.url,
      prompt: img.prompt || '',
      theme: img.theme,
      timestamp: img.createdAt.getTime(),
    }))

    return NextResponse.json({ images })
  } catch (error) {
    console.error('获取图片失败:', error)
    return NextResponse.json({ error: '获取图片失败' }, { status: 500 })
  }
}

// POST: 保存新图片
export async function POST(request: Request) {
  try {
    const authResult = await auth()
    const { userId } = authResult
    
    console.log('POST /api/images - 完整认证结果:', { userId, sessionId: authResult.sessionId })
    
    if (!userId) {
      console.error('POST /api/images - 未授权，userId 为空', authResult)
      return NextResponse.json({ error: '未授权，请先登录' }, { status: 401 })
    }

    const body = await request.json()
    const { url, prompt, theme, style } = body
    console.log('POST /api/images - 接收数据:', { url: url?.substring(0, 50), prompt: prompt?.substring(0, 50), theme, style })

    // 确保用户存在（如果不存在则创建）
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      user = await prisma.user.create({
        data: { clerkId: userId },
      })
    }

    // 创建图片记录
    const image = await prisma.image.create({
      data: {
        url,
        prompt,
        theme,
        style: style || 'claymation',
        userId: user.id,
      },
    })

    console.log('POST /api/images - 图片已保存:', image.id)
    return NextResponse.json({
      id: image.id,
      url: image.url,
      prompt: image.prompt,
      theme: image.theme,
      timestamp: image.createdAt.getTime(),
    })
  } catch (error) {
    console.error('保存图片失败:', error)
    return NextResponse.json({ error: '保存图片失败', details: String(error) }, { status: 500 })
  }
}

// DELETE: 删除图片
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('id')

    if (!imageId) {
      return NextResponse.json({ error: '缺少图片ID' }, { status: 400 })
    }

    // 验证图片属于当前用户
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const image = await prisma.image.findFirst({
      where: {
        id: imageId,
        userId: user.id,
      },
    })

    if (!image) {
      return NextResponse.json({ error: '图片不存在或无权删除' }, { status: 404 })
    }

    await prisma.image.delete({
      where: { id: imageId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除图片失败:', error)
    return NextResponse.json({ error: '删除图片失败' }, { status: 500 })
  }
}
