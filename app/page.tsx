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

  const pollJobStatus = useCallback(async (jobId: string) => {
    let attempts = 0
    const maxAttempts = 300 // 最多轮询 5 分钟（每 1 秒轮询一次）
    let pollInterval = 1000 // 初始轮询间隔 1 秒

    const poll = async () => {
      try {
        const response = await fetch(`/api/generate/status?jobId=${jobId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.error || '查询失败')
        }

        console.log('任务状态:', data.status, '尝试次数:', attempts)

        if (data.status === 'completed') {
          // 任务完成，添加到图片列表
          const newImage: GeneratedImage = {
            id: jobId,
            url: data.imageUrl,
            prompt: '',
            theme: data.theme,
            timestamp: Date.now(),
          }
          setImages((prev) => [newImage, ...prev])
          setAppState(AppState.SUCCESS)
          return true
        } else if (data.status === 'failed') {
          throw new Error(data.error || '生成失败')
        }

        // 继续轮询
        attempts++
        if (attempts < maxAttempts) {
          // 逐步增加轮询间隔，避免过度请求
          if (attempts > 60) {
            pollInterval = 2000 // 1分钟后，每2秒轮询一次
          }
          if (attempts > 120) {
            pollInterval = 3000 // 2分钟后，每3秒轮询一次
          }
          setTimeout(poll, pollInterval)
        } else {
          throw new Error('任务超时（5分钟）。请检查网络连接或稍后重试。')
        }
      } catch (err: any) {
        console.error('轮询失败:', err)
        setError(err.message || '生成失败，请稍后重试')
        setAppState(AppState.ERROR)
      }
    }

    setAppState(AppState.BRAINSTORMING)
    poll()
  }, [])

  const handleJobCreated = useCallback((imageId: string) => {
    console.log('图片已生成:', imageId)
    // 直接生成API已返回结果，重新加载图片列表
    setTimeout(() => {
      fetch('/api/images')
        .then(res => res.json())
        .then(data => {
          setImages(data.images || [])
          setAppState(AppState.SUCCESS)
        })
        .catch(err => {
          console.error('加载图片失败:', err)
          setError('加载图片失败，请刷新页面')
          setAppState(AppState.ERROR)
        })
    }, 500)
  }, [])

  const handleAvatarMerge = useCallback(async (formData: FormData) => {
    setError(null)
    setAppState(AppState.BRAINSTORMING)

    try {
      setAppState(AppState.GENERATING)

      const response = await fetch('/api/generate-with-avatar', {
        method: 'POST',
        body: formData,
      })

      let data
      try {
        data = await response.json()
      } catch (e) {
        throw new Error(`API 响应错误: ${response.status}`)
      }

      if (!response.ok) {
        throw new Error(data?.error || `生成失败 (${response.status})`)
      }

      const newImage: GeneratedImage = {
        id: data.id,
        url: data.url,
        prompt: data.prompt,
        theme: data.theme,
        timestamp: data.timestamp,
      }
      setImages((prev) => [newImage, ...prev])
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
        {/* 生成表单 */}
        <GeneratorForm onGenerate={async () => {}} appState={appState} onJobCreated={handleJobCreated} />

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
