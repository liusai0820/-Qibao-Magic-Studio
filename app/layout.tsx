import type { Metadata } from 'next'
import { ZCOOL_KuaiLe, Noto_Sans_SC } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { zhCN } from '@clerk/localizations'
import './globals.css'

const zcool = ZCOOL_KuaiLe({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-zcool',
  display: 'swap',
})

const noto = Noto_Sans_SC({
  weight: ['400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-noto',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '奇妙黏土世界 | Clay Magic Studio',
  description: '为宝宝定制的 AI 双语认知海报生成器',
  keywords: ['AI', '黏土', '儿童教育', '双语', '海报生成'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider localization={zhCN}>
      <html lang="zh-CN" className={`${zcool.variable} ${noto.variable}`}>
        <body className="font-body min-h-screen">
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200/30 rounded-full blur-3xl" />
            <div className="absolute top-40 right-20 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-sky-200/30 rounded-full blur-3xl" />
          </div>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
