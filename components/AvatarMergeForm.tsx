'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Zap } from 'lucide-react'
import { Button } from './ui/Button'
import { LoadingBar } from './ui/LoadingBar'
import { AppState } from '@/lib/types'
import { validateImageFile } from '@/lib/image-processing'

interface AvatarMergeFormProps {
  onGenerate: (formData: FormData) => Promise<void>
  appState: AppState
}

export function AvatarMergeForm({ onGenerate, appState }: AvatarMergeFormProps) {
  const [userImage, setUserImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [cartoonCharacters, setCartoonCharacters] = useState('')
  const [scene, setScene] = useState('')
  const [userImageDescription, setUserImageDescription] = useState('')
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isLoading = appState === AppState.BRAINSTORMING || appState === AppState.GENERATING

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    setUserImage(file)

    // 生成预览
    const reader = new FileReader()
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setUserImage(null)
    setImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userImage || !cartoonCharacters.trim() || !scene.trim() || isLoading) return

    const formData = new FormData()
    formData.append('userImage', userImage)
    formData.append('userImageDescription', userImageDescription)
    formData.append('cartoonCharacters', cartoonCharacters)
    formData.append('scene', scene)
    formData.append('style', 'pixar')

    await onGenerate(formData)
    
    // 重置表单
    handleRemoveImage()
    setCartoonCharacters('')
    setScene('')
    setUserImageDescription('')
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-[2rem] shadow-clay border-4 border-white"
      >
        <h2 className="text-2xl font-bold text-slate-700 mb-6 text-center">
          📸 用户头像合成
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 图片上传区域 */}
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-3">
              上传你的头像照片
            </label>
            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="预览"
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-amber-200"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="w-full p-8 border-4 border-dashed border-amber-300 rounded-2xl hover:bg-amber-50 transition-colors disabled:opacity-50 flex flex-col items-center gap-3"
              >
                <Upload className="w-8 h-8 text-amber-400" />
                <span className="text-slate-600 font-medium">点击上传或拖拽图片</span>
                <span className="text-xs text-slate-400">支持 JPG、PNG、GIF、WebP，最大 20MB</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              disabled={isLoading}
              className="hidden"
            />
          </div>

          {/* 图片描述 */}
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">
              描述你的照片（可选）
            </label>
            <textarea
              value={userImageDescription}
              onChange={(e) => setUserImageDescription(e.target.value)}
              disabled={isLoading}
              placeholder="例如：我穿着蓝色衣服，戴着眼镜..."
              className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-amber-300 focus:ring-4 focus:ring-amber-100 outline-none resize-none disabled:opacity-50"
              rows={2}
            />
          </div>

          {/* 卡通角色 */}
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">
              卡通角色 *
            </label>
            <input
              type="text"
              value={cartoonCharacters}
              onChange={(e) => setCartoonCharacters(e.target.value)}
              disabled={isLoading}
              placeholder="例如：米奇、唐老鸭、白雪公主..."
              className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-amber-300 focus:ring-4 focus:ring-amber-100 outline-none disabled:opacity-50"
            />
          </div>

          {/* 场景 */}
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">
              场景环境 *
            </label>
            <input
              type="text"
              value={scene}
              onChange={(e) => setScene(e.target.value)}
              disabled={isLoading}
              placeholder="例如：迪士尼城堡、魔法森林、海滩..."
              className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-amber-300 focus:ring-4 focus:ring-amber-100 outline-none disabled:opacity-50"
            />
          </div>

          {/* 提交按钮 */}
          <Button
            type="submit"
            disabled={isLoading || !userImage || !cartoonCharacters.trim() || !scene.trim()}
            loading={isLoading}
            size="lg"
            className="w-full"
            icon={!isLoading && <Zap className="w-5 h-5" />}
          >
            {isLoading ? '' : '生成合成图片'}
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
    </div>
  )
}
