'use client'

import { useState, useRef } from 'react'
import { StoryParams } from '@/lib/types'
import { STORYBOOK_ART_STYLES, CHARACTER_DESCRIPTION_EXAMPLES } from '@/lib/constants'
import { BookOpen, Sparkles, Palette, Heart, User, Star, Upload, X, Image as ImageIcon } from 'lucide-react'

interface Props {
  onSubmit: (params: StoryParams) => void
  isLoading: boolean
}

export default function StoryForm({ onSubmit, isLoading }: Props) {
  const [params, setParams] = useState<StoryParams>({
    childName: '',
    age: 5,
    theme: '',
    specificNeeds: '',
    artStyle: STORYBOOK_ART_STYLES[3].value, // 默认皮克斯风格
    characterDescription: '',
  })
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setParams(prev => ({ ...prev, [name]: name === 'age' ? Number(value) : value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // 转换为base64预览
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64 = event.target?.result as string
        setReferenceImage(base64)
        
        // 上传到R2获取永久URL
        try {
          const formData = new FormData()
          formData.append('image', file)
          const response = await fetch('/api/storybook/upload-reference', {
            method: 'POST',
            body: formData,
          })
          if (response.ok) {
            const { url } = await response.json()
            setParams(prev => ({ ...prev, referenceImageUrl: url }))
          }
        } catch (err) {
          console.error('上传参考图失败:', err)
        }
      }
      reader.readAsDataURL(file)
    } finally {
      setIsUploading(false)
    }
  }

  const removeReferenceImage = () => {
    setReferenceImage(null)
    setParams(prev => ({ ...prev, referenceImageUrl: undefined }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(params)
  }

  const useExampleDescription = (example: string) => {
    setParams(prev => ({ ...prev, characterDescription: example }))
  }

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8 bg-white shadow-2xl rounded-3xl border-4 border-amber-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-0 left-0 w-32 h-32 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      
      <div className="text-center mb-6 relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold text-amber-600 mb-2 flex items-center justify-center gap-3">
          <BookOpen className="w-8 h-8 text-amber-500" />
          奇妙童话工坊
        </h1>
        <p className="text-slate-500">为您的孩子定制专属的成长绘本</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-medium text-slate-700">
              <User className="w-4 h-4 text-blue-400" /> 主角名字
            </label>
            <input
              type="text"
              name="childName"
              required
              value={params.childName}
              onChange={handleChange}
              className="w-full p-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-amber-200 focus:border-amber-400 outline-none transition bg-slate-50"
              placeholder="例如：豆豆"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 font-medium text-slate-700">
              <Sparkles className="w-4 h-4 text-yellow-400" /> 孩子年龄
            </label>
            <input
              type="number"
              name="age"
              required
              min={1}
              max={12}
              value={params.age}
              onChange={handleChange}
              className="w-full p-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-amber-200 focus:border-amber-400 outline-none transition bg-slate-50"
            />
          </div>
        </div>

        {/* 角色外观描述 - 关键！ */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium text-slate-700">
            <ImageIcon className="w-4 h-4 text-purple-400" /> 
            主角外观描述 
            <span className="text-xs text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">保持角色一致的关键</span>
          </label>
          <textarea
            name="characterDescription"
            rows={2}
            value={params.characterDescription}
            onChange={handleChange}
            className="w-full p-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-amber-200 focus:border-amber-400 outline-none transition bg-slate-50"
            placeholder="详细描述主角的外观特征：发型、发色、脸型、眼睛、穿着等..."
          />
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs text-slate-400">参考示例：</span>
            {CHARACTER_DESCRIPTION_EXAMPLES.map((example, i) => (
              <button
                key={i}
                type="button"
                onClick={() => useExampleDescription(example)}
                className="text-xs px-2 py-1 bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-700 rounded-lg transition"
              >
                示例{i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* 参考图上传 */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium text-slate-700">
            <Upload className="w-4 h-4 text-green-400" /> 
            上传参考图（可选）
            <span className="text-xs text-slate-400">帮助AI更好地保持角色一致性</span>
          </label>
          
          {referenceImage ? (
            <div className="relative inline-block">
              <img src={referenceImage} alt="参考图" className="w-32 h-32 object-cover rounded-xl border-2 border-amber-200" />
              <button
                type="button"
                onClick={removeReferenceImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition"
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">点击上传角色参考图</p>
              <p className="text-xs text-slate-400 mt-1">支持 JPG、PNG 格式</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium text-slate-700">
            <Star className="w-4 h-4 text-purple-400" /> 故事主题
          </label>
          <input
            type="text"
            name="theme"
            required
            value={params.theme}
            onChange={handleChange}
            className="w-full p-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-amber-200 focus:border-amber-400 outline-none transition bg-slate-50"
            placeholder="例如：不想去奶奶家过夜，害怕消防车的声音"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium text-slate-700">
            <Heart className="w-4 h-4 text-red-400" /> 教育需求 / 想要解决的问题
          </label>
          <textarea
            name="specificNeeds"
            rows={2}
            value={params.specificNeeds}
            onChange={handleChange}
            className="w-full p-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-amber-200 focus:border-amber-400 outline-none transition bg-slate-50"
            placeholder="例如：帮助孩子克服分离焦虑，学会勇敢面对新环境"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium text-slate-700">
            <Palette className="w-4 h-4 text-green-400" /> 绘本画风
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {STORYBOOK_ART_STYLES.map(style => (
              <button
                key={style.value}
                type="button"
                onClick={() => setParams(prev => ({ ...prev, artStyle: style.value }))}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  params.artStyle === style.value
                    ? 'border-amber-400 bg-amber-50 shadow-md'
                    : 'border-slate-200 hover:border-amber-200 bg-white'
                }`}
              >
                <div className="font-medium text-sm text-slate-700">{style.label}</div>
                <div className="text-xs text-slate-400 mt-1">{style.description}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !params.childName || !params.theme}
          className={`w-full py-4 px-6 rounded-2xl text-white font-bold text-lg shadow-lg transition-all transform hover:-translate-y-1 ${
            isLoading || !params.childName || !params.theme
              ? 'bg-slate-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 active:translate-y-0'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              AI 正在创作中...
            </span>
          ) : (
            "✨ 开始生成绘本 ✨"
          )}
        </button>
      </form>
    </div>
  )
}
