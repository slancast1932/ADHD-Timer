'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'

export interface ProgressRingProps {
  progress: number // 0 to 1
  size?: number
  strokeWidth?: number
  className?: string
  children?: React.ReactNode
  color?: 'primary' | 'focus' | 'break'
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 200,
  strokeWidth = 8,
  className,
  children,
  color = 'primary'
}) => {
  const reducedMotion = useAppStore(state => state.reducedMotion)
  
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (progress * circumference)
  
  const colorClasses = {
    primary: 'text-primary',
    focus: 'text-focus',
    break: 'text-break'
  }
  
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        aria-label={`Progress: ${Math.round(progress * 100)}%`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted/20"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className={cn(
            colorClasses[color],
            reducedMotion ? 'timer-ring no-motion' : 'timer-ring'
          )}
          style={{
            strokeLinecap: 'round'
          }}
        />
      </svg>
      
      {/* Content overlay */}
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}
