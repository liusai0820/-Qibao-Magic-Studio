import { prisma } from './db'

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface GenerationJob {
  id: string
  userId: string
  theme: string
  style: string
  status: JobStatus
  imageUrl?: string
  error?: string
  createdAt: Date
  updatedAt: Date
}

/**
 * 创建生成任务
 */
export async function createGenerationJob(
  userId: string,
  theme: string,
  style: string
): Promise<string> {
  const job = await prisma.generationJob.create({
    data: {
      userId,
      theme,
      style,
      status: 'pending',
    },
  })
  return job.id
}

/**
 * 获取任务状态
 */
export async function getJobStatus(jobId: string): Promise<GenerationJob | null> {
  const job = await prisma.generationJob.findUnique({
    where: { id: jobId },
  })
  return job as GenerationJob | null
}

/**
 * 更新任务状态
 */
export async function updateJobStatus(
  jobId: string,
  status: JobStatus,
  imageUrl?: string,
  error?: string
): Promise<void> {
  await prisma.generationJob.update({
    where: { id: jobId },
    data: {
      status,
      imageUrl,
      error,
      updatedAt: new Date(),
    },
  })
}
