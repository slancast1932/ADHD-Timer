'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number // 0-100
  className?: string
  indicatorClassName?: string
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  className,
  indicatorClassName
}) => {
  const clampedValue = Math.max(0, Math.min(100, value))
  
  return (
    <div className={cn(
      "relative h-3 w-full overflow-hidden rounded-full bg-muted",
      className
    )}>
      <div
        className={cn(
          "h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out",
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - clampedValue}%)` }}
      />
    </div>
  )
}