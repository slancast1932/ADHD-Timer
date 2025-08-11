'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface QuestProgressProps {
  current: number
  target: number
  size?: 'sm' | 'md'
  color?: 'blue' | 'green' | 'purple' | 'orange'
  showLabel?: boolean
  className?: string
}

export const QuestProgress: React.FC<QuestProgressProps> = ({
  current,
  target,
  size = 'sm',
  color = 'blue',
  showLabel = true,
  className
}) => {
  const progress = Math.min(Math.max(current / target, 0), 1)
  const percentage = Math.round(progress * 100)

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3'
  }

  const colorClasses = {
    blue: 'from-blue-500 to-blue-400',
    green: 'from-green-500 to-green-400',
    purple: 'from-purple-500 to-purple-400',
    orange: 'from-orange-500 to-orange-400'
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Progress Bar */}
      <div className={cn(
        'w-full bg-muted/50 rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <div
          className={cn(
            'bg-gradient-to-r rounded-full transition-all duration-700 ease-out',
            colorClasses[color],
            sizeClasses[size],
            progress >= 1 && 'animate-pulse'
          )}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      
      {/* Progress Label */}
      {showLabel && (
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground">
            {current} / {target}
          </span>
          <span className={cn(
            'text-xs font-medium',
            progress >= 1 ? 'text-green-600' : 'text-muted-foreground'
          )}>
            {percentage}%
          </span>
        </div>
      )}
    </div>
  )
}