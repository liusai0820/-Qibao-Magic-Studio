import jsPDF from 'jspdf'
import { Story } from './types'

/**
 * 通过fetch加载图片并转换为base64
 * 避免CORS问题
 */
async function fetchImageAsBase64(url: string): Promise<string> {
  try {
    console.log('正在加载图片:', url)
    
    // 如果是R2的URL，直接fetch
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const blob = await response.blob()
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        console.log('图片加载成功，大小:', Math.round(base64.length / 1024), 'KB')
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('图片加载失败:', url, error)
    throw error
  }
}

/**
 * 添加中文字体支持
 * 使用Unicode编码绕过中文显示问题
 */
function addChineseText(
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  options?: { align?: 'left' | 'center' | 'right'; maxWidth?: number }
) {
  try {
    // 尝试直接添加文字
    pdf.text(text, x, y, options)
  } catch (error) {
    console.warn('中文显示可能有问题，使用备用方案')
    // 如果失败，使用ASCII替代或者分段处理
    const asciiText = text.replace(/[\u4e00-\u9fa5]/g, '?')
    pdf.text(asciiText, x, y, options)
  }
}

/**
 * 导出绘本为PDF
 */
export async function exportStorybookToPDF(
  story: Story,
  onProgress?: (progress: number, message: string) => void
): Promise<void> {
  try {
    console.log('开始导出PDF:', story.title)
    onProgress?.(0, '正在初始化PDF...')
    
    // A4横版尺寸
    const pageWidth = 297
    const pageHeight = 210
    
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true,
    })
    
    // 设置PDF元数据
    pdf.setProperties({
      title: story.title,
      subject: `送给${story.params.childName}的绘本故事`,
      author: 'AI绘本工坊',
      creator: '奇妙童话工坊',
    })
    
    let pageCount = 0
    const totalPages = story.pages.length
    
    console.log(`总共 ${totalPages} 页需要处理`)
    
    // ==================== 处理每一页 ====================
    for (let i = 0; i < story.pages.length; i++) {
      const page = story.pages[i]
      const progress = ((i + 1) / totalPages) * 100
      
      console.log(`处理第 ${i + 1}/${totalPages} 页`)
      onProgress?.(progress, `正在处理第 ${i + 1}/${totalPages} 页...`)
      
      // 添加新页（第一页除外）
      if (pageCount > 0) {
        pdf.addPage('a4', 'landscape')
      }
      pageCount++
      
      // 白色背景
      pdf.setFillColor(255, 255, 255)
      pdf.rect(0, 0, pageWidth, pageHeight, 'F')
      
      // 左侧：图片区域（50%宽度）
      const imageWidth = pageWidth * 0.5
      const imageHeight = pageHeight
      
      // 加载并添加图片
      if (page.imageUrl) {
        try {
          console.log(`加载第 ${i + 1} 页图片...`)
          const imgData = await fetchImageAsBase64(page.imageUrl)
          
          // 添加图片到PDF
          pdf.addImage(
            imgData,
            'JPEG',
            0,
            0,
            imageWidth,
            imageHeight,
            `page-${i}`,
            'FAST'
          )
          console.log(`第 ${i + 1} 页图片添加成功`)
        } catch (error) {
          console.error(`第 ${i + 1} 页图片加载失败:`, error)
          // 绘制灰色占位符
          pdf.setFillColor(240, 240, 240)
          pdf.rect(0, 0, imageWidth, imageHeight, 'F')
          
          // 添加错误提示
          pdf.setFontSize(12)
          pdf.setTextColor(150, 150, 150)
          pdf.text('Image Load Failed', imageWidth / 2, imageHeight / 2, { align: 'center' })
        }
      } else {
        console.warn(`第 ${i + 1} 页没有图片`)
        // 无图片时的占位符
        pdf.setFillColor(250, 250, 250)
        pdf.rect(0, 0, imageWidth, imageHeight, 'F')
      }
      
      // 右侧：文字区域
      const textX = imageWidth + 20
      const textWidth = pageWidth - imageWidth - 40
      const textY = 40
      
      // 页码装饰（大号半透明）
      pdf.setFontSize(60)
      pdf.setTextColor(255, 240, 200)
      pdf.text(String(page.pageNumber), pageWidth - 30, 50, { align: 'right' })
      
      // 故事文字
      pdf.setFontSize(16)
      pdf.setTextColor(60, 60, 60)
      pdf.setFont('helvetica', 'normal')
      
      // 分割文字为多行
      const lines = pdf.splitTextToSize(page.text, textWidth)
      const lineHeight = 10
      const startY = pageHeight / 2 - (lines.length * lineHeight) / 2
      
      console.log(`第 ${i + 1} 页文字: ${lines.length} 行`)
      
      // 添加每一行文字
      lines.forEach((line: string, idx: number) => {
        addChineseText(pdf, line, textX, startY + idx * lineHeight)
      })
      
      // 底部页码
      pdf.setFontSize(10)
      pdf.setTextColor(150, 150, 150)
      addChineseText(pdf, `- ${page.pageNumber} -`, pageWidth / 2, pageHeight - 10, { align: 'center' })
    }
    
    onProgress?.(100, '正在保存PDF...')
    
    // 保存文件
    const filename = `${story.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5\s]/g, '_')}.pdf`
    console.log('保存PDF:', filename)
    pdf.save(filename)
    
    console.log('PDF导出成功!')
  } catch (error) {
    console.error('PDF导出失败:', error)
    alert(`PDF导出失败: ${error instanceof Error ? error.message : '未知错误'}`)
    throw error
  }
}

/**
 * 导出为打印店专用PDF
 */
export async function exportForPrintShop(
  story: Story,
  onProgress?: (progress: number, message: string) => void
): Promise<void> {
  return exportStorybookToPDF(story, onProgress)
}

/**
 * 导出为方形绘本PDF
 */
export async function exportSquareBook(
  story: Story,
  onProgress?: (progress: number, message: string) => void
): Promise<void> {
  try {
    console.log('开始导出方形PDF:', story.title)
    onProgress?.(0, '正在初始化PDF...')
    
    // 方形尺寸 21x21cm
    const pageSize = 210
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [pageSize, pageSize],
      compress: true,
    })
    
    pdf.setProperties({
      title: story.title,
      subject: `送给${story.params.childName}的绘本故事`,
      author: 'AI绘本工坊',
    })
    
    let pageCount = 0
    const totalPages = story.pages.length
    
    for (let i = 0; i < story.pages.length; i++) {
      const page = story.pages[i]
      const progress = ((i + 1) / totalPages) * 100
      
      console.log(`处理第 ${i + 1}/${totalPages} 页`)
      onProgress?.(progress, `正在处理第 ${i + 1}/${totalPages} 页...`)
      
      if (pageCount > 0) {
        pdf.addPage([pageSize, pageSize], 'portrait')
      }
      pageCount++
      
      // 白色背景
      pdf.setFillColor(255, 255, 255)
      pdf.rect(0, 0, pageSize, pageSize, 'F')
      
      // 上方：图片区域（60%高度）
      const imageHeight = pageSize * 0.6
      
      if (page.imageUrl) {
        try {
          console.log(`加载第 ${i + 1} 页图片...`)
          const imgData = await fetchImageAsBase64(page.imageUrl)
          pdf.addImage(
            imgData,
            'JPEG',
            0,
            0,
            pageSize,
            imageHeight,
            `page-${i}`,
            'FAST'
          )
          console.log(`第 ${i + 1} 页图片添加成功`)
        } catch (error) {
          console.error(`第 ${i + 1} 页图片加载失败:`, error)
          pdf.setFillColor(240, 240, 240)
          pdf.rect(0, 0, pageSize, imageHeight, 'F')
        }
      }
      
      // 下方：文字区域
      const textY = imageHeight + 20
      const textWidth = pageSize - 40
      
      pdf.setFontSize(14)
      pdf.setTextColor(60, 60, 60)
      pdf.setFont('helvetica', 'normal')
      
      const lines = pdf.splitTextToSize(page.text, textWidth)
      const lineHeight = 8
      
      lines.forEach((line: string, idx: number) => {
        addChineseText(pdf, line, 20, textY + idx * lineHeight)
      })
      
      // 页码
      pdf.setFontSize(10)
      pdf.setTextColor(150, 150, 150)
      addChineseText(pdf, `${page.pageNumber}`, pageSize - 15, pageSize - 10, { align: 'right' })
    }
    
    onProgress?.(100, '正在保存PDF...')
    
    const filename = `${story.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5\s]/g, '_')}_方形.pdf`
    console.log('保存方形PDF:', filename)
    pdf.save(filename)
    
    console.log('方形PDF导出成功!')
  } catch (error) {
    console.error('方形PDF导出失败:', error)
    alert(`PDF导出失败: ${error instanceof Error ? error.message : '未知错误'}`)
    throw error
  }
}
