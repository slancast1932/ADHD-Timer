'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { useTimer } from '@/contexts/TimerContext'
import { formatTime } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { 
  Timer, 
  Trophy, 
  BarChart3, 
  Settings, 
  Sun, 
  Moon,
  Monitor,
  Contrast
} from 'lucide-react'

export const Navigation: React.FC = () => {
  const pathname = usePathname()
  const [mounted, setMounted] = React.useState(false)
  const { highContrast, toggleHighContrast } = useAppStore()
  
  // Safely get timer state with fallback
  let timerState = null
  try {
    timerState = useTimer()
  } catch (error) {
    // Timer context not available during SSR
  }
  
  const { isRunning = false, isPaused = false, remaining = 0, mode = 'focus' } = timerState || {}
  
  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  const navItems = [
    { href: '/', label: 'Timer', icon: Timer },
    { href: '/quests', label: 'Quests', icon: Trophy },
    { href: '/stats', label: 'Stats', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]
  
  return (
    <nav className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Timer className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FocusRun
            </span>
          </Link>
          
          {/* Navigation Links - Center */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors relative z-10 cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:block">{item.label}</span>
                </Link>
              )
            })}
          </div>
          
          {/* Right Side - Timer Status + Theme Toggle */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* Timer Status */}
            {mounted && (isRunning || isPaused) && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-accent/50 rounded-lg">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isRunning && !isPaused ? "bg-green-500 animate-pulse" : "bg-yellow-500"
                )} />
                <span className="font-mono text-sm font-medium">
                  {formatTime(remaining)}
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  {mode}
                </span>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleHighContrast}
              className={cn(
                "w-9 h-9 p-0",
                highContrast && "bg-accent text-accent-foreground"
              )}
              aria-label="Toggle high contrast"
            >
              <Contrast className="w-4 h-4" />
            </Button>
            
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}

const ThemeToggle: React.FC = () => {
  const [mounted, setMounted] = React.useState(false)
  const [theme, setTheme] = React.useState<'light' | 'dark' | 'system'>('system')
  
  React.useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      setTheme('system')
    }
  }, [])
  
  const cycleTheme = () => {
    const themeOrder: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system']
    const currentIndex = themeOrder.indexOf(theme)
    const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length]
    
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)
    
    // Apply theme immediately
    if (nextTheme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', systemPrefersDark)
    } else {
      document.documentElement.classList.toggle('dark', nextTheme === 'dark')
    }
    
    // Trigger storage event for settings page sync
    window.dispatchEvent(new Event('storage'))
  }
  
  if (!mounted) return null
  
  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4" />
      case 'dark':
        return <Moon className="w-4 h-4" />
      case 'system':
        return <Monitor className="w-4 h-4" />
      default:
        return <Sun className="w-4 h-4" />
    }
  }
  
  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Switch to dark mode'
      case 'dark':
        return 'Switch to system theme'
      case 'system':
        return 'Switch to light mode'
      default:
        return 'Toggle theme'
    }
  }
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="w-9 h-9 p-0"
      aria-label={getLabel()}
      title={getLabel()}
    >
      {getIcon()}
    </Button>
  )
}


