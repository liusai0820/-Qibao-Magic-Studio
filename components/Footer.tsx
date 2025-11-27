'use client'

import { Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="py-8 px-4 text-center border-t border-amber-100/50">
      <div className="max-w-4xl mx-auto">
        <p className="text-slate-600 text-sm font-medium mb-2">
          🎓 蒙台梭利教育 × 🎨 黏土卡通风格
        </p>
        <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
          Made with
          <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
          by Qibaoba
        </p>
        <p className="text-slate-300 text-xs mt-2">
          Powered by 🍌
        </p>
      </div>
    </footer>
  )
}
