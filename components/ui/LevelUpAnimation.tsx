'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { LevelBadge } from './LevelBadge'
import { Sparkles, Trophy, Star, Crown } from 'lucide-react'

interface LevelUpAnimationProps {
  newLevel: number
  onComplete: () => void
  id: string
}

interface LevelUpManagerProps {
  animations: LevelUpAnimationProps[]
  onAnimationComplete: (id: string) => void
}

export const LevelUpAnimation: React.FC<LevelUpAnimationProps> = ({
  newLevel,
  onComplete,
  id
}) => {
  const [phase, setPhase] = useState<'enter' | 'celebrate' | 'exit'>('enter')

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('celebrate'), 500)
    const timer2 = setTimeout(() => setPhase('exit'), 3000)
    const timer3 = setTimeout(() => onComplete(), 4000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [onComplete])

  if (typeof window === 'undefined') return null

  const getPhaseStyles = () => {
    switch (phase) {
      case 'enter':
        return 'opacity-0 scale-50 translate-y-10'
      case 'celebrate':
        return 'opacity-100 scale-100 translate-y-0'
      case 'exit':
        return 'opacity-0 scale-110 translate-y-[-10px]'
      default:
        return 'opacity-0'
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      {/* Backdrop with sparkles */}
      <div 
        className={cn(
          'absolute inset-0 bg-black/20 transition-opacity duration-1000',
          phase === 'celebrate' ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Animated sparkles */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'absolute animate-bounce',
                phase === 'celebrate' && 'animate-pulse'
              )}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            >
              <Sparkles 
                className="w-4 h-4 text-yellow-400 fill-current" 
                style={{
                  filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.7))'
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Main level up content */}
      <div 
        className={cn(
          'bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 p-8 rounded-2xl shadow-2xl',
          'border-2 border-white/20 backdrop-blur-sm',
          'transition-all duration-1000 ease-out',
          getPhaseStyles()
        )}
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 50%, #7c3aed 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 40px rgba(124, 58, 237, 0.4)'
        }}
      >
        <div className="text-center space-y-4">
          {/* Level up text */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">
              LEVEL UP!
            </h1>
            <div className="flex items-center justify-center space-x-2">
              <Trophy className="w-6 h-6 text-yellow-400 fill-current" />
              <span className="text-xl text-white/90">
                Congratulations!
              </span>
              <Trophy className="w-6 h-6 text-yellow-400 fill-current" />
            </div>
          </div>

          {/* Level badge showcase */}
          <div className="flex items-center justify-center space-x-4 py-4">
            <div className="text-center">
              <div className="text-white/70 text-sm mb-2">Previous</div>
              <LevelBadge level={newLevel - 1} size="md" />
            </div>
            
            <div className="flex items-center space-x-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    'w-3 h-3 text-yellow-400 fill-current',
                    phase === 'celebrate' && 'animate-pulse'
                  )}
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            
            <div className="text-center">
              <div className="text-white/70 text-sm mb-2">New Level!</div>
              <LevelBadge 
                level={newLevel} 
                size="lg" 
                showAnimation={phase === 'celebrate'}
              />
            </div>
          </div>

          {/* Level number display */}
          <div className="space-y-2">
            <div className="text-6xl font-bold text-white drop-shadow-lg">
              {newLevel}
            </div>
            <div className="text-lg text-white/80">
              You've reached level {newLevel}!
            </div>
          </div>

          {/* Reward message */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center justify-center space-x-2 text-white/90">
              <Crown className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="font-medium">
                Keep up the great work!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export const LevelUpManager: React.FC<LevelUpManagerProps> = ({
  animations,
  onAnimationComplete
}) => {
  return (
    <>
      {animations.map(animation => (
        <LevelUpAnimation
          key={animation.id}
          {...animation}
          onComplete={() => onAnimationComplete(animation.id)}
        />
      ))}
    </>
  )
}

// Hook to manage level up animations
export const useLevelUpAnimation = () => {
  const [animations, setAnimations] = useState<LevelUpAnimationProps[]>([])

  const triggerLevelUpAnimation = (newLevel: number) => {
    const id = `levelup-${Date.now()}-${Math.random()}`
    
    const newAnimation: LevelUpAnimationProps = {
      id,
      newLevel,
      onComplete: () => {} // Will be overridden
    }

    setAnimations(prev => [...prev, newAnimation])
  }

  const handleAnimationComplete = (id: string) => {
    setAnimations(prev => prev.filter(anim => anim.id !== id))
  }

  return {
    animations,
    triggerLevelUpAnimation,
    handleAnimationComplete
  }
}