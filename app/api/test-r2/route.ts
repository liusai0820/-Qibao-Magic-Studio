import { NextRequest, NextResponse } from 'next/server'
import { uploadImageToR2, checkR2Connection } from '@/lib/r2-storage'

export async function GET(request: NextRequest) {
  try {
    // 检查 R2 连接
    console.log('🔍 检查 R2 连接...')
    const isConnected = await checkR2Connection()

    if (!isConnected) {
      return NextResponse.json(
        {
          success: false,
          message: 'R2 连接失败，请检查配置',
          config: {
            endpoint: process.env.R2_ENDPOINT,
            bucket: process.env.R2_BUCKET_NAME,
            hasAccessKey: !!process.env.R2_ACCESS_KEY_ID,
            hasSecretKey: !!process.env.R2_SECRET_ACCESS_KEY,
          },
        },
        { status: 500 }
      )
    }

    // 创建测试图片
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

    console.log('📤 上传测试图片到 R2...')
    const publicUrl = await uploadImageToR2(testImageBase64, `test/connection-test-${Date.now()}.png`)

    return NextResponse.json({
      success: true,
      message: 'R2 连接成功！',
      testImageUrl: publicUrl,
      config: {
        endpoint: process.env.R2_ENDPOINT,
        bucket: process.env.R2_BUCKET_NAME,
        publicDomain: process.env.NEXT_PUBLIC_R2_DOMAIN,
      },
    })
  } catch (error: any) {
    console.error('R2 测试失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'R2 测试失败',
        error: error.toString(),
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, filename } = await request.json()

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, message: '缺少 imageUrl 参数' },
        { status: 400 }
      )
    }

    console.log(`📤 上传图片: ${filename || 'unnamed'}`)
    const publicUrl = await uploadImageToR2(imageUrl, filename || `images/${Date.now()}.png`)

    return NextResponse.json({
      success: true,
      message: '图片上传成功',
      publicUrl,
    })
  } catch (error: any) {
    console.error('上传失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || '上传失败',
      },
      { status: 500 }
    )
  }
}
