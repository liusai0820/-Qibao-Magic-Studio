'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Sparkles } from 'lucide-react'
import { Button } from './ui/Button'
import { LoadingBar } from './ui/LoadingBar'
import { THEME_SUGGESTIONS, STYLE_PLACEHOLDERS } from '@/lib/constants'
import { AppState } from '@/lib/types'

interface GeneratorFormProps {
  onGenerate: (theme: string, style: string) => Promise<void>
  appState: AppState
  onJobCreated?: (jobId: string) => void
}

export function GeneratorForm({ onGenerate, appState, onJobCreated }: GeneratorFormProps) {
  const [theme, setTheme] = useState('')
  const [style, setStyle] = useState<'claymation' | 'realistic' | 'pixar'>('claymation')
  const [progress, setProgress] = useState(0)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [jobId, setJobId] = useState<string | null>(null)
  const isLoading = appState === AppState.BRAINSTORMING || appState === AppState.GENERATING

  // Get current placeholders based on style
  const currentPlaceholders = STYLE_PLACEHOLDERS[style]

  // Rotate placeholders
  useEffect(() => {
    setPlaceholderIndex(0) // Reset to first placeholder when style changes
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % currentPlaceholders.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [style, currentPlaceholders])

  // Simulate progress - 2 minutes total (120 seconds)
  useEffect(() => {
    if (!isLoading) {
      setProgress(0)
      return
    }

    // Start at 5%, end at 95% over 2 minutes
    const startTime = Date.now()
    const duration = 120000 // 2 minutes in milliseconds
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const percentage = Math.min((elapsed / duration) * 95 + 5, 95)
      setProgress(Math.round(percentage))
    }, 500)

    return () => clearInterval(interval)
  }, [isLoading])

  // Complete progress when done
  useEffect(() => {
    if (!isLoading && progress > 0) {
      setProgress(100)
      const timer = setTimeout(() => setProgress(0), 800)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!theme.trim() || isLoading) return
    
    try {
      // 调用新的生成 API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, style }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || '创建任务失败')
      }

      // 保存 jobId 用于轮询
      setJobId(data.jobId)
      onJobCreated?.(data.jobId)
      setTheme('')
    } catch (error: any) {
      console.error('提交失败:', error)
      alert('提交失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Style Selector */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <p className="text-center text-sm font-bold text-slate-500 mb-3">选择创作风格</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => setStyle('claymation')}
            disabled={isLoading}
            className={`px-6 py-3 rounded-2xl font-bold transition-all transform ${
              style === 'claymation'
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg scale-105'
                : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-amber-300'
            } disabled:opacity-50`}
          >
            <span className="mr-2">🎨</span>
            <span>黏土风格</span>
            <span className="block text-xs mt-1 opacity-80">想象力创意</span>
          </button>
          <button
            onClick={() => setStyle('realistic')}
            disabled={isLoading}
            className={`px-6 py-3 rounded-2xl font-bold transition-all transform ${
              style === 'realistic'
                ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-lg scale-105'
                : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-sky-300'
            } disabled:opacity-50`}
          >
            <span className="mr-2">📸</span>
            <span>写实风格</span>
            <span className="block text-xs mt-1 opacity-80">真实认知</span>
          </button>
          <button
            onClick={() => setStyle('pixar')}
            disabled={isLoading}
            className={`px-6 py-3 rounded-2xl font-bold transition-all transform ${
              style === 'pixar'
                ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-lg scale-105'
                : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-purple-300'
            } disabled:opacity-50`}
          >
            <span className="mr-2">🎬</span>
            <span>皮克斯3D</span>
            <span className="block text-xs mt-1 opacity-80">欢乐自拍</span>
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-2 rounded-[2rem] shadow-clay border-4 border-white"
      >
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              key={style}
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              disabled={isLoading}
              placeholder={currentPlaceholders[placeholderIndex]}
              className="w-full h-14 md:h-16 pl-5 pr-4 rounded-[1.5rem] bg-amber-50/50 border-2 border-transparent 
                       focus:bg-white focus:border-amber-200 focus:ring-4 focus:ring-amber-100 
                       transition-all outline-none text-slate-700 placeholder:text-slate-400 
                       text-base md:text-lg font-medium disabled:opacity-50"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || !theme.trim()}
            loading={isLoading}
            size="lg"
            className="h-14 md:h-16 px-6 md:px-8 shrink-0"
            icon={!isLoading && <Zap className="w-5 h-5" />}
          >
            {isLoading ? '' : '生成'}
          </Button>
        </form>
      </motion.div>

      {/* Loading Bar */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-8"
          >
            <LoadingBar
              stage={appState === AppState.BRAINSTORMING ? 'brainstorming' : 'generating'}
              progress={progress}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <p className="text-center text-slate-400 text-sm font-medium mb-4 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          试试这些有趣的主题
          <Sparkles className="w-4 h-4" />
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {THEME_SUGGESTIONS.map((item, i) => (
            <motion.button
              key={item.theme}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme(item.theme)}
              disabled={isLoading}
              className="px-5 py-2.5 bg-white border-2 border-slate-100 rounded-2xl text-slate-600 
                       font-medium hover:border-amber-300 hover:text-amber-600 hover:shadow-lg 
                       transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="mr-1.5">{item.emoji}</span>
              {item.label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
