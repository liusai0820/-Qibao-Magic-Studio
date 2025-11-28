import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')
    const fileName = searchParams.get('name') || '奇妙认知海报'

    if (!imageUrl) {
      return NextResponse.json({ error: '缺少图片 URL' }, { status: 400 })
    }

    console.log('下载代理:', imageUrl, '文件名:', fileName)

    // 生成带时间戳的文件名
    const timestamp = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    const finalFileName = `${fileName}-${timestamp}.png`

    // 如果是 base64，直接返回
    if (imageUrl.startsWith('data:')) {
      const [header, data] = imageUrl.split(',')
      const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png'
      const buffer = Buffer.from(data, 'base64')
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': `attachment; filename="${encodeURIComponent(finalFileName)}"`,
          'Content-Length': buffer.length.toString(),
        },
      })
    }

    // 如果是 URL，从 R2 获取
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      console.error('R2 响应错误:', response.status, response.statusText)
      return NextResponse.json(
        { error: `无法获取图片: ${response.status}` },
        { status: response.status }
      )
    }

    const buffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/png'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(finalFileName)}"`,
        'Content-Length': buffer.byteLength.toString(),
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('下载代理错误:', error)
    return NextResponse.json(
      { error: '下载失败: ' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    )
  }
}
