'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { useTimer } from '@/hooks/useTimer'
import { useAppStore } from '@/lib/store'
import { formatTime, formatDuration } from '@/lib/utils'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Minus,
  Users,
  Trophy
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const {
    isRunning,
    isPaused,
    remaining,
    elapsed,
    mode,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    adjustTime
  } = useTimer()
  
  const { 
    defaultFocus, 
    defaultShort, 
    defaultLong, 
    pendingXp, 
    totalXp, 
    level,
    currentStreak 
  } = useAppStore()
  
  const [showOnboarding, setShowOnboarding] = useState(false)
  
  // Check if user has completed onboarding
  React.useEffect(() => {
    const hasOnboarded = localStorage.getItem('focusrun-onboarded')
    if (!hasOnboarded) {
      setShowOnboarding(true)
    }
  }, [])
  
  const handleStart = (timerMode: 'focus' | 'short' | 'long') => {
    if (isRunning && !isPaused) {
      pauseTimer()
    } else if (isPaused) {
      resumeTimer()
    } else {
      startTimer(timerMode)
    }
  }
  
  const getCurrentDuration = () => {
    const durations = { focus: defaultFocus, short: defaultShort, long: defaultLong }
    return durations[mode]
  }
  
  const progress = getCurrentDuration() > 0 ? 1 - (remaining / getCurrentDuration()) : 0
  
  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{level}</div>
            <div className="text-sm text-muted-foreground">Level</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{pendingXp}</div>
            <div className="text-sm text-muted-foreground">Pending XP</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{totalXp}</div>
            <div className="text-sm text-muted-foreground">Total XP</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{currentStreak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Timer */}
      <div className="flex justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Focus Timer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Timer Display */}
            <div className="flex justify-center">
              <ProgressRing 
                progress={progress} 
                size={300} 
                strokeWidth={12}
                className="text-primary"
              >
                <div className="text-center">
                  <div className="text-6xl font-bold font-mono">
                    {formatTime(remaining)}
                  </div>
                  <div className="text-lg text-muted-foreground capitalize">
                    {mode} Mode
                  </div>
                </div>
              </ProgressRing>
            </div>
            
            {/* Timer Controls */}
            <div className="flex justify-center space-x-4">
              {!isRunning ? (
                <Button 
                  onClick={() => handleStart(mode)} 
                  size="lg"
                  className="px-8"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start
                </Button>
              ) : isPaused ? (
                <Button 
                  onClick={() => handleStart(mode)} 
                  size="lg"
                  className="px-8"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Resume
                </Button>
              ) : (
                <Button 
                  onClick={() => handleStart(mode)} 
                  variant="secondary"
                  size="lg"
                  className="px-8"
                >
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </Button>
              )}
              
              <Button 
                onClick={resetTimer} 
                variant="outline" 
                size="lg"
                disabled={!isRunning && !isPaused}
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </Button>
            </div>
            
            {/* Mode Selection */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: 'focus', label: 'Focus', duration: defaultFocus, color: 'bg-blue-500' },
                { key: 'short', label: 'Short', duration: defaultShort, color: 'bg-green-500' },
                { key: 'long', label: 'Long', duration: defaultLong, color: 'bg-purple-500' }
              ].map((timerMode) => (
                <Card 
                  key={timerMode.key}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    mode === timerMode.key && "ring-2 ring-primary"
                  )}
                  onClick={() => startTimer(timerMode.key as 'focus' | 'short' | 'long')}
                >
                  <CardContent className="p-4 text-center">
                    <div className={cn("w-3 h-3 rounded-full mx-auto mb-2", timerMode.color)} />
                    <div className="font-medium">{timerMode.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDuration(Math.floor(timerMode.duration / 60))}
                    </div>
                    
                    {/* Time adjustment controls */}
                    <div className="flex justify-center space-x-1 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-6 h-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          adjustTime(timerMode.key as 'focus' | 'short' | 'long', -60)
                        }}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-6 h-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          adjustTime(timerMode.key as 'focus' | 'short' | 'long', 60)
                        }}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Social Features */}
            <div className="text-center space-y-4">
              <Button 
                variant="outline" 
                disabled 
                className="opacity-50"
              >
                <Users className="w-4 h-4 mr-2" />
                Start Together (Coming Soon)
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Invite friends to focus sessions and build accountability
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal onClose={() => setShowOnboarding(false)} />
      )}
    </div>
  )
}

// Simple onboarding modal component
const OnboardingModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState(1)
  const [goals, setGoals] = useState('')
  const [rewardStyle, setRewardStyle] = useState('')
  const [reminderTime, setReminderTime] = useState('09:00')
  
  const handleComplete = () => {
    localStorage.setItem('focusrun-onboarded', 'true')
    localStorage.setItem('focusrun-goals', goals)
    localStorage.setItem('focusrun-reward-style', rewardStyle)
    localStorage.setItem('focusrun-reminder-time', reminderTime)
    onClose()
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Welcome to FocusRun! 🎯</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  What are your main focus goals?
                </label>
                <textarea
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g., Complete project tasks, Study for exams..."
                  rows={3}
                />
              </div>
              <Button onClick={() => setStep(2)} className="w-full">
                Next
              </Button>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  How do you like to reward yourself?
                </label>
                <select
                  value={rewardStyle}
                  onChange={(e) => setRewardStyle(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select a style...</option>
                  <option value="gaming">Gaming breaks</option>
                  <option value="snacks">Healthy snacks</option>
                  <option value="movement">Movement breaks</option>
                  <option value="social">Social media time</option>
                </select>
              </div>
              <Button onClick={() => setStep(3)} className="w-full">
                Next
              </Button>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  When would you like daily reminders?
                </label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <Button onClick={handleComplete} className="w-full">
                Get Started!
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
