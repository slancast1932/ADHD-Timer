'use client'

import React, { createContext, useContext, useEffect } from 'react'
import { useAppStore } from '@/lib/store'

interface ThemeContextType {
  highContrast: boolean
  reducedMotion: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  highContrast: false,
  reducedMotion: false
})

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { highContrast, reducedMotion } = useAppStore()
  
  useEffect(() => {
    // Apply high contrast theme
    if (highContrast) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }, [highContrast])
  
  useEffect(() => {
    // Apply reduced motion preference
    if (reducedMotion) {
      document.documentElement.style.setProperty('--reduced-motion', 'reduce')
    } else {
      document.documentElement.style.removeProperty('--reduced-motion')
    }
  }, [reducedMotion])
  
  return (
    <ThemeContext.Provider value={{ highContrast, reducedMotion }}>
      {children}
    </ThemeContext.Provider>
  )
}

