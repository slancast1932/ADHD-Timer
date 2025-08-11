import React from 'react'
import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'

interface XPBadgeProps {
  xp: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const XPBadge: React.FC<XPBadgeProps> = ({ 
  xp, 
  size = 'md',
  className 
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-lg px-4 py-2'
  }
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }
  
  return (
    <div className={cn(
      'inline-flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-full shadow-sm',
      sizeClasses[size],
      className
    )}>
      <Star className={cn('fill-current', iconSizes[size])} />
      <span>{xp} XP</span>
    </div>
  )
}