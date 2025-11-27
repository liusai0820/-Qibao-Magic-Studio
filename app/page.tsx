'use client'

import { useState, useCallback, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Header } from '@/components/Header'
import { GeneratorForm } from '@/components/GeneratorForm'
import { Gallery } from '@/components/Gallery'
import { EmptyState } from '@/components/EmptyState'
import { Footer } from '@/components/Footer'
import { AppState, GeneratedImage } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X } from 'lucide-react'

export default function Home() {
  const { isLoaded, isSignedIn } = useUser()
  const [appState, setAppState] = useState<AppState>(AppState.IDLE)
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 从数据库加载图片
  useEffect(() => {
    async function loadImages() {
      if (!isLoaded || !isSignedIn) {
        setIsHydrated(true)
        return
      }

      try {
        const response = await fetch('/api/images')
        if (response.ok) {
          const data = await response.json()
          setImages(data.images || [])
        }
      } catch (err) {
        console.error('加载图片失败:', err)
      } finally {
        setIsHydrated(true)
      }
    }

    loadImages()
  }, [isLoaded, isSignedIn])

  const handleGenerate = useCallback(async (theme: string, style: string = 'claymation') => {
    setError(null)
    setAppState(AppState.BRAINSTORMING)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, style }),
      })

      setAppState(AppState.GENERATING)

      let data
      try {
        data = await response.json()
      } catch (e) {
        throw new Error(`API 响应错误: ${response.status}`)
      }

      if (!response.ok) {
        throw new Error(data?.error || `生成失败 (${response.status})`)
      }

      // 保存到数据库
      console.log('准备保存图片到数据库:', { url: data.imageUrl?.substring(0, 50), theme })
      const saveResponse = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: data.imageUrl,
          prompt: data.prompt,
          theme,
          style,
        }),
      })

      console.log('保存响应状态:', saveResponse.status)
      
      if (saveResponse.ok) {
        const savedImage = await saveResponse.json()
        console.log('图片已保存:', savedImage.id)
        const newImage: GeneratedImage = {
          id: savedImage.id,
          url: savedImage.url,
          prompt: savedImage.prompt,
          theme: savedImage.theme,
          timestamp: savedImage.timestamp,
        }
        setImages((prev) => [newImage, ...prev])
      } else {
        const errorData = await saveResponse.json()
        console.error('保存失败:', saveResponse.status, errorData)
      }

      setAppState(AppState.SUCCESS)
    } catch (err: any) {
      console.error(err)
      setError(err.message || '生成失败，请稍后重试')
      setAppState(AppState.ERROR)
    }
  }, [])

  if (!isHydrated || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <GeneratorForm onGenerate={handleGenerate} appState={appState} />

        {/* Error Toast */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
            >
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 
                            px-5 py-3 rounded-2xl shadow-lg">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="font-medium">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="p-1 hover:bg-red-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {images.length === 0 && appState === AppState.IDLE ? (
          <EmptyState />
        ) : (
          <Gallery images={images} />
        )}
      </main>

      <Footer />
    </div>
  )
}
