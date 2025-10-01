'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { useAppStore, Runner } from '@/lib/store'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const getTerrainEmoji = (terrain: Runner['terrain']): string => {
  switch (terrain) {
    case 'sunny': return '☀️'
    case 'park': return '🌳'
    case 'forest': return '🌲'
    case 'beach': return '🏖️'
    case 'rainy': return '🌧️'
    case 'snowy': return '❄️'
    default: return '☀️' // Default to sunny emoji
  }
}

const getRunnerEmoji = (runner: Runner): string => {
  const { terrain } = runner

  switch (terrain) {
    case 'sunny': return '🏃'
    case 'park': return '🏃'
    case 'forest': return '🏃🌲'
    case 'beach': return '🏃🏖️'
    case 'rainy': return '🏃🌧️'
    case 'snowy': return '🏃❄️'
    default: return '🏃'
  }
}

const getTerrainDisplayName = (terrain: Runner['terrain']): string => {
  switch (terrain) {
    case 'sunny': return 'Sunny Streets'
    case 'park': return 'City Park'
    case 'forest': return 'Forest Trails'
    case 'beach': return 'Beach Path'
    case 'rainy': return 'Rainy Roads'
    case 'snowy': return 'Snowy Slopes'
    default: return 'Sunny Streets' // Default to sunny if terrain is corrupted
  }
}

const getNextTerrainThreshold = (terrain: Runner['terrain']): number => {
  switch (terrain) {
    case 'sunny': return 5
    case 'park': return 12
    case 'forest': return 20
    case 'beach': return 30
    case 'rainy': return 42
    case 'snowy': return 42 // Already max
    default: return 5 // Default to sunny threshold
  }
}

interface RunnerComponentProps {
  className?: string
}

export const RunnerComponent: React.FC<RunnerComponentProps> = ({ className }) => {
  const {
    runner,
    totalXp,
    updateRunnerName,
    resetRunnerProgress
  } = useAppStore()

  const [runningAnimation, setRunningAnimation] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [newName, setNewName] = useState('')

  if (!runner) {
    return null
  }

  // Calculate runner's horizontal position (0-100%)
  const totalSessions = runner.sessionsCompleted ?? 0

  // Debug: Log runner data whenever component re-renders
  console.log('🏃‍♂️ RunnerComponent render:', {
    totalSessions,
    terrain: runner.terrain,
    runnerId: runner.id
  })
  const currentThreshold = getNextTerrainThreshold(runner.terrain)

  // Get the starting point for current terrain
  const getTerrainStartingSessions = (terrain: Runner['terrain']): number => {
    switch (terrain) {
      case 'sunny': return 0
      case 'park': return 5
      case 'forest': return 12
      case 'beach': return 20
      case 'rainy': return 30
      case 'snowy': return 42
      default: return 0
    }
  }

  const terrainStart = getTerrainStartingSessions(runner.terrain)
  const sessionsInCurrentTerrain = Math.max(0, totalSessions - terrainStart)
  const sessionsNeededForTerrain = currentThreshold - terrainStart

  // Calculate progression within current terrain

  // Ensure we don't divide by zero and handle the progression correctly
  const progressInCurrentTerrain = sessionsNeededForTerrain > 0
    ? Math.min(sessionsInCurrentTerrain / sessionsNeededForTerrain, 1)
    : 0

  // Clamp the runner position between 5% and 90%
  const runnerPosition = Math.max(5, Math.min(90, progressInCurrentTerrain * 85 + 5))

  // Add subtle running animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRunningAnimation(true)
      setTimeout(() => setRunningAnimation(false), 1000)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleNameEdit = () => {
    setNewName(runner.name)
    setIsEditingName(true)
  }

  const handleNameSave = () => {
    if (newName.trim()) {
      updateRunnerName(newName.trim())
      setIsEditingName(false)
    }
  }

  const handleNameCancel = () => {
    setIsEditingName(false)
    setNewName('')
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            {isEditingName ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="px-2 py-1 border rounded text-sm"
                  maxLength={20}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNameSave()
                    if (e.key === 'Escape') handleNameCancel()
                  }}
                />
                <Button size="sm" onClick={handleNameSave}>Save</Button>
                <Button size="sm" variant="outline" onClick={handleNameCancel}>Cancel</Button>
              </div>
            ) : (
              <button onClick={handleNameEdit} className="hover:text-primary cursor-pointer">
                {runner.name}
              </button>
            )}
          </div>
          <div className="text-sm text-muted-foreground flex items-center space-x-1">
            <span>{getTerrainEmoji(runner.terrain)}</span>
            <span>{getTerrainDisplayName(runner.terrain)}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Horizontal Running Track */}
        <div className="relative h-24 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg overflow-hidden">
          {/* Terrain Background Pattern */}
          <div className="absolute inset-0 opacity-30 text-6xl flex items-center justify-center">
            {getTerrainEmoji(runner.terrain)}
          </div>

          {/* Track Line */}
          <div className="absolute bottom-8 left-0 right-0 h-1 bg-gray-300"></div>

          {/* Runner */}
          <div
            className={cn(
              "absolute bottom-4 text-4xl transition-all duration-1000 ease-out transform scale-x-[-1]",
              runningAnimation && "animate-bounce"
            )}
            style={{ left: `${runnerPosition}%` }}
          >
            {getRunnerEmoji(runner)}
          </div>

          {/* Start/Finish Markers */}
          <div className="absolute bottom-2 left-2 text-green-600 font-bold text-xs">START</div>
          <div className="absolute bottom-2 right-2 text-red-600 font-bold text-xs">FINISH</div>
        </div>

        {/* Session Progress */}
        <div className="text-center space-y-2">
          <div className="text-2xl font-bold text-primary">
            {totalSessions} Sessions Completed
          </div>
          <div className="text-sm text-muted-foreground">
            Keep completing focus sessions to progress through new terrains!
          </div>
        </div>

        {/* Terrain Progress */}
        <div className="pt-3 border-t border-muted">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Current Terrain Progress</span>
            <span className="text-xs text-muted-foreground">
              {sessionsInCurrentTerrain} / {sessionsNeededForTerrain} sessions
            </span>
          </div>
          <Progress
            value={(sessionsInCurrentTerrain / sessionsNeededForTerrain) * 100}
            className="h-2"
            indicatorClassName="bg-gradient-to-r from-blue-500 to-green-500"
          />
          <div className="text-xs text-muted-foreground mt-1 text-center">
            {runner.terrain === 'snowy' ? 'MAX LEVEL REACHED!' :
              `Next terrain: ${runner.terrain === 'rainy' ? 'Snowy Slopes' :
              runner.terrain === 'beach' ? 'Rainy Roads' :
              runner.terrain === 'forest' ? 'Beach Path' :
              runner.terrain === 'park' ? 'Forest Trails' :
              'City Park'}`}
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Your XP: {totalXp}
        </div>

        {/* Debug Reset Button - Remove in production */}
        <div className="text-center pt-2">
          <Button
            onClick={resetRunnerProgress}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            🔄 Reset Runner (Debug)
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Runner Creation Modal Component
interface RunnerCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateRunner: (name: string) => void
}

export const RunnerCreationModal: React.FC<RunnerCreationModalProps> = ({
  isOpen,
  onClose,
  onCreateRunner
}) => {
  const [runnerName, setRunnerName] = useState('')

  if (!isOpen) return null

  const handleCreate = () => {
    if (runnerName.trim()) {
      onCreateRunner(runnerName.trim())
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Start Your Running Journey!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🏃‍♂️</div>
            <p className="text-muted-foreground">
              Begin your epic running adventure! Your runner will progress through different terrains as you complete focus sessions.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Name your runner:</label>
            <input
              type="text"
              value={runnerName}
              onChange={(e) => setRunnerName(e.target.value)}
              placeholder="Enter runner name..."
              className="w-full px-3 py-2 border border-muted rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={20}
            />
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!runnerName.trim()}
              className="flex-1"
            >
              Start Running
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}