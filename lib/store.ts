import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SoundType } from './utils'

export interface TimerMode {
  id: string
  name: string
  duration: number // in seconds
  color: string
}

export interface PlaylistTask {
  id: string
  name: string
  duration: number // in seconds
  type: 'focus' | 'short' | 'long'
  completed?: boolean
}

export interface Quest {
  id: string
  title: string
  description: string
  xp: number
  type: 'daily' | 'weekly'
  status: 'active' | 'completed' | 'claimed'
  completedAt?: Date
  progress?: number
  target?: number
}

export interface Pet {
  id: string
  name: string
  type: 'dragon' | 'plant' | 'cat'
  stage: 'baby' | 'adult' | 'evolved'
  hunger: number // 0-100
  happiness: number // 0-100
  health: number // 0-100
  totalCareGiven: number
  lastFed?: Date
  lastPlayed?: Date
  createdAt: Date
}

export interface AppState {
  // Timer settings
  defaultFocus: number
  defaultShort: number
  defaultLong: number
  
  // Playlist functionality
  currentPlaylist: PlaylistTask[]
  currentPlaylistIndex: number
  playlistMode: boolean
  sessionCompleteChoice: 'continue' | 'break' | null
  
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
  weeklyXPGoal: number
  weeklyXPEarned: number
  
  // Pet system
  pet: Pet | null
  
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
  updateQuestProgress: (questId: string, progress: number) => void
  updateQuestsOnSessionComplete: (minutes: number) => void
  resetData: () => void
  
  // Playlist actions
  setPlaylist: (playlist: PlaylistTask[]) => void
  addTaskToPlaylist: (task: PlaylistTask) => void
  removeTaskFromPlaylist: (taskId: string) => void
  setPlaylistMode: (enabled: boolean) => void
  nextPlaylistTask: () => void
  setSessionCompleteChoice: (choice: 'continue' | 'break' | null) => void
  
  // Pet actions
  createPet: (type: Pet['type'], name: string) => void
  feedPet: (xpCost: number) => boolean
  playWithPet: (xpCost: number) => boolean
  healPet: (xpCost: number) => boolean
  updatePetStatus: () => void
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
    status: 'active',
    progress: 0,
    target: 3
  },
  {
    id: 'daily-2',
    title: 'Focus for 2 Hours',
    description: 'Accumulate 2 hours of focus time today',
    xp: 100,
    type: 'daily',
    status: 'active',
    progress: 0,
    target: 120 // minutes
  },
  {
    id: 'weekly-1',
    title: '7-Day Streak',
    description: 'Maintain focus for 7 consecutive days',
    xp: 300,
    type: 'weekly',
    status: 'active',
    progress: 0,
    target: 7
  },
  {
    id: 'weekly-2',
    title: 'Complete 20 Sessions',
    description: 'Finish 20 focus sessions this week',
    xp: 250,
    type: 'weekly',
    status: 'active',
    progress: 0,
    target: 20
  }
]

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Default values
      defaultFocus: 25 * 60, // 25 minutes
      defaultShort: 5 * 60,  // 5 minutes
      defaultLong: 15 * 60,  // 15 minutes
      
      // Playlist defaults
      currentPlaylist: [],
      currentPlaylistIndex: 0,
      playlistMode: false,
      sessionCompleteChoice: null,
      
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
      weeklyXPGoal: 500,
      weeklyXPEarned: 0,
      
      pet: null,
      
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
        const newLevel = calculateLevel(newTotalXp)
        
        return {
          totalXp: newTotalXp,
          pendingXp: 0,
          level: newLevel
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
          pendingXp: state.pendingXp + quest.xp,
          weeklyXPEarned: state.weeklyXPEarned + quest.xp
        }
      }),
      
      updateQuestProgress: (questId, progress) => set(state => {
        const updatedQuests = state.quests.map(quest => {
          if (quest.id !== questId) return quest
          
          const newProgress = Math.min(progress, quest.target || 0)
          const shouldComplete = newProgress >= (quest.target || 0) && quest.status === 'active'
          
          return {
            ...quest,
            progress: newProgress,
            status: shouldComplete ? 'completed' : quest.status,
            completedAt: shouldComplete ? new Date() : quest.completedAt
          }
        })
        
        return { quests: updatedQuests }
      }),
      
      updateQuestsOnSessionComplete: (minutes) => set(state => {
        const updatedQuests = state.quests.map(quest => {
          if (quest.status !== 'active') return quest
          
          let newProgress = quest.progress || 0
          
          // Update quest progress based on quest type
          if (quest.id === 'daily-1' || quest.id === 'weekly-2') {
            // Session-based quests: increment by 1
            newProgress = (quest.progress || 0) + 1
          } else if (quest.id === 'daily-2') {
            // Time-based daily quest: add minutes
            newProgress = (quest.progress || 0) + minutes
          } else if (quest.id === 'weekly-1') {
            // Streak-based quest: use current streak
            newProgress = state.currentStreak
          }
          
          const shouldComplete = newProgress >= (quest.target || 0)
          
          return {
            ...quest,
            progress: Math.min(newProgress, quest.target || 0),
            status: shouldComplete ? 'completed' as const : quest.status,
            completedAt: shouldComplete ? new Date() : quest.completedAt
          }
        })
        
        return { quests: updatedQuests }
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
        quests: getDefaultQuests(),
        weeklyXPGoal: 500,
        weeklyXPEarned: 0,
        pet: null
      }),
      
      // Playlist actions
      setPlaylist: (playlist) => set({ currentPlaylist: playlist, currentPlaylistIndex: 0 }),
      
      addTaskToPlaylist: (task) => set(state => ({
        currentPlaylist: [...state.currentPlaylist, task]
      })),
      
      removeTaskFromPlaylist: (taskId) => set(state => ({
        currentPlaylist: state.currentPlaylist.filter(task => task.id !== taskId)
      })),
      
      setPlaylistMode: (enabled) => set(state => ({
        playlistMode: enabled,
        currentPlaylistIndex: enabled ? 0 : state.currentPlaylistIndex
      })),
      
      nextPlaylistTask: () => set(state => {
        const nextIndex = state.currentPlaylistIndex + 1
        if (nextIndex >= state.currentPlaylist.length) {
          return { currentPlaylistIndex: 0, playlistMode: false }
        }
        return { currentPlaylistIndex: nextIndex }
      }),
      
      setSessionCompleteChoice: (choice) => set({ sessionCompleteChoice: choice }),
      
      // Pet functions
      createPet: (type, name) => set(state => {
        if (state.pet) return state // Pet already exists
        
        const newPet: Pet = {
          id: crypto.randomUUID(),
          name,
          type,
          stage: 'baby',
          hunger: 100,
          happiness: 100,
          health: 100,
          totalCareGiven: 0,
          createdAt: new Date()
        }
        
        return { pet: newPet }
      }),
      
      feedPet: (xpCost) => {
        const state = get()
        if (!state.pet || state.totalXp < xpCost) return false
        
        set(state => {
          if (!state.pet) return state
          
          const newHunger = Math.min(100, state.pet.hunger + 25)
          const newHealth = Math.min(100, state.pet.health + 5)
          const newTotalCare = state.pet.totalCareGiven + 1
          
          // Check for evolution
          let newStage = state.pet.stage
          if (newTotalCare >= 100 && state.pet.stage === 'baby') newStage = 'adult'
          else if (newTotalCare >= 250 && state.pet.stage === 'adult') newStage = 'evolved'
          
          return {
            pet: {
              ...state.pet,
              hunger: newHunger,
              health: newHealth,
              totalCareGiven: newTotalCare,
              stage: newStage,
              lastFed: new Date()
            },
            totalXp: state.totalXp - xpCost
          }
        })
        return true
      },
      
      playWithPet: (xpCost) => {
        const state = get()
        if (!state.pet || state.totalXp < xpCost) return false
        
        set(state => {
          if (!state.pet) return state
          
          const newHappiness = Math.min(100, state.pet.happiness + 30)
          const newHealth = Math.min(100, state.pet.health + 3)
          const newTotalCare = state.pet.totalCareGiven + 1
          
          // Check for evolution
          let newStage = state.pet.stage
          if (newTotalCare >= 100 && state.pet.stage === 'baby') newStage = 'adult'
          else if (newTotalCare >= 250 && state.pet.stage === 'adult') newStage = 'evolved'
          
          return {
            pet: {
              ...state.pet,
              happiness: newHappiness,
              health: newHealth,
              totalCareGiven: newTotalCare,
              stage: newStage,
              lastPlayed: new Date()
            },
            totalXp: state.totalXp - xpCost
          }
        })
        return true
      },
      
      healPet: (xpCost) => {
        const state = get()
        if (!state.pet || state.totalXp < xpCost) return false
        
        set(state => {
          if (!state.pet) return state
          
          const newHealth = Math.min(100, state.pet.health + 40)
          const newTotalCare = state.pet.totalCareGiven + 1
          
          // Check for evolution
          let newStage = state.pet.stage
          if (newTotalCare >= 100 && state.pet.stage === 'baby') newStage = 'adult'
          else if (newTotalCare >= 250 && state.pet.stage === 'adult') newStage = 'evolved'
          
          return {
            pet: {
              ...state.pet,
              health: newHealth,
              totalCareGiven: newTotalCare,
              stage: newStage
            },
            totalXp: state.totalXp - xpCost
          }
        })
        return true
      },
      
      updatePetStatus: () => set(state => {
        if (!state.pet) return state
        
        const now = new Date()
        const hoursSinceLastFed = state.pet.lastFed 
          ? (now.getTime() - new Date(state.pet.lastFed).getTime()) / (1000 * 60 * 60)
          : 24
        const hoursSinceLastPlayed = state.pet.lastPlayed
          ? (now.getTime() - new Date(state.pet.lastPlayed).getTime()) / (1000 * 60 * 60)
          : 24
        
        // Decrease stats over time
        const hungerDecay = Math.min(state.pet.hunger, Math.floor(hoursSinceLastFed * 2))
        const happinessDecay = Math.min(state.pet.happiness, Math.floor(hoursSinceLastPlayed * 1.5))
        const healthDecay = state.pet.hunger < 20 || state.pet.happiness < 20 ? 5 : 0
        
        return {
          pet: {
            ...state.pet,
            hunger: Math.max(0, state.pet.hunger - hungerDecay),
            happiness: Math.max(0, state.pet.happiness - happinessDecay),
            health: Math.max(0, state.pet.health - healthDecay)
          }
        }
      })
    }),
    {
      name: 'focusrun-storage',
      partialize: (state) => ({
        defaultFocus: state.defaultFocus,
        defaultShort: state.defaultShort,
        defaultLong: state.defaultLong,
        currentPlaylist: state.currentPlaylist,
        currentPlaylistIndex: state.currentPlaylistIndex,
        playlistMode: state.playlistMode,
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
        quests: state.quests,
        weeklyXPGoal: state.weeklyXPGoal,
        weeklyXPEarned: state.weeklyXPEarned,
        pet: state.pet
      })
    }
  )
)



