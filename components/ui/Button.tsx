'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  children?: React.ReactNode
}

const variants = {
  primary: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 shadow-clay hover:shadow-clay-lg',
  secondary: 'bg-white text-slate-700 border-2 border-slate-100 hover:border-amber-300 hover:text-amber-600',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
}

const sizes = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-6 py-3 text-base rounded-2xl',
  lg: 'px-8 py-4 text-lg rounded-2xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, disabled, className = '', ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || loading ? 1 : 1.02, y: disabled || loading ? 0 : -2 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2 font-bold transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : icon ? (
          icon
        ) : null}
        {children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
