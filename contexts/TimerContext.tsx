'use client'

import React, { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { playCompletionSound, triggerConfetti, getXpForSession } from '@/lib/utils'

export interface TimerState {
  isRunning: boolean
  isPaused: boolean
  remaining: number
  elapsed: number
  mode: 'focus' | 'short' | 'long'
  showSessionComplete: boolean
  sessionJustCompleted: boolean
}

interface TimerContextType extends TimerState {
  startTimer: (mode: 'focus' | 'short' | 'long') => void
  startPlaylist: () => void
  pauseTimer: () => void
  resumeTimer: () => void
  resetTimer: () => void
  adjustTime: (mode: 'focus' | 'short' | 'long', adjustment: number) => void
  handleSessionContinue: () => void
  handleSessionBreak: () => void
  dismissSessionComplete: () => void
}

const TimerContext = createContext<TimerContextType | null>(null)

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    remaining: 0,
    elapsed: 0,
    mode: 'focus',
    showSessionComplete: false,
    sessionJustCompleted: false
  })
  
  const [isClient, setIsClient] = useState(false)
  const workerRef = useRef<Worker | null>(null)
  const startTimeRef = useRef<number>(0)
  
  // Safely access store with default values
  const store = useAppStore()
  const { 
    defaultFocus = 25 * 60, 
    defaultShort = 5 * 60, 
    defaultLong = 15 * 60, 
    completionSound = 'gentle-chime',
    continueInBackground = false,
    preventTimerPause = false,
    playlistMode = false,
    currentPlaylist = [],
    currentPlaylistIndex = 0,
    nextPlaylistTask = () => {},
    resetPlaylistIndex = () => {},
    addXp = () => {}, 
    completeSession = () => {}, 
    updateDailyStats = () => {}, 
    updateQuestsOnSessionComplete = () => {} 
  } = store || {}
  
  // Handle client-side mounting
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Initialize Web Worker and recover timer state
  useEffect(() => {
    if (!isClient) return
    
    workerRef.current = new Worker('/timer-worker.js')
      
      workerRef.current.onmessage = (e) => {
        const { type, payload } = e.data
        
        switch (type) {
          case 'TICK':
            setState(prev => ({
              ...prev,
              remaining: payload.remaining,
              elapsed: payload.elapsed
            }))
            break
          case 'COMPLETE':
            // Clear any stored timer state on completion
            localStorage.removeItem('timerState')
            handleTimerComplete(payload.elapsed)
            break
          case 'TIME_UPDATE':
            setState(prev => ({
              ...prev,
              remaining: payload.remaining,
              elapsed: payload.elapsed
            }))
            break
        }
      }
      
      // Try to recover timer state on page load only if continueInBackground is enabled
      const savedTimerState = localStorage.getItem('timerState')
      if (savedTimerState && (continueInBackground || preventTimerPause)) {
        try {
          const timerState = JSON.parse(savedTimerState)
          const now = Date.now()
          const timeSinceStart = Math.floor((now - timerState.startTime) / 1000)
          
          if (timerState.isRunning && timeSinceStart < (timerState.elapsed + timerState.remaining)) {
            // Timer should still be running
            const newElapsed = Math.min(timeSinceStart, timerState.elapsed + timerState.remaining)
            const newRemaining = Math.max(0, (timerState.elapsed + timerState.remaining) - timeSinceStart)
            
            setState({
              isRunning: true,
              isPaused: false,
              remaining: newRemaining,
              elapsed: newElapsed,
              mode: timerState.mode,
              showSessionComplete: false,
              sessionJustCompleted: false
            })
            
            startTimeRef.current = timerState.startTime
            
            if (newRemaining > 0) {
              // Continue the timer from where it left off
              workerRef.current.postMessage({ 
                type: 'START', 
                payload: { duration: newRemaining } 
              })
            } else {
              // Timer should have completed while away
              localStorage.removeItem('timerState')
              handleTimerComplete(timerState.elapsed + timerState.remaining)
            }
          } else {
            // Timer is no longer valid
            localStorage.removeItem('timerState')
          }
        } catch (error) {
          console.error('Error recovering timer state:', error)
          localStorage.removeItem('timerState')
        }
      } else if (savedTimerState && !continueInBackground && !preventTimerPause) {
        // Clear any stored state if both background continuation and prevent timer pause are disabled
        localStorage.removeItem('timerState')
      }
      
      return () => {
        workerRef.current?.terminate()
      }
  }, [isClient, continueInBackground, preventTimerPause])
  
  // Handle page visibility changes - pause timer by default unless continueInBackground or preventTimerPause is enabled
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is now hidden
        if (state.isRunning && !state.isPaused && !continueInBackground && !preventTimerPause) {
          // Pause the timer if both background continuation and prevent timer pause are disabled
          if (workerRef.current) {
            workerRef.current.postMessage({ type: 'PAUSE' })
          }
          setState(prev => ({
            ...prev,
            isPaused: true
          }))
        }
        // If continueInBackground or preventTimerPause is enabled, timer continues running
      } else {
        // Page is visible again
        if (state.isRunning && !state.isPaused) {
          // Sync with worker time if timer is running
          if (workerRef.current) {
            workerRef.current.postMessage({ type: 'GET_TIME' })
          }
        }
      }
    }
    
    const handleBeforeUnload = () => {
      // Only store timer state if background continuation or prevent timer pause is enabled
      if ((continueInBackground || preventTimerPause) && state.isRunning && !state.isPaused) {
        localStorage.setItem('timerState', JSON.stringify({
          isRunning: state.isRunning,
          mode: state.mode,
          startTime: startTimeRef.current,
          elapsed: state.elapsed,
          remaining: state.remaining
        }))
      } else {
        // Clear stored state if both background continuation and prevent timer pause are disabled
        localStorage.removeItem('timerState')
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [state.isRunning, state.isPaused, state.elapsed, state.mode, state.remaining, continueInBackground, preventTimerPause])
  
  const handleTimerComplete = useCallback((elapsedSeconds?: number) => {
    setState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      remaining: 0,
      elapsed: elapsedSeconds || prev.elapsed,
      showSessionComplete: true,
      sessionJustCompleted: true
    }))
    
    // Use elapsed seconds from parameter or fallback to state
    const finalElapsed = elapsedSeconds || state.elapsed
    const minutes = Math.floor(finalElapsed / 60)
    const baseXp = getXpForSession(minutes)
    
    addXp(baseXp)
    completeSession(minutes)
    updateDailyStats(minutes)
    updateQuestsOnSessionComplete(minutes)
    
    // Play sound and show confetti
    playCompletionSound(completionSound)
    triggerConfetti()
  }, [state.elapsed, completionSound, addXp, completeSession, updateDailyStats, updateQuestsOnSessionComplete])
  
  const startTimer = useCallback((mode: 'focus' | 'short' | 'long') => {
    const durations = { focus: defaultFocus, short: defaultShort, long: defaultLong }
    const duration = durations[mode]
    
    setState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      remaining: duration,
      elapsed: 0,
      mode
    }))
    
    startTimeRef.current = Date.now()
    
    if (workerRef.current) {
      workerRef.current.postMessage({ 
        type: 'START', 
        payload: { duration } 
      })
    }
  }, [defaultFocus, defaultShort, defaultLong])

  const startPlaylist = useCallback(() => {
    if (currentPlaylist.length === 0) return
    
    const firstTask = currentPlaylist[0]
    if (!firstTask) return
    
    // Ensure playlist mode is enabled and index is reset
    resetPlaylistIndex()
    
    setState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      remaining: firstTask.duration,
      elapsed: 0,
      mode: firstTask.type,
      showSessionComplete: false,
      sessionJustCompleted: false
    }))
    
    startTimeRef.current = Date.now()
    
    if (workerRef.current) {
      workerRef.current.postMessage({ 
        type: 'START', 
        payload: { duration: firstTask.duration } 
      })
    }
  }, [currentPlaylist, resetPlaylistIndex])
  
  const pauseTimer = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'PAUSE' })
    }
    
    setState(prev => ({
      ...prev,
      isPaused: true
    }))
  }, [])
  
  const resumeTimer = useCallback(() => {
    if (workerRef.current && state.isPaused) {
      const remaining = state.remaining
      const elapsed = state.elapsed
      
      setState(prev => ({
        ...prev,
        isPaused: false
      }))
      
      startTimeRef.current = Date.now() - (elapsed * 1000)
      
      workerRef.current.postMessage({ 
        type: 'START', 
        payload: { duration: remaining } 
      })
    }
  }, [state.isPaused, state.remaining, state.elapsed])
  
  const resetTimer = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'RESET' })
    }
    
    // Clear any stored timer state
    localStorage.removeItem('timerState')
    
    setState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      remaining: 0,
      elapsed: 0
    }))
  }, [])
  
  const adjustTime = useCallback((mode: 'focus' | 'short' | 'long', adjustment: number) => {
    const durations = { focus: defaultFocus, short: defaultShort, long: defaultLong }
    const currentDuration = durations[mode]
    const newDuration = Math.max(60, currentDuration + adjustment) // Minimum 1 minute
    
    // Update store
    if (mode === 'focus') {
      useAppStore.getState().setTimerDefaults(newDuration, defaultShort, defaultLong)
    } else if (mode === 'short') {
      useAppStore.getState().setTimerDefaults(defaultFocus, newDuration, defaultLong)
    } else {
      useAppStore.getState().setTimerDefaults(defaultFocus, defaultShort, newDuration)
    }
    
    // If timer is not running, update the display
    if (!state.isRunning) {
      setState(prev => ({
        ...prev,
        remaining: newDuration
      }))
    }
  }, [defaultFocus, defaultShort, defaultLong, state.isRunning])

  const handleSessionContinue = useCallback(() => {
    setState(prev => ({
      ...prev,
      showSessionComplete: false,
      sessionJustCompleted: false
    }))
    
    if (playlistMode && currentPlaylist.length > 0) {
      nextPlaylistTask()
      const nextIndex = currentPlaylistIndex + 1
      if (nextIndex < currentPlaylist.length) {
        const nextTask = currentPlaylist[nextIndex]
        startTimer(nextTask.type)
      }
    } else {
      // Default behavior - restart same timer type
      startTimer(state.mode)
    }
  }, [playlistMode, currentPlaylist, currentPlaylistIndex, nextPlaylistTask, startTimer, state.mode])

  const handleSessionBreak = useCallback(() => {
    setState(prev => ({
      ...prev,
      showSessionComplete: false,
      sessionJustCompleted: false
    }))

    // Don't auto-start timer when user chooses "Take a Break"
    // Let them manually choose when to continue
  }, [state.mode])

  const dismissSessionComplete = useCallback(() => {
    setState(prev => ({
      ...prev,
      showSessionComplete: false,
      sessionJustCompleted: false
    }))
  }, [])
  
  return (
    <TimerContext.Provider value={{
      ...state,
      startTimer,
      startPlaylist,
      pauseTimer,
      resumeTimer,
      resetTimer,
      adjustTime,
      handleSessionContinue,
      handleSessionBreak,
      dismissSessionComplete
    }}>
      {children}
    </TimerContext.Provider>
  )
}

export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext)
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider')
  }
  return context
}