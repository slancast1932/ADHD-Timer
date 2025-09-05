'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAppStore, PlaylistTask } from '@/lib/store'
import { formatDuration } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { 
  Plus, 
  X, 
  Play, 
  Clock, 
  ChevronUp, 
  ChevronDown,
  Shuffle,
  ListMusic
} from 'lucide-react'

interface PlaylistManagerProps {
  className?: string
}

export const PlaylistManager: React.FC<PlaylistManagerProps> = ({ className }) => {
  const { 
    currentPlaylist, 
    playlistMode, 
    currentPlaylistIndex,
    defaultFocus,
    defaultShort,
    defaultLong,
    setPlaylist,
    addTaskToPlaylist,
    removeTaskFromPlaylist,
    setPlaylistMode
  } = useAppStore()
  
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTaskName, setNewTaskName] = useState('')
  const [newTaskType, setNewTaskType] = useState<'focus' | 'short' | 'long'>('focus')
  const [customDuration, setCustomDuration] = useState('')

  const getDurationForType = (type: 'focus' | 'short' | 'long') => {
    switch (type) {
      case 'focus': return defaultFocus
      case 'short': return defaultShort  
      case 'long': return defaultLong
      default: return defaultFocus
    }
  }

  const getTotalPlaylistTime = () => {
    return currentPlaylist.reduce((total, task) => total + task.duration, 0)
  }

  const handleAddTask = () => {
    if (!newTaskName.trim()) return

    const duration = customDuration 
      ? parseInt(customDuration) * 60 
      : getDurationForType(newTaskType)

    const newTask: PlaylistTask = {
      id: crypto.randomUUID(),
      name: newTaskName.trim(),
      duration,
      type: newTaskType,
      completed: false
    }

    addTaskToPlaylist(newTask)
    
    // Reset form
    setNewTaskName('')
    setCustomDuration('')
    setNewTaskType('focus')
    setShowAddTask(false)
  }

  const moveTask = (fromIndex: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
    if (newIndex < 0 || newIndex >= currentPlaylist.length) return

    const newPlaylist = [...currentPlaylist]
    const task = newPlaylist[fromIndex]
    newPlaylist.splice(fromIndex, 1)
    newPlaylist.splice(newIndex, 0, task)
    setPlaylist(newPlaylist)
  }

  const createQuickPlaylist = (type: 'balanced' | 'focused' | 'breaks') => {
    let playlist: PlaylistTask[] = []

    switch (type) {
      case 'balanced':
        playlist = [
          { id: crypto.randomUUID(), name: 'Deep Work Block 1', duration: defaultFocus, type: 'focus' },
          { id: crypto.randomUUID(), name: 'Quick Break', duration: defaultShort, type: 'short' },
          { id: crypto.randomUUID(), name: 'Deep Work Block 2', duration: defaultFocus, type: 'focus' },
          { id: crypto.randomUUID(), name: 'Refresher Break', duration: defaultLong, type: 'long' },
          { id: crypto.randomUUID(), name: 'Deep Work Block 3', duration: defaultFocus, type: 'focus' },
        ]
        break
      case 'focused':
        playlist = [
          { id: crypto.randomUUID(), name: 'Morning Focus Session', duration: defaultFocus, type: 'focus' },
          { id: crypto.randomUUID(), name: 'Extended Focus Block', duration: defaultFocus * 1.5, type: 'focus' },
          { id: crypto.randomUUID(), name: 'Final Sprint', duration: defaultFocus, type: 'focus' },
        ]
        break
      case 'breaks':
        playlist = [
          { id: crypto.randomUUID(), name: 'Quick Focus', duration: defaultFocus * 0.5, type: 'focus' },
          { id: crypto.randomUUID(), name: 'Movement Break', duration: defaultShort, type: 'short' },
          { id: crypto.randomUUID(), name: 'Light Focus', duration: defaultFocus * 0.5, type: 'focus' },
          { id: crypto.randomUUID(), name: 'Recharge Break', duration: defaultLong, type: 'long' },
        ]
        break
    }

    setPlaylist(playlist)
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ListMusic className="w-5 h-5" />
            Focus Playlist
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setPlaylistMode(!playlistMode)}
              variant={playlistMode ? "primary" : "outline"}
              size="sm"
            >
              {playlistMode ? 'Disable' : 'Enable'} Auto-Advance
            </Button>
          </div>
        </div>
        
        {currentPlaylist.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {currentPlaylist.length} tasks • {formatDuration(Math.floor(getTotalPlaylistTime() / 60))} total
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Playlist Templates */}
        {currentPlaylist.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Quick Start Templates:</p>
            <div className="grid grid-cols-1 gap-2">
              <Button 
                onClick={() => createQuickPlaylist('balanced')}
                variant="outline"
                className="justify-start h-auto p-3 transition-all hover:scale-[1.02] hover:shadow-md"
              >
                <div className="text-left">
                  <div className="font-medium">Balanced Flow</div>
                  <div className="text-xs text-muted-foreground">Focus → Break → Focus → Long Break → Focus</div>
                </div>
              </Button>
              <Button 
                onClick={() => createQuickPlaylist('focused')}
                variant="outline"
                className="justify-start h-auto p-3 transition-all hover:scale-[1.02] hover:shadow-md"
              >
                <div className="text-left">
                  <div className="font-medium">Deep Focus</div>
                  <div className="text-xs text-muted-foreground">Extended focus sessions with minimal breaks</div>
                </div>
              </Button>
              <Button 
                onClick={() => createQuickPlaylist('breaks')}
                variant="outline"
                className="justify-start h-auto p-3 transition-all hover:scale-[1.02] hover:shadow-md"
              >
                <div className="text-left">
                  <div className="font-medium">Gentle Rhythm</div>
                  <div className="text-xs text-muted-foreground">Shorter sessions with regular breaks</div>
                </div>
              </Button>
            </div>
          </div>
        )}

        {/* Playlist Items */}
        {currentPlaylist.length > 0 && (
          <div className="space-y-2">
            {currentPlaylist.map((task, index) => (
              <div 
                key={task.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-all",
                  index === currentPlaylistIndex && playlistMode 
                    ? "bg-primary/10 border-primary/30" 
                    : "bg-card border-border hover:border-primary/20"
                )}
              >
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  task.type === 'focus' ? "bg-blue-500" :
                  task.type === 'short' ? "bg-green-500" : "bg-purple-500"
                )} />
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{task.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDuration(Math.floor(task.duration / 60))} • {task.type} session
                  </div>
                </div>

                {index === currentPlaylistIndex && playlistMode && (
                  <Play className="w-4 h-4 text-primary" />
                )}

                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => moveTask(index, 'up')}
                    disabled={index === 0}
                    variant="ghost"
                    size="sm"
                    className="w-6 h-6 p-0"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={() => moveTask(index, 'down')}
                    disabled={index === currentPlaylist.length - 1}
                    variant="ghost"
                    size="sm"
                    className="w-6 h-6 p-0"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={() => removeTaskFromPlaylist(task.id)}
                    variant="ghost"
                    size="sm"
                    className="w-6 h-6 p-0 text-red-500 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Task Form */}
        {showAddTask ? (
          <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
            <input
              type="text"
              placeholder="Task name (e.g., 'Review emails', 'Study chapter 3')"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              className="w-full p-2 border rounded-md text-sm"
              autoFocus
            />
            
            <div className="flex gap-2">
              <select
                value={newTaskType}
                onChange={(e) => setNewTaskType(e.target.value as 'focus' | 'short' | 'long')}
                className="p-2 border rounded-md text-sm"
              >
                <option value="focus">Focus Session</option>
                <option value="short">Short Break</option>
                <option value="long">Long Break</option>
              </select>
              
              <input
                type="number"
                placeholder="Custom mins"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                className="w-24 p-2 border rounded-md text-sm"
                min="1"
                max="180"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddTask} size="sm" className="flex-1">
                Add Task
              </Button>
              <Button 
                onClick={() => setShowAddTask(false)} 
                variant="outline" 
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            onClick={() => setShowAddTask(true)}
            variant="outline"
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Task
          </Button>
        )}

        {currentPlaylist.length > 0 && (
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={() => setPlaylist([])}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Clear All
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}