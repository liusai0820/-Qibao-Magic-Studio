'use client'

import { motion } from 'framer-motion'

interface LoadingBarProps {
  stage: 'brainstorming' | 'generating'
  progress?: number
}

export function LoadingBar({ stage, progress = 0 }: LoadingBarProps) {
  const isBrainstorming = stage === 'brainstorming'
  
  // 黏土主题色系
  const colors = {
    brainstorming: {
      bg: 'from-amber-200 to-amber-300',
      text: 'text-amber-700',
      light: 'bg-amber-100',
      icon: '🧠',
      label: '构思中',
    },
    generating: {
      bg: 'from-rose-300 to-pink-300',
      text: 'text-rose-700',
      light: 'bg-rose-100',
      icon: '🎨',
      label: '捏制中',
    },
  }

  const current = isBrainstorming ? colors.brainstorming : colors.generating

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* 黏土风格进度条 */}
      <div className="space-y-3">
        {/* 进度条容器 */}
        <div className="relative h-12 bg-white rounded-full border-4 border-white shadow-lg overflow-hidden">
          {/* 背景 */}
          <div className={`absolute inset-0 bg-gradient-to-r ${current.light} rounded-full`} />

          {/* 进度填充 - 黏土球风格 */}
          <motion.div
            className={`h-full bg-gradient-to-r ${current.bg} rounded-full shadow-md relative`}
            animate={{
              width: `${progress}%`,
            }}
            transition={{
              duration: 0.5,
              ease: 'easeOut',
            }}
          >
            {/* 黏土球高光 */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent rounded-full" />
          </motion.div>

          {/* 流动的黏土球 */}
          {progress > 0 && progress < 100 && (
            <motion.div
              className={`absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-br ${current.bg} shadow-lg`}
              animate={{
                left: `${progress}%`,
                x: '-50%',
              }}
              transition={{
                duration: 0.5,
                ease: 'easeOut',
              }}
            >
              {/* 黏土球高光 */}
              <div className="absolute top-1 left-1 w-3 h-3 bg-white/60 rounded-full" />
            </motion.div>
          )}

          {/* 百分比文字 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              className={`text-sm font-bold ${current.text}`}
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              {Math.round(progress)}%
            </motion.span>
          </div>
        </div>

        {/* 状态文字 */}
        <motion.div
          className="text-center"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        >
          <p className={`text-sm font-bold ${current.text} flex items-center justify-center gap-2`}>
            <span className="text-lg">{current.icon}</span>
            <span>正在{current.label}</span>
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ...
            </motion.span>
          </p>
        </motion.div>
      </div>

      {/* 装饰元素 - 黏土球 */}
      <div className="flex justify-center gap-4">
        {[
          { emoji: '🎨', delay: 0 },
          { emoji: '✨', delay: 0.2 },
          { emoji: '🌟', delay: 0.4 },
        ].map((item) => (
          <motion.div
            key={item.emoji}
            className="w-8 h-8 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm"
            animate={{
              y: [0, -12, 0],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              delay: item.delay,
              repeat: Infinity,
            }}
          >
            <span className="text-lg">{item.emoji}</span>
          </motion.div>
        ))}
      </div>

      {/* 进度提示 */}
      <motion.div
        className="text-center text-xs text-slate-400 font-medium"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        {isBrainstorming ? '🧠 魔法师正在思考...' : '🎨 黏土大师正在创作...'}
      </motion.div>
    </div>
  )
}
