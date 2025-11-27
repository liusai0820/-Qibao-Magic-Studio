'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { loadImagesFromStorage, saveImagesToStorage } from '@/lib/storage'
import { GeneratedImage } from '@/lib/types'

export default function MigratePage() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'migrating' | 'done'>('idle')
  const [message, setMessage] = useState('')
  const [localImages, setLocalImages] = useState<GeneratedImage[]>([])
  const [migratedCount, setMigratedCount] = useState(0)

  const handleTestConnection = async () => {
    setStatus('testing')
    setMessage('🔍 测试 R2 连接中...')

    try {
      const response = await fetch('/api/test-r2')
      const data = await response.json()

      if (data.success) {
        setMessage(`✅ R2 连接成功！\n📍 Endpoint: ${data.config.endpoint}\n🪣 Bucket: ${data.config.bucket}`)
      } else {
        setMessage(`❌ 连接失败: ${data.message}`)
      }
    } catch (error: any) {
      setMessage(`❌ 错误: ${error.message}`)
    } finally {
      setStatus('idle')
    }
  }

  const handleLoadLocalImages = () => {
    const images = loadImagesFromStorage()
    setLocalImages(images)
    setMessage(`📊 找到 ${images.length} 张本地图片`)
  }

  const handleMigrateImages = async () => {
    if (localImages.length === 0) {
      setMessage('❌ 没有本地图片可迁移')
      return
    }

    setStatus('migrating')
    setMessage(`🚀 开始迁移 ${localImages.length} 张图片...`)
    setMigratedCount(0)

    const migratedImages: GeneratedImage[] = []

    for (let i = 0; i < localImages.length; i++) {
      const image = localImages[i]

      try {
        setMessage(`⏳ 正在迁移 [${i + 1}/${localImages.length}] ${image.theme}...`)

        const response = await fetch('/api/test-r2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: image.url,
            filename: `migrated/${image.id}-${image.theme}.png`,
          }),
        })

        const data = await response.json()

        if (data.success) {
          const migratedImage: GeneratedImage = {
            ...image,
            url: data.publicUrl,
          }
          migratedImages.push(migratedImage)
          setMigratedCount(i + 1)
          setMessage(`✅ 已迁移 [${i + 1}/${localImages.length}] ${image.theme}`)
        } else {
          setMessage(`⚠️ 迁移失败 [${image.theme}]: ${data.message}`)
        }
      } catch (error: any) {
        setMessage(`❌ 错误 [${image.theme}]: ${error.message}`)
      }
    }

    // 保存迁移后的图片
    if (migratedImages.length > 0) {
      saveImagesToStorage(migratedImages)
      setMessage(`✅ 迁移完成！成功: ${migratedCount}/${localImages.length}`)
    }

    setStatus('done')
  }

  return (
    <div className="min-h-screen bg-cream p-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lg p-8 border-4 border-white"
        >
          <h1 className="text-3xl font-bold text-slate-800 mb-2 font-display">
            🚀 R2 迁移工具
          </h1>
          <p className="text-slate-500 mb-8">
            将本地存储的图片迁移到 Cloudflare R2
          </p>

          {/* Status Message */}
          <div className="bg-slate-50 rounded-2xl p-6 mb-8 min-h-24 flex items-center">
            <p className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
              {message || '准备就绪'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button
              onClick={handleTestConnection}
              disabled={status !== 'idle'}
              className="w-full"
              size="lg"
            >
              🔍 测试 R2 连接
            </Button>

            <Button
              onClick={handleLoadLocalImages}
              disabled={status !== 'idle'}
              variant="secondary"
              className="w-full"
              size="lg"
            >
              📊 加载本地图片
            </Button>

            {localImages.length > 0 && (
              <>
                <div className="bg-amber-50 rounded-2xl p-4 text-center">
                  <p className="text-sm font-bold text-amber-700">
                    找到 {localImages.length} 张本地图片
                  </p>
                </div>

                <Button
                  onClick={handleMigrateImages}
                  disabled={status !== 'idle' || localImages.length === 0}
                  loading={status === 'migrating'}
                  className="w-full bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600"
                  size="lg"
                >
                  🚀 开始迁移
                </Button>
              </>
            )}
          </div>

          {/* Local Images List */}
          {localImages.length > 0 && (
            <div className="mt-8 pt-8 border-t-2 border-slate-100">
              <h2 className="text-lg font-bold text-slate-700 mb-4">本地图片列表</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {localImages.map((img, idx) => (
                  <div
                    key={img.id}
                    className="flex items-center justify-between bg-slate-50 p-3 rounded-lg text-sm"
                  >
                    <span className="text-slate-700 font-medium">
                      {idx + 1}. {img.theme}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(img.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
