import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createGenerationJob } from '@/lib/job-queue'

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

    // 快速返回：创建任务并立即返回
    // 实际的生成会在后台处理（通过 Supabase Edge Functions 或定时任务）
    const jobId = await createGenerationJob(userId, theme, style)
    
    console.log('创建生成任务:', { jobId, userId, theme, style })

    return NextResponse.json({
      jobId,
      status: 'pending',
      message: '任务已创建，正在生成中...',
    })
  } catch (error: any) {
    console.error('创建任务失败:', error)
    return NextResponse.json(
      { error: error.message || '创建任务失败' },
      { status: 500 }
    )
  }
}
