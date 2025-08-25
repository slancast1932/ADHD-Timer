'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface ConfettiPiece {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  color: string
  size: number
  opacity: number
}

const COLORS = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
  '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'
]

export const ConfettiCanvas: React.FC = () => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])
  const [isActive, setIsActive] = useState(false)
  
  useEffect(() => {
    const handleConfetti = () => {
      setIsActive(true)
      generateConfetti()
      
      // Auto-hide after animation
      setTimeout(() => {
        setIsActive(false)
        setPieces([])
      }, 3000)
    }
    
    window.addEventListener('trigger-confetti', handleConfetti)
    return () => window.removeEventListener('trigger-confetti', handleConfetti)
  }, [])
  
  const generateConfetti = () => {
    const newPieces: ConfettiPiece[] = []
    
    for (let i = 0; i < 50; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 8 + 4,
        opacity: 1
      })
    }
    
    setPieces(newPieces)
    
    // Animate pieces
    const animate = () => {
      setPieces(prevPieces => 
        prevPieces.map(piece => ({
          ...piece,
          x: piece.x + piece.vx,
          y: piece.y + piece.vy,
          rotation: piece.rotation + piece.rotationSpeed,
          vy: piece.vy + 0.1, // gravity
          opacity: piece.y > window.innerHeight * 0.8 ? 0 : piece.opacity
        }))
      )
    }
    
    const interval = setInterval(animate, 16) // 60fps
    setTimeout(() => clearInterval(interval), 3000)
  }
  
  if (!isActive || typeof window === 'undefined') return null
  
  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(piece => (
        <div
          key={piece.id}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            left: piece.x,
            top: piece.y,
            backgroundColor: piece.color,
            width: piece.size,
            height: piece.size,
            transform: `rotate(${piece.rotation}deg)`,
            opacity: piece.opacity,
            transition: 'opacity 0.1s ease-out'
          }}
        />
      ))}
    </div>,
    document.body
  )
}

