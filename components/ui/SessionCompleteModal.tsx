'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { 
  Coffee, 
  Play, 
  CheckCircle2, 
  Sparkles,
  Heart
} from 'lucide-react'

interface SessionCompleteModalProps {
  sessionMinutes: number
  sessionType: 'focus' | 'short' | 'long'
  onContinue: () => void
  onBreak: () => void
  onClose: () => void
}

export const SessionCompleteModal: React.FC<SessionCompleteModalProps> = ({
  sessionMinutes,
  sessionType,
  onContinue,
  onBreak,
  onClose
}) => {
  const [showBreathingAnimation, setShowBreathingAnimation] = useState(true)
  const { playlistMode, currentPlaylist, currentPlaylistIndex, setSessionCompleteChoice } = useAppStore()
  
  // Auto-advance for playlist mode after a brief pause
  useEffect(() => {
    if (playlistMode && currentPlaylist.length > 0) {
      const timer = setTimeout(() => {
        const nextIndex = currentPlaylistIndex + 1
        if (nextIndex < currentPlaylist.length) {
          setSessionCompleteChoice('continue')
          onContinue()
        } else {
          setSessionCompleteChoice('break')
          onBreak()
        }
      }, 3000) // 3 second pause for acknowledgment
      
      return () => clearTimeout(timer)
    }
  }, [playlistMode, currentPlaylist, currentPlaylistIndex, onContinue, onBreak, setSessionCompleteChoice])

  const handleContinue = () => {
    setSessionCompleteChoice('continue')
    onContinue()
  }

  const handleBreak = () => {
    setSessionCompleteChoice('break')
    onBreak()
  }

  // Breathing animation component
  const BreathingCircle = () => (
    <div className="flex justify-center mb-8">
      <div 
        className={cn(
          "w-32 h-32 rounded-full border-4 border-primary/20 flex items-center justify-center transition-all duration-4000 ease-in-out shadow-lg",
          showBreathingAnimation ? "scale-110 border-primary/40 shadow-primary/20" : "scale-100 border-primary/20 shadow-primary/10"
        )}
      >
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-primary" />
        </div>
      </div>
    </div>
  )

  // Cycle breathing animation
  useEffect(() => {
    const interval = setInterval(() => {
      setShowBreathingAnimation(prev => !prev)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const getCompletionMessage = () => {
    switch (sessionType) {
      case 'focus':
        return "You've completed a focus session!"
      case 'short':
        return "Short break completed!"
      case 'long':
        return "Long break finished!"
      default:
        return "Session complete!"
    }
  }

  const getNextTaskInfo = () => {
    if (playlistMode && currentPlaylist.length > 0) {
      const nextIndex = currentPlaylistIndex + 1
      if (nextIndex < currentPlaylist.length) {
        const nextTask = currentPlaylist[nextIndex]
        return {
          hasNext: true,
          task: nextTask
        }
      }
    }
    return { hasNext: false }
  }

  const nextTaskInfo = getNextTaskInfo()

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto border-2 border-primary/20 shadow-2xl">
        <CardContent className="p-8 text-center space-y-6">
          <BreathingCircle />
          
          {/* Completion Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-primary">
              {getCompletionMessage()}
            </h2>
            <p className="text-muted-foreground">
              {sessionMinutes === 1 ? '1 minute' : `${sessionMinutes} minutes`} of focused time
            </p>
          </div>

          {/* Celebration */}
          <div className="flex justify-center space-x-2 text-yellow-500">
            <Sparkles className="w-5 h-5" />
            <Heart className="w-5 h-5 text-red-500" />
            <Sparkles className="w-5 h-5" />
          </div>

          {/* Playlist Auto-advance Info */}
          {playlistMode && (
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 text-sm">
              {nextTaskInfo.hasNext ? (
                <div>
                  <p className="text-blue-700 dark:text-blue-300 font-medium">
                    Auto-advancing to next task...
                  </p>
                  <p className="text-blue-600 dark:text-blue-400 mt-1">
                    {nextTaskInfo.task?.name} ({Math.floor((nextTaskInfo.task?.duration || 0) / 60)}m)
                  </p>
                </div>
              ) : (
                <p className="text-green-700 dark:text-green-300 font-medium">
                  Playlist complete! Taking a well-deserved break...
                </p>
              )}
            </div>
          )}

          {/* Action Buttons - Only show if not in auto-advance mode */}
          {!playlistMode && (
            <div className="space-y-3">
              <Button 
                onClick={handleContinue}
                className="w-full h-12 text-lg font-medium bg-primary hover:bg-primary/90"
                size="lg"
              >
                <Play className="w-5 h-5 mr-3" />
                Continue Working
              </Button>
              
              <Button 
                onClick={handleBreak}
                variant="outline"
                className="w-full h-12 text-lg font-medium border-2 hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-950/20"
                size="lg"
              >
                <Coffee className="w-5 h-5 mr-3" />
                Take a Break
              </Button>
            </div>
          )}

          {/* Manual override for playlist mode */}
          {playlistMode && (
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-3">
                Want to make a different choice?
              </p>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleContinue}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Continue
                </Button>
                <Button 
                  onClick={handleBreak}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Break
                </Button>
              </div>
            </div>
          )}

          {/* Calming footer message */}
          <div className="text-xs text-muted-foreground leading-relaxed pt-4 border-t border-border">
            Take a moment to appreciate your progress. Every session counts towards your goals.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}