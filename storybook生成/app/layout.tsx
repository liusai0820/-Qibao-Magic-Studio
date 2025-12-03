import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '奇妙童话工坊 - WonderTales AI Publisher',
  description: '为您的孩子定制专属的成长绘本',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
