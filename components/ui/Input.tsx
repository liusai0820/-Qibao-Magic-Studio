'use client'

import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <div className="relative">
        <input
          ref={ref}
          className={`
            input-clay text-lg transition-transform focus:scale-[1.01]
            ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="absolute -bottom-6 left-4 text-sm text-red-500 font-medium animate-[fadeIn_0.2s]">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
