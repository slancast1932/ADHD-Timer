'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

interface XPProgressBarProps {
  currentXP: number
  level: number
  pendingXP?: number
  showAnimation?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({
  currentXP,
  level,
  pendingXP = 0,
  showAnimation = false,
  size = 'md',
  className
}) => {
  const [animatedXP, setAnimatedXP] = useState(currentXP)
  const [showPendingAnimation, setShowPendingAnimation] = useState(false)

  // Calculate XP needed for current and next level
  const getXPForLevel = (lvl: number) => Math.floor(Math.pow(lvl * 500, 0.6) * 10)
  const currentLevelXP = getXPForLevel(level)
  const nextLevelXP = getXPForLevel(level + 1)
  const xpInCurrentLevel = currentXP - currentLevelXP
  const xpNeededForNextLevel = nextLevelXP - currentLevelXP

  // Calculate progress percentage
  const progress = Math.min(Math.max(xpInCurrentLevel / xpNeededForNextLevel, 0), 1)
  const pendingProgress = Math.min((xpInCurrentLevel + pendingXP) / xpNeededForNextLevel, 1)

  // Animate XP changes
  useEffect(() => {
    if (showAnimation && pendingXP > 0) {
      setShowPendingAnimation(true)
      const timer = setTimeout(() => {
        setAnimatedXP(currentXP + pendingXP)
        setShowPendingAnimation(false)
      }, 500)
      return () => clearTimeout(timer)
    } else {
      setAnimatedXP(currentXP)
    }
  }, [currentXP, pendingXP, showAnimation])

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6'
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div className={cn('w-full', className)}>
      {/* XP Info Header */}
      <div className="flex items-center justify-between mb-2">
        <div className={cn('font-medium', textSizes[size])}>
          Level {level} Progress
        </div>
        <div className={cn('text-muted-foreground', textSizes[size])}>
          {Math.max(0, Math.floor(xpInCurrentLevel))} / {Math.floor(xpNeededForNextLevel)} XP
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative">
        {/* Background Bar */}
        <div className={cn(
          'w-full bg-muted rounded-full overflow-hidden',
          sizeClasses[size]
        )}>
          {/* Current Progress */}
          <div
            className={cn(
              'bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out',
              sizeClasses[size]
            )}
            style={{ width: `${progress * 100}%` }}
          />
          
          {/* Pending XP Preview */}
          {pendingXP > 0 && (
            <div
              className={cn(
                'absolute top-0 left-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-500',
                sizeClasses[size],
                showPendingAnimation && 'animate-pulse'
              )}
              style={{ 
                width: `${pendingProgress * 100}%`,
                opacity: showPendingAnimation ? 0.7 : 0.4
              }}
            />
          )}
        </div>

        {/* Sparkle Effects for Full Bar */}
        {progress >= 0.95 && (
          <div className="absolute inset-0 flex items-center justify-end pr-2">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
          </div>
        )}

        {/* Pending XP Indicator */}
        {pendingXP > 0 && (
          <div className="absolute -top-8 right-0 text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded font-bold animate-bounce">
            +{pendingXP} XP
          </div>
        )}
      </div>

      {/* Next Level Preview */}
      <div className={cn('flex items-center justify-between mt-1', textSizes[size])}>
        <span className="text-muted-foreground">
          {Math.max(0, Math.floor((1 - progress) * xpNeededForNextLevel))} XP to Level {level + 1}
        </span>
        {pendingXP > 0 && (
          <span className="text-yellow-600 font-medium">
            Pending: +{pendingXP} XP
          </span>
        )}
      </div>
    </div>
  )
}