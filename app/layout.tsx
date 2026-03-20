import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'AI Training Partner - Performance Booking',
  description: 'AI Training Partner로 트레이닝 예약과 루틴 관리를 더 빠르게 진행하세요.',
  openGraph: {
    title: 'AI Training Partner - Performance Booking',
    description: '트레이닝 예약과 코칭 루틴을 하나의 흐름으로 관리하세요.',
    images: [
      {
        url: '/coachly-logo.png',
        width: 1024,
        height: 1024,
        alt: 'AI Training Partner Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Training Partner - Performance Booking',
    description: '트레이닝 예약과 코칭 루틴을 하나의 흐름으로 관리하세요.',
    images: ['/coachly-logo.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen font-body text-ink">
        <main className="mx-auto flex min-h-screen w-full max-w-[460px] px-4 py-6 sm:px-6">{children}</main>
      </body>
    </html>
  )
}
