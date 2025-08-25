import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/Navigation'
import { ConfettiCanvas } from '@/components/ui/ConfettiCanvas'
import { ThemeProvider } from '@/components/ThemeProvider'
import { TimerProvider } from '@/contexts/TimerContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FocusRun - ADHD Timer & Focus App',
  description: 'A gamified focus timer app designed for people with ADHD to improve productivity and build healthy habits.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <TimerProvider>
            <div className="min-h-screen bg-background">
              <Navigation />
              <main className="container mx-auto px-4 py-8">
                {children}
              </main>
              <ConfettiCanvas />
            </div>
          </TimerProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


