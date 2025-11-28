import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getJobStatus } from '@/lib/job-queue'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json({ error: '缺少 jobId' }, { status: 400 })
    }

    const job = await getJobStatus(jobId)

    if (!job) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 })
    }

    // 验证任务属于当前用户
    if (job.userId !== userId) {
      return NextResponse.json({ error: '无权访问此任务' }, { status: 403 })
    }

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      imageUrl: job.imageUrl,
      error: job.error,
      theme: job.theme,
      style: job.style,
    })
  } catch (error: any) {
    console.error('查询任务状态失败:', error)
    return NextResponse.json(
      { error: error.message || '查询失败' },
      { status: 500 }
    )
  }
}
