'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Crown, Star, Shield, Award, Zap } from 'lucide-react'

interface LevelBadgeProps {
  level: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showAnimation?: boolean
  className?: string
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({ 
  level, 
  size = 'md', 
  showAnimation = false, 
  className 
}) => {
  const getLevelTier = (level: number) => {
    if (level >= 50) return { tier: 'legendary', color: 'from-purple-400 to-pink-400', icon: Crown }
    if (level >= 30) return { tier: 'platinum', color: 'from-slate-300 to-slate-100', icon: Zap }
    if (level >= 20) return { tier: 'gold', color: 'from-yellow-400 to-yellow-200', icon: Award }
    if (level >= 10) return { tier: 'silver', color: 'from-slate-400 to-slate-200', icon: Shield }
    return { tier: 'bronze', color: 'from-orange-400 to-orange-200', icon: Star }
  }

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }

  const { tier, color, icon: Icon } = getLevelTier(level)

  return (
    <div className={cn(
      'relative inline-flex items-center justify-center rounded-full font-bold text-white shadow-lg',
      `bg-gradient-to-br ${color}`,
      sizeClasses[size],
      showAnimation && 'animate-pulse',
      className
    )}>
      {/* Outer ring for higher tiers */}
      {level >= 10 && (
        <div className={cn(
          'absolute inset-0 rounded-full border-2',
          level >= 50 ? 'border-purple-300 animate-pulse' :
          level >= 30 ? 'border-slate-400' :
          level >= 20 ? 'border-yellow-300' :
          'border-slate-500'
        )} />
      )}
      
      {/* Inner content */}
      <div className="relative flex flex-col items-center justify-center">
        <Icon className={cn(iconSizes[size], 'mb-1')} />
        <span className="font-bold leading-none">{level}</span>
      </div>
      
      {/* Shine effect for legendary */}
      {level >= 50 && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
      )}
      
      {/* Tier label tooltip */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-black/75 text-white text-xs px-2 py-1 rounded capitalize whitespace-nowrap">
          {tier} • Level {level}
        </div>
      </div>
    </div>
  )
}

export const getLevelInfo = (level: number) => {
  if (level >= 50) return { tier: 'Legendary', color: 'purple', description: 'Master of Focus' }
  if (level >= 30) return { tier: 'Platinum', color: 'slate', description: 'Focus Champion' }
  if (level >= 20) return { tier: 'Gold', color: 'yellow', description: 'Productivity Expert' }
  if (level >= 10) return { tier: 'Silver', color: 'slate', description: 'Consistent Focuser' }
  return { tier: 'Bronze', color: 'orange', description: 'Getting Started' }
}