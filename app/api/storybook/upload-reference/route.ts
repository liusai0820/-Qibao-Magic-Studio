import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { uploadImageToR2 } from '@/lib/r2-storage'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json({ error: '请上传图片' }, { status: 400 })
    }

    // 转换为base64
    const bytes = await file.arrayBuffer()
    const base64 = `data:${file.type};base64,${Buffer.from(bytes).toString('base64')}`

    // 上传到R2
    const filename = `storybook/${userId}/references/${Date.now()}.png`
    const url = await uploadImageToR2(base64, filename)

    return NextResponse.json({ url })
  } catch (error: any) {
    console.error('Upload reference error:', error)
    return NextResponse.json({ error: error.message || '上传失败' }, { status: 500 })
  }
}
