'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/lib/store'
import { SoundType, playCompletionSound } from '@/lib/utils'
import { 
  Settings, 
  Palette, 
  Clock, 
  Bell, 
  Download, 
  Trash2,
  Info,
  Eye,
  Volume2,
  Zap,
  Sun,
  Moon,
  Monitor
} from 'lucide-react'

export default function SettingsPage() {
  const {
    defaultFocus,
    defaultShort,
    defaultLong,
    reducedMotion,
    highContrast,
    autoStartBreaks,
    reminderTime,
    completionSound,
    setTimerDefaults,
    toggleReducedMotion,
    toggleHighContrast,
    toggleAutoStartBreaks,
    setReminderTime,
    setCompletionSound,
    resetData
  } = useAppStore()
  
  const [focusMinutes, setFocusMinutes] = useState(Math.floor(defaultFocus / 60))
  const [shortMinutes, setShortMinutes] = useState(Math.floor(defaultShort / 60))
  const [longMinutes, setLongMinutes] = useState(Math.floor(defaultLong / 60))
  const [newReminderTime, setNewReminderTime] = useState(reminderTime || '09:00')
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [mounted, setMounted] = useState(false)
  
  const soundOptions = [
    { value: 'gentle-chime', label: 'Gentle Chime', description: 'Soft ascending chime tones' },
    { value: 'success-bells', label: 'Success Bells', description: 'Celebration bell sequence' },
    { value: 'nature-birds', label: 'Nature Birds', description: 'Gentle bird chirping sounds' },
    { value: 'soft-piano', label: 'Soft Piano', description: 'Calm piano chord progression' },
    { value: 'meditation-bowl', label: 'Meditation Bowl', description: 'Deep resonating bowl tone' },
    { value: 'digital-beep', label: 'Digital Beep', description: 'Simple electronic beep' }
  ] as const

  // Initialize theme on mount
  React.useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      setTheme('system')
    }

    // Listen for theme changes from navigation toggle
    const handleStorageChange = () => {
      const updatedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null
      if (updatedTheme) {
        setTheme(updatedTheme)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Apply theme changes
  React.useEffect(() => {
    if (!mounted) return

    const applyTheme = (themeName: 'light' | 'dark' | 'system') => {
      if (themeName === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        document.documentElement.classList.toggle('dark', systemPrefersDark)
      } else {
        document.documentElement.classList.toggle('dark', themeName === 'dark')
      }
    }

    applyTheme(theme)
    localStorage.setItem('theme', theme)

    // Listen for system theme changes if using system theme
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle('dark', e.matches)
      }
      
      mediaQuery.addEventListener('change', handleSystemThemeChange)
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [theme, mounted])

  const themeOptions = [
    { 
      value: 'light', 
      label: 'Light Mode', 
      description: 'Clean and bright interface',
      icon: Sun,
      preview: 'bg-white text-gray-900'
    },
    { 
      value: 'dark', 
      label: 'Dark Mode', 
      description: 'Easier on the eyes in low light',
      icon: Moon,
      preview: 'bg-gray-900 text-white'
    },
    { 
      value: 'system', 
      label: 'System Default', 
      description: 'Matches your device settings',
      icon: Monitor,
      preview: 'bg-gradient-to-r from-white to-gray-900'
    }
  ] as const
  
  const handleSaveTimerDefaults = () => {
    setTimerDefaults(
      focusMinutes * 60,
      shortMinutes * 60,
      longMinutes * 60
    )
  }
  
  const handleSaveReminderTime = () => {
    setReminderTime(newReminderTime)
  }
  
  const handleSoundChange = (sound: SoundType) => {
    setCompletionSound(sound)
  }
  
  const previewSound = (sound: SoundType) => {
    playCompletionSound(sound)
    // Also select this sound when previewing
    setCompletionSound(sound)
  }
  
  const handleExportData = () => {
    const data = {
      settings: {
        defaultFocus,
        defaultShort,
        defaultLong,
        reducedMotion,
        highContrast,
        autoStartBreaks,
        reminderTime
      },
      progress: useAppStore.getState(),
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `focusrun-backup-${new Date().toISOString().split('T')[0]}.json`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }
  
  const handleResetData = () => {
    if (showResetConfirm) {
      resetData()
      setShowResetConfirm(false)
    } else {
      setShowResetConfirm(true)
      setTimeout(() => setShowResetConfirm(false), 5000) // Auto-cancel after 5 seconds
    }
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Customize your FocusRun experience</p>
      </div>
      
      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>Theme</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-3">
              Choose your preferred theme
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {mounted && themeOptions.map((option) => {
                const IconComponent = option.icon
                return (
                  <div
                    key={option.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      theme === option.value
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-input hover:border-primary/50'
                    }`}
                    onClick={() => setTheme(option.value)}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`w-12 h-8 rounded border-2 border-gray-300 relative overflow-hidden ${option.preview}`}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <IconComponent className="w-4 h-4 opacity-70" />
                        </div>
                      </div>
                      
                      <div>
                        <div className="font-medium flex items-center space-x-2">
                          <span>{option.label}</span>
                          {theme === option.value && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {!mounted && (
              <div className="text-center py-8 text-muted-foreground">
                Loading theme options...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>Accessibility</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Reduced Motion</div>
              <div className="text-sm text-muted-foreground">
                Reduces animations and transitions for better focus
              </div>
            </div>
            <Button
              onClick={toggleReducedMotion}
              variant={reducedMotion ? "default" : "outline"}
              size="sm"
            >
              {reducedMotion ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">High Contrast</div>
              <div className="text-sm text-muted-foreground">
                Increases contrast for better visibility
              </div>
            </div>
            <Button
              onClick={toggleHighContrast}
              variant={highContrast ? "default" : "outline"}
              size="sm"
            >
              {highContrast ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Sound Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Volume2 className="w-5 h-5" />
            <span>Completion Sound</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-3">
              Choose your timer completion sound
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {soundOptions.map((option) => (
                <div
                  key={option.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    completionSound === option.value
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-input hover:border-primary/50'
                  }`}
                  onClick={() => handleSoundChange(option.value)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          previewSound(option.value)
                        }}
                        className="text-xs"
                      >
                        Preview
                      </Button>
                      {completionSound === option.value && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timer Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Timer Durations</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Focus Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={focusMinutes}
                onChange={(e) => setFocusMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Short Break (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={shortMinutes}
                onChange={(e) => setShortMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Long Break (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={longMinutes}
                onChange={(e) => setLongMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Auto-Start Breaks</div>
              <div className="text-sm text-muted-foreground">
                Automatically start break timers after focus sessions
              </div>
            </div>
            <Button
              onClick={toggleAutoStartBreaks}
              variant={autoStartBreaks ? "default" : "outline"}
              size="sm"
            >
              {autoStartBreaks ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleSaveTimerDefaults}>
              Save Timer Settings
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <div className="font-medium text-blue-900 dark:text-blue-100">
                  Web Push Notifications Coming Soon
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  We're working on implementing browser notifications to remind you about focus sessions and breaks.
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Daily Reminder Time
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="time"
                value={newReminderTime}
                onChange={(e) => setNewReminderTime(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              />
              <Button onClick={handleSaveReminderTime} size="sm">
                Save
              </Button>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Set a time to receive daily focus reminders (stored locally)
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Data Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleExportData}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export All Data</span>
            </Button>
            
            <Button 
              onClick={handleResetData}
              variant={showResetConfirm ? "destructive" : "outline"}
              className="flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>
                {showResetConfirm ? 'Click Again to Confirm Reset' : 'Clear All Data'}
              </span>
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Export:</strong> Download a JSON file with all your settings, progress, and quest data.
            </p>
            <p>
              <strong>Clear:</strong> Permanently delete all local data including progress, quests, and settings. This cannot be undone.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="w-5 h-5" />
            <span>About FocusRun</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="font-medium">Version</div>
            <div className="text-sm text-muted-foreground">1.0.0</div>
          </div>
          
          <div>
            <div className="font-medium">Description</div>
            <div className="text-sm text-muted-foreground">
              A gamified focus timer app designed specifically for people with ADHD. 
              Build healthy habits, track your progress, and stay motivated with quests and rewards.
            </div>
          </div>
          
          <div>
            <div className="font-medium">Features</div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>✅ Precise background timing with Web Workers</div>
              <div>✅ Accessibility features (reduced motion, high contrast)</div>
              <div>✅ Gamified progress with XP and quests</div>
              <div>✅ Local data storage (no account required)</div>
              <div>✅ Progress tracking and statistics</div>
              <div>🚧 Social features (coming soon)</div>
              <div>🚧 Web push notifications (coming soon)</div>
            </div>
          </div>
          
          <div>
            <div className="font-medium">Privacy</div>
            <div className="text-sm text-muted-foreground">
              All your data is stored locally in your browser. We don't collect or transmit any personal information.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}