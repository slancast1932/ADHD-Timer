import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${remainingMinutes}m`
}

export function getXpForSession(minutes: number): number {
  // Base XP rate: 2 XP per minute
  // Bonus for longer sessions: additional 0.1 XP per minute for every minute over 15
  const baseXP = minutes * 2
  const bonusXP = Math.max(0, minutes - 15) * 0.1
  return Math.floor(baseXP + bonusXP)
}

export type SoundType = 'gentle-chime' | 'success-bells' | 'nature-birds' | 'soft-piano' | 'meditation-bowl' | 'digital-beep'

export function playCompletionSound(soundType: SoundType = 'gentle-chime') {
  if (typeof window === 'undefined') return
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    switch (soundType) {
      case 'gentle-chime':
        playGentleChime(audioContext)
        break
      case 'success-bells':
        playSuccessBells(audioContext)
        break
      case 'nature-birds':
        playNatureBirds(audioContext)
        break
      case 'soft-piano':
        playSoftPiano(audioContext)
        break
      case 'meditation-bowl':
        playMeditationBowl(audioContext)
        break
      case 'digital-beep':
        playDigitalBeep(audioContext)
        break
      default:
        playGentleChime(audioContext)
    }
  } catch (error) {
    console.warn('Audio playback failed:', error)
  }
}

function playGentleChime(audioContext: AudioContext) {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
  oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // E5
  oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2) // G5
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1)
  
  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 1)
}

function playSuccessBells(audioContext: AudioContext) {
  const frequencies = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
  
  frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)
    
    const startTime = audioContext.currentTime + (index * 0.1)
    gainNode.gain.setValueAtTime(0.2, startTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5)
    
    oscillator.start(startTime)
    oscillator.stop(startTime + 0.5)
  })
}

function playNatureBirds(audioContext: AudioContext) {
  // Create bird-like chirping sounds
  const birdFreqs = [1200, 1800, 1400, 2000, 1600]
  
  birdFreqs.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)
    
    const startTime = audioContext.currentTime + (index * 0.2)
    gainNode.gain.setValueAtTime(0.1, startTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1)
    
    oscillator.start(startTime)
    oscillator.stop(startTime + 0.1)
  })
}

function playSoftPiano(audioContext: AudioContext) {
  // C major arpeggio
  const notes = [261.63, 329.63, 392.00, 523.25] // C4, E4, G4, C5
  
  notes.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)
    
    const startTime = audioContext.currentTime + (index * 0.15)
    gainNode.gain.setValueAtTime(0.25, startTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8)
    
    oscillator.start(startTime)
    oscillator.stop(startTime + 0.8)
  })
}

function playMeditationBowl(audioContext: AudioContext) {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(220, audioContext.currentTime) // A3
  oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 2)
  
  gainNode.gain.setValueAtTime(0.4, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 3)
  
  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 3)
}

function playDigitalBeep(audioContext: AudioContext) {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  
  oscillator.type = 'square'
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
  
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
  
  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.3)
}

// Keep the old function for backward compatibility
export function playChime() {
  playCompletionSound('gentle-chime')
}

export function triggerConfetti() {
  const event = new CustomEvent('trigger-confetti')
  window.dispatchEvent(event)
}



