'use client'

import { motion } from 'framer-motion'
import { Palette, Sparkles, Heart } from 'lucide-react'

export function EmptyState() {
  const features = [
    { icon: '🎨', title: 'AI 智能创作', desc: '黏土风格 × 写实风格，双重选择' },
    { icon: '🌍', title: '蒙台梭利教育', desc: '真实照片助力认知迁移，科学启蒙' },
    { icon: '📸', title: '国家地理质感', desc: '8K 高保真，专业级认知海报' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="max-w-4xl mx-auto px-4 py-16"
    >
      <div className="text-center mb-12">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="inline-block mb-4"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-rose-100 rounded-3xl 
                        flex items-center justify-center shadow-lg">
            <Palette className="w-10 h-10 text-amber-500" />
          </div>
        </motion.div>
        <h3 className="text-xl font-display font-bold text-slate-600 mb-2">
          开始你的创作之旅
        </h3>
        <p className="text-slate-400">
          在上方输入任意主题，AI 将为你生成独一无二的黏土风格海报
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.1 }}
            className="bg-white/80 backdrop-blur rounded-3xl p-6 text-center 
                     border-2 border-white shadow-lg hover:shadow-xl transition-shadow"
          >
            <span className="text-4xl mb-4 block">{feature.icon}</span>
            <h4 className="font-bold text-slate-700 mb-2">{feature.title}</h4>
            <p className="text-sm text-slate-500">{feature.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center mt-12"
      >
        <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
          <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
          专为 2-5 岁宝宝设计
          <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
        </p>
      </motion.div>
    </motion.div>
  )
}
