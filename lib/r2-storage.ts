import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

// 初始化 R2 客户端
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
})

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'qibao'
const PUBLIC_DOMAIN = process.env.NEXT_PUBLIC_R2_DOMAIN || ''

/**
 * 上传 base64 图片到 R2
 */
export async function uploadImageToR2(
  base64Data: string,
  filename?: string
): Promise<string> {
  try {
    // 移除 data URI 前缀
    const imageData = base64Data.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(imageData, 'base64')

    // 生成文件名
    const key = filename || `images/${uuidv4()}.png`

    // 上传到 R2
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: 'image/png',
        CacheControl: 'public, max-age=31536000', // 1 年缓存
      })
    )

    // 返回公开 URL
    return `${PUBLIC_DOMAIN}/${key}`
  } catch (error) {
    console.error('R2 上传失败:', error)
    throw new Error('图片上传失败')
  }
}

/**
 * 从 R2 删除图片
 */
export async function deleteImageFromR2(key: string): Promise<void> {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    )
  } catch (error) {
    console.error('R2 删除失败:', error)
    throw new Error('图片删除失败')
  }
}

/**
 * 获取 R2 中的图片
 */
export async function getImageFromR2(key: string): Promise<Buffer> {
  try {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    )

    if (!response.Body) {
      throw new Error('无法读取图片')
    }

    const chunks: Uint8Array[] = []
    const reader = response.Body.getReader()

    let result = await reader.read()
    while (!result.done) {
      chunks.push(result.value)
      result = await reader.read()
    }

    return Buffer.concat(chunks)
  } catch (error) {
    console.error('R2 读取失败:', error)
    throw new Error('图片读取失败')
  }
}

/**
 * 检查 R2 连接
 */
export async function checkR2Connection(): Promise<boolean> {
  try {
    // 尝试上传一个小文件来测试连接
    const testKey = 'test/.connection-test'
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: testKey,
        Body: Buffer.from('test'),
      })
    )

    // 删除测试文件
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: testKey,
      })
    )

    return true
  } catch (error) {
    console.error('R2 连接测试失败:', error)
    return false
  }
}
