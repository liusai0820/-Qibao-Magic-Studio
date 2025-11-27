import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * 本地 upscale 图片 - 使用 canvas 进行 2x 放大
 */
export async function upscaleImage(imageUrl: string, scale: number = 2): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'use-credentials'
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('无法获取 canvas context'))
          return
        }

        // 设置新的尺寸
        canvas.width = img.width * scale
        canvas.height = img.height * scale

        // 使用高质量的图片缩放算法
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        // 转换为 base64
        const upscaledUrl = canvas.toDataURL('image/png', 0.95)
        resolve(upscaledUrl)
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('图片加载失败'))
    }

    img.src = imageUrl
  })
}

/**
 * 导出单张图片为 PDF
 */
export async function exportImageToPDF(
  imageUrl: string,
  filename: string = 'image.pdf',
  upscale: boolean = true
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // 如果需要 upscale，先进行处理
      const processImage = async () => {
        let finalImageUrl = imageUrl
        if (upscale) {
          try {
            finalImageUrl = await upscaleImage(imageUrl, 2)
          } catch (e) {
            console.warn('Upscale 失败，使用原图:', e)
          }
        }

        // 创建 PDF
        const img = new Image()
        img.crossOrigin = 'use-credentials'
        
        img.onload = () => {
          try {
            // A4 纸张尺寸：210mm x 297mm
            const pdfWidth = 210
            const pdfHeight = 297
            
            // 计算图片在 PDF 中的尺寸（保持宽高比）
            const imgAspectRatio = img.width / img.height
            const pdfAspectRatio = pdfWidth / pdfHeight
            
            let imgWidth = pdfWidth
            let imgHeight = pdfWidth / imgAspectRatio
            
            if (imgHeight > pdfHeight) {
              imgHeight = pdfHeight
              imgWidth = pdfHeight * imgAspectRatio
            }
            
            // 居中放置
            const x = (pdfWidth - imgWidth) / 2
            const y = (pdfHeight - imgHeight) / 2
            
            const pdf = new jsPDF({
              orientation: imgAspectRatio < 1 ? 'portrait' : 'landscape',
              unit: 'mm',
              format: 'a4',
            })
            
            pdf.addImage(finalImageUrl, 'PNG', x, y, imgWidth, imgHeight)
            pdf.save(filename)
            resolve()
          } catch (error) {
            reject(error)
          }
        }
        
        img.onerror = () => {
          reject(new Error('图片加载失败'))
        }
        
        img.src = finalImageUrl
      }

      processImage()
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 导出多张图片为 PDF（每页一张）
 */
export async function exportImagesToPDF(
  images: Array<{ url: string; theme: string }>,
  filename: string = 'images.pdf',
  upscale: boolean = true
): Promise<void> {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pdfWidth = 210
    const pdfHeight = 297

    for (let i = 0; i < images.length; i++) {
      const imageData = images[i]
      
      // 如果需要 upscale
      let finalImageUrl = imageData.url
      if (upscale) {
        finalImageUrl = await upscaleImage(imageData.url, 2)
      }

      // 加载图片
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          const imgAspectRatio = img.width / img.height
          
          let imgWidth = pdfWidth - 20 // 留边距
          let imgHeight = imgWidth / imgAspectRatio
          
          if (imgHeight > pdfHeight - 40) {
            imgHeight = pdfHeight - 40
            imgWidth = imgHeight * imgAspectRatio
          }
          
          const x = (pdfWidth - imgWidth) / 2
          const y = 20
          
          // 添加标题
          pdf.setFontSize(14)
          pdf.text(`《${imageData.theme}》`, pdfWidth / 2, 10, { align: 'center' })
          
          // 添加图片
          pdf.addImage(finalImageUrl, 'PNG', x, y, imgWidth, imgHeight)
          
          // 添加页码
          pdf.setFontSize(10)
          pdf.text(`第 ${i + 1} 页`, pdfWidth / 2, pdfHeight - 5, { align: 'center' })
          
          // 如果不是最后一张，添加新页
          if (i < images.length - 1) {
            pdf.addPage()
          }
          
          resolve(null)
        }
        
        img.onerror = () => reject(new Error('图片加载失败'))
        img.src = finalImageUrl
      })
    }

    pdf.save(filename)
  } catch (error) {
    console.error('PDF 导出失败:', error)
    throw error
  }
}

/**
 * 下载 upscale 后的图片
 */
export async function downloadUpscaledImage(
  imageUrl: string,
  filename: string = 'image-upscaled.png',
  scale: number = 2
): Promise<void> {
  try {
    const upscaledUrl = await upscaleImage(imageUrl, scale)
    
    const link = document.createElement('a')
    link.href = upscaledUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('下载失败:', error)
    throw error
  }
}
