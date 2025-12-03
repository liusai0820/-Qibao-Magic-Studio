import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { Story } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const story: Story = await request.json()

    if (!story.title || !story.pages || story.pages.length === 0) {
      return NextResponse.json({ error: '故事数据不完整' }, { status: 400 })
    }

    // 获取或创建用户
    let user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
      user = await prisma.user.create({ data: { clerkId } })
    }

    // 保存故事
    const savedStory = await prisma.story.create({
      data: {
        title: story.title,
        childName: story.params.childName,
        age: story.params.age,
        theme: story.params.theme,
        artStyle: story.params.artStyle,
        specificNeeds: story.params.specificNeeds,
        userId: user.id,
        pages: {
          create: story.pages.map(page => ({
            pageNumber: page.pageNumber,
            text: page.text,
            imagePrompt: page.imagePrompt,
            imageUrl: page.imageUrl,
          })),
        },
      },
      include: { pages: true },
    })

    return NextResponse.json({ success: true, id: savedStory.id })
  } catch (error: any) {
    console.error('Save story error:', error)
    return NextResponse.json({ error: error.message || '保存故事失败' }, { status: 500 })
  }
}
