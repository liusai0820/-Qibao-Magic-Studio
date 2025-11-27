'use client'

import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <SignUp 
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-xl rounded-2xl',
          }
        }}
      />
    </div>
  )
}
