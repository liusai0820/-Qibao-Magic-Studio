// 此路由已弃用，请使用 /api/generate/direct
// 保留此文件以避免 404 错误

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: '请使用 /api/generate/direct 路由' },
    { status: 410 }
  )
}
