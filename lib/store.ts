import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SoundType } from './utils'

export interface TimerMode {
  id: string
  name: string
  duration: number // in seconds
  color: string
}

export interface Quest {
  id: string
  title: string
  description: string
  xp: number
  type: 'daily' | 'weekly'
  status: 'active' | 'completed' | 'claimed'
  completedAt?: Date
}

export interface AppState {
  // Timer settings
  defaultFocus: number
  defaultShort: number
  defaultLong: number
  
  // User preferences
  reducedMotion: boolean
  highContrast: boolean
  autoStartBreaks: boolean
  reminderTime?: string
  completionSound: SoundType
  
  // Progress tracking
  totalXp: number
  pendingXp: number
  level: number
  currentStreak: number
  longestStreak: number
  sessionsCompleted: number
  totalMinutes: number
  
  // Daily stats (last 14 days)
  dailyStats: Array<{
    date: string
    minutes: number
    sessions: number
  }>
  
  // Quests
  quests: Quest[]
  
  // Actions
  setTimerDefaults: (focus: number, short: number, long: number) => void
  toggleReducedMotion: () => void
  toggleHighContrast: () => void
  toggleAutoStartBreaks: () => void
  setReminderTime: (time: string) => void
  setCompletionSound: (sound: SoundType) => void
  addXp: (amount: number) => void
  claimPendingXp: () => void
  completeSession: (minutes: number) => void
  updateDailyStats: (minutes: number) => void
  completeQuest: (questId: string) => void
  claimQuest: (questId: string) => void
  resetData: () => void
}

const calculateLevel = (xp: number): number => {
  return Math.floor(Math.pow(xp / 500, 0.6) * 10)
}

const getDefaultQuests = (): Quest[] => [
  {
    id: 'daily-1',
    title: 'Complete 3 Focus Sessions',
    description: 'Finish 3 focus sessions today',
    xp: 50,
    type: 'daily',
    status: 'active'
  },
  {
    id: 'daily-2',
    title: 'Focus for 2 Hours',
    description: 'Accumulate 2 hours of focus time today',
    xp: 100,
    type: 'daily',
    status: 'active'
  },
  {
    id: 'weekly-1',
    title: '7-Day Streak',
    description: 'Maintain focus for 7 consecutive days',
    xp: 300,
    type: 'weekly',
    status: 'active'
  },
  {
    id: 'weekly-2',
    title: 'Complete 20 Sessions',
    description: 'Finish 20 focus sessions this week',
    xp: 250,
    type: 'weekly',
    status: 'active'
  }
]

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Default values
      defaultFocus: 25 * 60, // 25 minutes
      defaultShort: 5 * 60,  // 5 minutes
      defaultLong: 15 * 60,  // 15 minutes
      
      reducedMotion: false,
      highContrast: false,
      autoStartBreaks: false,
      completionSound: 'gentle-chime',
      
      totalXp: 0,
      pendingXp: 0,
      level: 0,
      currentStreak: 0,
      longestStreak: 0,
      sessionsCompleted: 0,
      totalMinutes: 0,
      
      dailyStats: Array.from({ length: 14 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        return {
          date: date.toISOString().split('T')[0],
          minutes: 0,
          sessions: 0
        }
      }).reverse(),
      
      quests: getDefaultQuests(),
      
      // Actions
      setTimerDefaults: (focus, short, long) => set({
        defaultFocus: focus,
        defaultShort: short,
        defaultLong: long
      }),
      
      toggleReducedMotion: () => set(state => ({
        reducedMotion: !state.reducedMotion
      })),
      
      toggleHighContrast: () => set(state => ({
        highContrast: !state.highContrast
      })),
      
      toggleAutoStartBreaks: () => set(state => ({
        autoStartBreaks: !state.autoStartBreaks
      })),
      
      setReminderTime: (time) => set({ reminderTime: time }),
      
      setCompletionSound: (sound) => set({ completionSound: sound }),
      
      addXp: (amount) => set(state => ({
        pendingXp: state.pendingXp + amount
      })),
      
      claimPendingXp: () => set(state => {
        const newTotalXp = state.totalXp + state.pendingXp
        return {
          totalXp: newTotalXp,
          pendingXp: 0,
          level: calculateLevel(newTotalXp)
        }
      }),
      
      completeSession: (minutes) => set(state => {
        const newSessionsCompleted = state.sessionsCompleted + 1
        const newTotalMinutes = state.totalMinutes + minutes
        
        // Update streak logic
        const today = new Date().toISOString().split('T')[0]
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]
        
        const todayStats = state.dailyStats.find(stat => stat.date === today)
        const yesterdayStats = state.dailyStats.find(stat => stat.date === yesterdayStr)
        
        let newCurrentStreak = state.currentStreak
        if (yesterdayStats && yesterdayStats.minutes > 0) {
          newCurrentStreak += 1
        } else if (todayStats && todayStats.minutes === 0) {
          newCurrentStreak = 1
        }
        
        return {
          sessionsCompleted: newSessionsCompleted,
          totalMinutes: newTotalMinutes,
          currentStreak: newCurrentStreak,
          longestStreak: Math.max(newCurrentStreak, state.longestStreak)
        }
      }),
      
      updateDailyStats: (minutes) => set(state => {
        const today = new Date().toISOString().split('T')[0]
        const newDailyStats = state.dailyStats.map(stat => 
          stat.date === today 
            ? { ...stat, minutes: stat.minutes + minutes, sessions: stat.sessions + 1 }
            : stat
        )
        return { dailyStats: newDailyStats }
      }),
      
      completeQuest: (questId) => set(state => ({
        quests: state.quests.map(quest =>
          quest.id === questId
            ? { ...quest, status: 'completed', completedAt: new Date() }
            : quest
        )
      })),
      
      claimQuest: (questId) => set(state => {
        const quest = state.quests.find(q => q.id === questId)
        if (!quest || quest.status !== 'completed') return state
        
        return {
          quests: state.quests.map(q =>
            q.id === questId ? { ...q, status: 'claimed' } : q
          ),
          pendingXp: state.pendingXp + quest.xp
        }
      }),
      
      resetData: () => set({
        totalXp: 0,
        pendingXp: 0,
        level: 0,
        currentStreak: 0,
        longestStreak: 0,
        sessionsCompleted: 0,
        totalMinutes: 0,
        dailyStats: Array.from({ length: 14 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - i)
          return {
            date: date.toISOString().split('T')[0],
            minutes: 0,
            sessions: 0
          }
        }).reverse(),
        quests: getDefaultQuests()
      })
    }),
    {
      name: 'focusquest-storage',
      partialize: (state) => ({
        defaultFocus: state.defaultFocus,
        defaultShort: state.defaultShort,
        defaultLong: state.defaultLong,
        reducedMotion: state.reducedMotion,
        highContrast: state.highContrast,
        autoStartBreaks: state.autoStartBreaks,
        reminderTime: state.reminderTime,
        completionSound: state.completionSound,
        totalXp: state.totalXp,
        pendingXp: state.pendingXp,
        level: state.level,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        sessionsCompleted: state.sessionsCompleted,
        totalMinutes: state.totalMinutes,
        dailyStats: state.dailyStats,
        quests: state.quests
      })
    }
  )
)
