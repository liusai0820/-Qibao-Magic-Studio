'use client'

import { motion } from 'framer-motion'

interface BadgeProps {
  variant?: 'amber' | 'rose' | 'sky' | 'green' | 'purple'
  icon?: string
  children: React.ReactNode
  animate?: boolean
}

const variants = {
  amber: 'bg-amber-100 text-amber-600',
  rose: 'bg-rose-100 text-rose-600',
  sky: 'bg-sky-100 text-sky-600',
  green: 'bg-emerald-100 text-emerald-600',
  purple: 'bg-purple-100 text-purple-600',
}

export function Badge({ variant = 'amber', icon, children, animate = false }: BadgeProps) {
  const Component = animate ? motion.span : 'span'
  const animateProps = animate ? { animate: { scale: [1, 1.05, 1] }, transition: { repeat: Infinity, duration: 2 } } : {}

  return (
    <Component
      className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold ${variants[variant]}`}
      {...animateProps}
    >
      {icon && <span>{icon}</span>}
      {children}
    </Component>
  )
}
