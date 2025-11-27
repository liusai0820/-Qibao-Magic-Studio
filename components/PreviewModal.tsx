'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { GeneratedImage } from '@/lib/types'

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  image: GeneratedImage | null
  onDownload: (imageUrl: string, id: string) => void
  onEdit: (image: GeneratedImage) => void
}

export function PreviewModal({ isOpen, onClose, image }: PreviewModalProps) {
  if (!image) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 p-2 text-white hover:bg-white/10 rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image Only */}
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-br from-amber-50 to-rose-50 flex items-center justify-center">
                <img
                  src={image.url}
                  alt={image.theme}
                  className="w-full h-auto max-h-[80vh]"
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
