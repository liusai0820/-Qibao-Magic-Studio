'use client'

import { useState } from 'react'
import { Wand2 } from 'lucide-react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { GeneratedImage } from '@/lib/types'

interface EditModalProps {
  isOpen: boolean
  onClose: () => void
  image: GeneratedImage | null
  onSubmit: (instruction: string) => Promise<void>
  isLoading: boolean
}

export function EditModal({ isOpen, onClose, image, onSubmit, isLoading }: EditModalProps) {
  const [instruction, setInstruction] = useState('')

  const handleSubmit = async () => {
    if (!instruction.trim()) return
    await onSubmit(instruction)
    setInstruction('')
  }

  const suggestions = [
    '给主角戴上帽子',
    '把背景变成夜晚',
    '添加彩虹',
    '加入更多小动物',
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🪄 魔法修改">
      <p className="text-center text-slate-500 mb-6 text-sm">
        告诉魔法师你想改变什么？
      </p>

      {image && (
        <div className="flex justify-center mb-6">
          <div className="w-32 h-40 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-slate-100">
            <img src={image.url} alt="Preview" className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      <textarea
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        placeholder="例如：给恐龙戴个帽子，或者把背景变成晚上..."
        disabled={isLoading}
        className="w-full h-28 p-4 rounded-2xl bg-white border-2 border-amber-100 
                 focus:border-amber-300 focus:ring-2 focus:ring-amber-100 
                 outline-none resize-none text-slate-700 font-medium
                 placeholder:text-slate-400 disabled:opacity-50"
      />

      <div className="flex flex-wrap gap-2 mt-3 mb-5">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => setInstruction(s)}
            disabled={isLoading}
            className="text-xs px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full 
                     hover:bg-amber-100 transition-colors disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          onClick={onClose}
          variant="secondary"
          className="flex-1"
          disabled={isLoading}
        >
          取消
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!instruction.trim() || isLoading}
          loading={isLoading}
          icon={!isLoading && <Wand2 className="w-4 h-4" />}
          className="flex-1 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600"
        >
          确认修改
        </Button>
      </div>
    </Modal>
  )
}
