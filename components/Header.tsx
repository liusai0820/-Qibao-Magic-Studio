'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'

export function Header() {
  return (
    <header className="relative py-12 px-4 text-center overflow-hidden">
      {/* 用户登录按钮 */}
      <div className="absolute top-4 right-4 z-10">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-white rounded-full font-medium shadow-md transition-colors">
              登录
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton 
            appearance={{
              elements: {
                avatarBox: 'w-10 h-10',
              }
            }}
          />
        </SignedIn>
      </div>
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        className="relative inline-block mb-6"
      >
        <div className="bg-white p-5 rounded-full shadow-clay border-4 border-white">
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="text-6xl block"
          >
            🎨
          </motion.span>
        </div>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-1 -right-1"
        >
          <Sparkles className="w-6 h-6 text-amber-400" />
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-wide mb-4"
      >
        <span className="text-clay-rose">奇妙</span>
        <span className="text-clay-amber">认知</span>
        <span className="text-clay-sky">海报</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-slate-500 max-w-2xl mx-auto text-base md:text-lg font-medium"
      >
        <span className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-5 py-2 rounded-full shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-400" />
          蒙台梭利教育 × 国家地理风格 × AI 双语认知
          <Sparkles className="w-4 h-4 text-amber-400" />
        </span>
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center gap-3 mt-6"
      >
        {['🦕', '🦁', '🚀', '🍭', '🐠'].map((emoji, i) => (
          <motion.span
            key={emoji}
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
            className="text-2xl"
          >
            {emoji}
          </motion.span>
        ))}
      </motion.div>
    </header>
  )
}
