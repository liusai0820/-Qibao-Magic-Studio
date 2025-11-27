'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Clock, Star, Eye, FileText, Zap } from 'lucide-react'
import { GeneratedImage } from '@/lib/types'
import { PreviewModal } from './PreviewModal'
import { downloadUpscaledImage, exportImageToPDF } from '@/lib/export'

interface GalleryProps {
  images: GeneratedImage[]
}

export function Gallery({ images }: GalleryProps) {
  const [previewImage, setPreviewImage] = useState<GeneratedImage | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const handleDownload = async (imageUrl: string, id: string) => {
    try {
      // 如果是 base64，直接下载
      if (imageUrl.startsWith('data:')) {
        const link = document.createElement('a')
        link.href = imageUrl
        link.download = `clay-magic-${id}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        return
      }

      // 如果是 URL，先 fetch 再下载
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `clay-magic-${id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('下载失败:', error)
      alert('下载失败，请重试')
    }
  }

  const handleUpscale = async (imageUrl: string, id: string) => {
    try {
      await downloadUpscaledImage(imageUrl, `clay-magic-${id}-upscaled.png`, 2)
    } catch (error) {
      console.error('Upscale 失败:', error)
      alert('Upscale 失败，请重试')
    }
  }

  const handleExportPDF = async (image: GeneratedImage) => {
    try {
      await exportImageToPDF(image.url, `${image.theme}.pdf`, true)
    } catch (error) {
      console.error('PDF 导出失败:', error)
      alert('PDF 导出失败，请重试')
    }
  }

  const handlePreview = (image: GeneratedImage) => {
    setPreviewImage(image)
    setIsPreviewOpen(true)
  }

  if (images.length === 0) return null

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-700 flex items-center justify-center gap-3">
          <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
          你的作品集
          <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
        </h2>
        <p className="text-slate-400 mt-2">共 {images.length} 幅作品</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
        <AnimatePresence>
          {images.map((img, index) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="card-clay shadow-lg hover:shadow-xl">
                <div className="relative bg-gradient-to-br from-amber-50 to-rose-50 overflow-hidden rounded-2xl">
                  <img
                    src={img.url}
                    alt={img.theme}
                    className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Clickable overlay for preview */}
                  <button
                    onClick={() => handlePreview(img)}
                    className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent 
                                opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
                    <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2">
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handlePreview(img)
                          }}
                          className="px-3 py-2 bg-white/95 text-slate-700 rounded-lg font-medium text-sm hover:bg-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          预览
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDownload(img.url, img.id)
                          }}
                          className="px-3 py-2 bg-white/95 text-slate-700 rounded-lg font-medium text-sm hover:bg-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          保存
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleUpscale(img.url, img.id)
                          }}
                          className="px-3 py-2 bg-amber-400/95 text-white rounded-lg font-medium text-sm hover:bg-amber-500 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Zap className="w-3 h-3" />
                          高清
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleExportPDF(img)
                        }}
                        className="w-full px-3 py-2 bg-rose-400/95 text-white rounded-lg font-medium text-sm hover:bg-rose-500 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3 h-3" />
                        导出 PDF
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-display font-bold text-slate-700 truncate flex-1">
                      《{img.theme}》
                    </h3>
                    <span className="flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg ml-2">
                      <Clock className="w-3 h-3" />
                      {new Date(img.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        image={previewImage}
      />
    </section>
  )
}
