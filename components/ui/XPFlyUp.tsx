'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'

interface XPFlyUpProps {
  xp: number
  startPosition: { x: number; y: number }
  onComplete: () => void
  id: string
}

interface XPFlyUpManagerProps {
  animations: XPFlyUpProps[]
  onAnimationComplete: (id: string) => void
}

export const XPFlyUp: React.FC<XPFlyUpProps> = ({ 
  xp, 
  startPosition, 
  onComplete,
  id 
}) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onComplete, 300) // Wait for fade out
    }, 2000) // Show for 2 seconds

    return () => clearTimeout(timer)
  }, [onComplete])

  if (typeof window === 'undefined') return null

  return createPortal(
    <div
      className={cn(
        'fixed pointer-events-none z-50 transition-all duration-2000 ease-out',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-20'
      )}
      style={{
        left: startPosition.x - 50, // Center the element
        top: startPosition.y - 20,
        transform: `translateY(${isVisible ? '-100px' : '-120px'})`
      }}
    >
      <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
        <Star className="w-4 h-4 fill-current" />
        <span>+{xp} XP</span>
      </div>
    </div>,
    document.body
  )
}

export const XPFlyUpManager: React.FC<XPFlyUpManagerProps> = ({ 
  animations, 
  onAnimationComplete 
}) => {
  return (
    <>
      {animations.map(animation => (
        <XPFlyUp
          key={animation.id}
          {...animation}
          onComplete={() => onAnimationComplete(animation.id)}
        />
      ))}
    </>
  )
}

// Hook to manage XP animations
export const useXPAnimation = () => {
  const [animations, setAnimations] = useState<XPFlyUpProps[]>([])

  const triggerXPAnimation = (xp: number, element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    const id = `xp-${Date.now()}-${Math.random()}`
    
    const newAnimation: XPFlyUpProps = {
      id,
      xp,
      startPosition: {
        x: rect.left + rect.width / 2,
        y: rect.top
      },
      onComplete: () => {} // Will be overridden
    }

    setAnimations(prev => [...prev, newAnimation])
  }

  const handleAnimationComplete = (id: string) => {
    setAnimations(prev => prev.filter(anim => anim.id !== id))
  }

  return {
    animations,
    triggerXPAnimation,
    handleAnimationComplete
  }
}