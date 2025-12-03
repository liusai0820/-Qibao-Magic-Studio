import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

async function fetchImageAsBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`)
  return Buffer.from(await response.arrayBuffer())
}

// 获取思源黑体字体（支持中文）
async function fetchChineseFont(): Promise<ArrayBuffer | null> {
  try {
    // 使用 Google Fonts 的思源黑体
    const fontUrl = 'https://cdn.jsdelivr.net/gh/AaronFeng753/Waifu2x-Extension-GUI@master/SRC/Waifu2x-Extension-QT/fonts/NotoSansSC-Regular.otf'
    const response = await fetch(fontUrl)
    if (!response.ok) return null
    return await response.arrayBuffer()
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { story, format = 'landscape' } = await request.json()
    if (!story || !story.pages) {
      return NextResponse.json({ error: '缺少故事数据' }, { status: 400 })
    }

    console.log('[PDF] 开始生成:', story.title, '页数:', story.pages.length)

    // A4尺寸（点）
    const pageWidth = format === 'landscape' ? 841.89 : 595.28
    const pageHeight = format === 'landscape' ? 595.28 : 841.89

    const pdf = await PDFDocument.create()
    pdf.registerFontkit(fontkit)
    
    // 加载中文字体
    let chineseFont: PDFFont
    const fontData = await fetchChineseFont()
    if (fontData) {
      chineseFont = await pdf.embedFont(fontData)
      console.log('[PDF] 中文字体加载成功')
    } else {
      console.log('[PDF] 中文字体加载失败，使用默认字体')
      chineseFont = await pdf.embedFont(StandardFonts.Helvetica)
    }

    pdf.setTitle(story.title)
    pdf.setAuthor('AI绘本工坊')

    // 辅助函数：分割文本为多行
    const splitTextToLines = (text: string, maxWidth: number, fontSize: number): string[] => {
      const lines: string[] = []
      const charWidth = fontSize * 0.5 // 估算字符宽度
      const maxChars = Math.floor(maxWidth / charWidth)
      
      let remaining = text
      while (remaining.length > 0) {
        if (remaining.length <= maxChars) {
          lines.push(remaining)
          break
        }
        // 找到合适的断点
        let breakPoint = maxChars
        const spaceIndex = remaining.lastIndexOf(' ', maxChars)
        if (spaceIndex > maxChars * 0.5) {
          breakPoint = spaceIndex
        }
        lines.push(remaining.substring(0, breakPoint))
        remaining = remaining.substring(breakPoint).trim()
      }
      return lines
    }

    // 处理所有页面（包括封面和封底）
    for (let i = 0; i < story.pages.length; i++) {
      const storyPage = story.pages[i]
      const isCover = i === 0
      const isBackCover = i === story.pages.length - 1
      
      console.log(`[PDF] 处理第 ${i + 1} 页, 封面:${isCover}, 封底:${isBackCover}`)

      const page = pdf.addPage([pageWidth, pageHeight])

      // 白色背景
      page.drawRectangle({
        x: 0, y: 0, width: pageWidth, height: pageHeight,
        color: rgb(1, 1, 1)
      })

      if (format === 'landscape') {
        // 横版布局：左图右文
        const imageAreaWidth = pageWidth * 0.5
        const imageAreaHeight = pageHeight

        // 添加图片（保持1:1比例）
        if (storyPage.imageUrl) {
          try {
            const imageBuffer = await fetchImageAsBuffer(storyPage.imageUrl)
            let image
            if (storyPage.imageUrl.includes('.png') || storyPage.imageUrl.includes('png')) {
              image = await pdf.embedPng(imageBuffer)
            } else {
              try {
                image = await pdf.embedPng(imageBuffer)
              } catch {
                image = await pdf.embedJpg(imageBuffer)
              }
            }
            
            // 方形图片，保持比例
            const imgSize = Math.min(imageAreaWidth - 20, imageAreaHeight - 20)
            const imgX = (imageAreaWidth - imgSize) / 2
            const imgY = (imageAreaHeight - imgSize) / 2
            
            page.drawImage(image, {
              x: imgX,
              y: imgY,
              width: imgSize,
              height: imgSize,
            })
            console.log(`[PDF] 第 ${i + 1} 页图片OK`)
          } catch (error) {
            console.error(`[PDF] 第 ${i + 1} 页图片失败:`, error)
            // 灰色占位
            page.drawRectangle({
              x: 10, y: 10, width: imageAreaWidth - 20, height: imageAreaHeight - 20,
              color: rgb(0.94, 0.94, 0.94)
            })
          }
        }

        // 右侧文字区域
        const textX = imageAreaWidth + 30
        const textWidth = pageWidth - imageAreaWidth - 60

        // 封面特殊处理
        if (isCover) {
          // 标题（不用书名号）
          const titleSize = 32
          const titleLines = splitTextToLines(story.title, textWidth, titleSize)
          titleLines.forEach((line, idx) => {
            page.drawText(line, {
              x: textX,
              y: pageHeight / 2 + 40 - idx * (titleSize + 8),
              size: titleSize,
              font: chineseFont,
              color: rgb(0.55, 0.27, 0.07),
            })
          })
          
          // 献给
          page.drawText(`献给 ${story.params?.childName || '小朋友'}`, {
            x: textX,
            y: pageHeight / 2 - 40,
            size: 16,
            font: chineseFont,
            color: rgb(0.4, 0.3, 0.2),
          })
        }
        // 封底特殊处理
        else if (isBackCover) {
          page.drawText('~ 完 ~', {
            x: textX,
            y: pageHeight / 2 + 20,
            size: 28,
            font: chineseFont,
            color: rgb(0.4, 0.4, 0.4),
          })
          
          page.drawText('AI绘本工坊', {
            x: textX,
            y: pageHeight / 2 - 30,
            size: 14,
            font: chineseFont,
            color: rgb(0.6, 0.6, 0.6),
          })
        }
        // 普通内容页
        else {
          const fontSize = 16
          const lineHeight = fontSize + 10
          const lines = splitTextToLines(storyPage.text || '', textWidth, fontSize)
          const startY = pageHeight / 2 + (lines.length * lineHeight) / 2
          
          lines.forEach((line, idx) => {
            page.drawText(line, {
              x: textX,
              y: startY - idx * lineHeight,
              size: fontSize,
              font: chineseFont,
              color: rgb(0.24, 0.24, 0.24),
            })
          })
        }

        // 页码
        page.drawText(`${i + 1}`, {
          x: pageWidth - 40,
          y: 20,
          size: 12,
          font: chineseFont,
          color: rgb(0.7, 0.7, 0.7),
        })
      } else {
        // 竖版布局：上图下文
        const imageAreaHeight = pageHeight * 0.55
        const imgSize = Math.min(pageWidth - 40, imageAreaHeight - 40)
        const imgX = (pageWidth - imgSize) / 2
        const imgY = pageHeight - imgSize - 30
        
        if (storyPage.imageUrl) {
          try {
            const imageBuffer = await fetchImageAsBuffer(storyPage.imageUrl)
            let image
            try {
              image = await pdf.embedPng(imageBuffer)
            } catch {
              image = await pdf.embedJpg(imageBuffer)
            }
            
            page.drawImage(image, {
              x: imgX,
              y: imgY,
              width: imgSize,
              height: imgSize,
            })
          } catch (error) {
            console.error(`[PDF] 第 ${i + 1} 页图片失败:`, error)
          }
        }

        const textY = imgY - 40
        const textWidth = pageWidth - 60

        if (isCover) {
          const titleSize = 28
          const titleLines = splitTextToLines(story.title, textWidth, titleSize)
          titleLines.forEach((line, idx) => {
            page.drawText(line, {
              x: 30,
              y: textY - idx * (titleSize + 8),
              size: titleSize,
              font: chineseFont,
              color: rgb(0.55, 0.27, 0.07),
            })
          })
        } else if (isBackCover) {
          page.drawText('~ 完 ~', {
            x: 30,
            y: textY,
            size: 24,
            font: chineseFont,
            color: rgb(0.4, 0.4, 0.4),
          })
        } else {
          const fontSize = 14
          const lineHeight = fontSize + 8
          const lines = splitTextToLines(storyPage.text || '', textWidth, fontSize)
          
          lines.forEach((line, idx) => {
            page.drawText(line, {
              x: 30,
              y: textY - idx * lineHeight,
              size: fontSize,
              font: chineseFont,
              color: rgb(0.24, 0.24, 0.24),
            })
          })
        }

        // 页码
        page.drawText(`${i + 1}`, {
          x: pageWidth - 40,
          y: 20,
          size: 12,
          font: chineseFont,
          color: rgb(0.7, 0.7, 0.7),
        })
      }
    }

    const pdfBytes = await pdf.save()
    const pdfBuffer = Buffer.from(pdfBytes)
    console.log('[PDF] 生成成功，大小:', Math.round(pdfBuffer.length / 1024), 'KB')

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(story.title)}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error: any) {
    console.error('[PDF] 失败:', error)
    return NextResponse.json({ error: error.message || 'PDF生成失败' }, { status: 500 })
  }
}
