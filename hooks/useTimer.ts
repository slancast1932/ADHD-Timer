import { useState, useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { playCompletionSound, triggerConfetti, getXpForSession } from '@/lib/utils'

export interface TimerState {
  isRunning: boolean
  isPaused: boolean
  remaining: number
  elapsed: number
  mode: 'focus' | 'short' | 'long'
}

export function useTimer() {
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    remaining: 0,
    elapsed: 0,
    mode: 'focus'
  })
  
  const workerRef = useRef<Worker | null>(null)
  const startTimeRef = useRef<number>(0)
  const { defaultFocus, defaultShort, defaultLong, completionSound, addXp, completeSession, updateDailyStats } = useAppStore()
  
  // Initialize Web Worker
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
            handleTimerComplete()
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
      
      return () => {
        workerRef.current?.terminate()
      }
    }
  }, [])
  
  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && state.isRunning && !state.isPaused) {
        // Page is hidden, timer continues in worker
        startTimeRef.current = Date.now() - (state.elapsed * 1000)
      } else if (!document.hidden && state.isRunning && !state.isPaused) {
        // Page is visible again, reconcile time
        if (workerRef.current) {
          workerRef.current.postMessage({ type: 'GET_TIME' })
        }
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [state.isRunning, state.isPaused, state.elapsed])
  
  const handleTimerComplete = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      remaining: 0
    }))
    
    // Calculate XP based on mode
    const modeDurations = { focus: defaultFocus, short: defaultShort, long: defaultLong }
    const minutes = Math.floor(modeDurations[state.mode] / 60)
    const baseXp = getXpForSession(minutes)
    
    addXp(baseXp)
    completeSession(minutes)
    updateDailyStats(minutes)
    
    // Play sound and show confetti
    playCompletionSound(completionSound)
    triggerConfetti()
  }, [state.mode, defaultFocus, defaultShort, defaultLong, completionSound, addXp, completeSession, updateDailyStats])
  
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
  
  return {
    ...state,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    adjustTime
  }
}
