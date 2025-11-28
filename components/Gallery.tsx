'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Clock, Star, Eye } from 'lucide-react'
import { GeneratedImage } from '@/lib/types'
import { PreviewModal } from './PreviewModal'

interface GalleryProps {
  images: GeneratedImage[]
}

export function Gallery({ images }: GalleryProps) {
  const [previewImage, setPreviewImage] = useState<GeneratedImage | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleDownload = async (imageUrl: string, id: string, theme: string) => {
    try {
      setDownloadingId(id)
      console.log('开始下载:', imageUrl, '主题:', theme)
      
      // 确保 theme 不为空，否则使用 ID
      const fileName = theme && theme.trim() ? theme : `qibao-${id}`
      
      // 使用后端代理 API 下载，传递主题作为文件名
      const downloadUrl = `/api/download?url=${encodeURIComponent(imageUrl)}&name=${encodeURIComponent(fileName)}`
      
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${fileName}.png`
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      
      setTimeout(() => {
        document.body.removeChild(link)
        setDownloadingId(null)
      }, 500)
    } catch (error) {
      console.error('下载失败:', error)
      alert('下载失败: ' + (error instanceof Error ? error.message : '未知错误'))
      setDownloadingId(null)
    }
  }

  const handlePreview = (image: GeneratedImage) => {
    setPreviewImage(image)
    setIsPreviewOpen(true)
  }

  // 处理 ESC 键关闭预览
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isPreviewOpen) {
      setIsPreviewOpen(false)
    }
  }

  if (images.length === 0) return null

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-16" onKeyDown={handleKeyDown} tabIndex={0}>
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
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent 
                                opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto"
                       onClick={() => handlePreview(img)}
                       style={{ cursor: 'pointer' }}>
                    <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2">
                      <div className="grid grid-cols-2 gap-2">
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
                            const theme = img.theme || `qibao-${img.id}`
                            handleDownload(img.url, img.id, theme)
                          }}
                          disabled={downloadingId === img.id}
                          className={`px-3 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-1 cursor-pointer transition-all ${
                            downloadingId === img.id
                              ? 'bg-green-500 text-white'
                              : 'bg-amber-400/95 text-white hover:bg-amber-500'
                          }`}
                        >
                          <Download className="w-3 h-3" />
                          {downloadingId === img.id ? '下载中...' : '下载'}
                        </button>
                      </div>
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
