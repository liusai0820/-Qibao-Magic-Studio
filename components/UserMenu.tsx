'use client'

import { useUser, useClerk } from '@clerk/nextjs'
import { getDiceBearAvatarUrl } from '@/lib/avatar'
import { LogOut, Settings } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function UserMenu() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const [isOpen, setIsOpen] = useState(false)

  if (!isLoaded || !user) {
    return null
  }

  const avatarUrl = getDiceBearAvatarUrl(user.id)
  const userName = user.firstName || user.username || '用户'

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border-2 border-slate-200 hover:border-amber-300 transition-colors"
      >
        <img
          src={avatarUrl}
          alt={userName}
          className="w-8 h-8 rounded-full"
        />
        <span className="text-sm font-medium text-slate-600 hidden sm:inline">
          {userName}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border-2 border-slate-100 overflow-hidden z-50"
          >
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={avatarUrl}
                  alt={userName}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-700 truncate">{userName}</p>
                  <p className="text-xs text-slate-500 truncate">{user.primaryEmailAddress?.emailAddress}</p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={() => {
                  setIsOpen(false)
                  // 可以在这里添加设置页面的导航
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-amber-50 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">账户设置</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false)
                  signOut()
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">退出登录</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
