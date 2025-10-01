'use client'

import React, { useState, useRef } from 'react'
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
  GripVertical,
  Mail,
  Brain,
  PenTool,
  Coffee,
  Focus,
  Eye,
  Calendar,
  Settings,
  ChevronUp,
  ChevronDown
} from 'lucide-react'

interface TaskCard {
  id: string
  name: string
  icon: React.ReactNode
  defaultDuration: number // in minutes
  color: string
}

const PREDEFINED_TASKS: TaskCard[] = [
  {
    id: 'email',
    name: 'Email',
    icon: <Mail className="w-4 h-4" />,
    defaultDuration: 15,
    color: 'bg-blue-500'
  },
  {
    id: 'deep-work',
    name: 'Deep Work',
    icon: <Brain className="w-4 h-4" />,
    defaultDuration: 45,
    color: 'bg-purple-600'
  },
  {
    id: 'writing',
    name: 'Writing',
    icon: <PenTool className="w-4 h-4" />,
    defaultDuration: 30,
    color: 'bg-green-600'
  },
  {
    id: 'break',
    name: 'Break',
    icon: <Coffee className="w-4 h-4" />,
    defaultDuration: 10,
    color: 'bg-orange-500'
  },
  {
    id: 'focus-time',
    name: 'Focus Time',
    icon: <Focus className="w-4 h-4" />,
    defaultDuration: 25,
    color: 'bg-red-500'
  },
  {
    id: 'review',
    name: 'Review',
    icon: <Eye className="w-4 h-4" />,
    defaultDuration: 20,
    color: 'bg-yellow-600'
  },
  {
    id: 'plan',
    name: 'Plan',
    icon: <Calendar className="w-4 h-4" />,
    defaultDuration: 15,
    color: 'bg-indigo-500'
  }
]

interface TaskItemProps {
  task: PlaylistTask & { color?: string; icon?: React.ReactNode }
  index: number
  onRemove: (id: string) => void
  onUpdateDuration: (id: string, duration: number) => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  isActive: boolean
  isFirst: boolean
  isLast: boolean
}

function TaskItem({ 
  task, 
  index,
  onRemove, 
  onUpdateDuration, 
  onMoveUp,
  onMoveDown,
  isActive, 
  isFirst,
  isLast 
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editDuration, setEditDuration] = useState(Math.floor(task.duration / 60).toString())

  const handleDurationSave = () => {
    const newDuration = parseInt(editDuration) || 1
    onUpdateDuration(task.id, Math.max(1, Math.min(180, newDuration)) * 60) // Convert to seconds, clamp 1-180 min
    setIsEditing(false)
  }

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border-2 shadow-sm transition-all duration-200 overflow-hidden group",
        isActive ? "border-primary ring-2 ring-primary/20 shadow-lg" : "border-gray-200 dark:border-gray-700 hover:shadow-md"
      )}
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <Button
              onClick={() => onMoveUp(index)}
              disabled={isFirst}
              variant="ghost"
              size="sm"
              className="w-6 h-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronUp className="w-3 h-3" />
            </Button>
            <Button
              onClick={() => onMoveDown(index)}
              disabled={isLast}
              variant="ghost"
              size="sm"
              className="w-6 h-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
          </div>
          
          <div className={cn(
            "w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-white",
            task.color || "bg-gray-400"
          )}>
            {task.icon && React.cloneElement(task.icon as React.ReactElement, { 
              className: "w-2.5 h-2.5" 
            })}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{task.name}</div>
            <div className="text-xs text-muted-foreground">
              Task {index + 1}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isActive && (
              <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                <Play className="w-3 h-3" />
                Playing
              </div>
            )}
            
            {isEditing ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                  className="w-16 px-2 py-1 text-xs border rounded text-center"
                  min="1"
                  max="180"
                  autoFocus
                  onBlur={handleDurationSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleDurationSave()}
                />
                <span className="text-xs text-muted-foreground">min</span>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Clock className="w-3 h-3" />
                {Math.floor(task.duration / 60)}m
              </button>
            )}
            
            <Button
              onClick={() => onRemove(task.id)}
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface DraggablePlaylistManagerProps {
  className?: string
  onStartPlaylist?: () => void
}

export const DraggablePlaylistManager: React.FC<DraggablePlaylistManagerProps> = ({ className, onStartPlaylist }) => {
  const { 
    currentPlaylist, 
    playlistMode, 
    currentPlaylistIndex,
    setPlaylist,
    setPlaylistMode,
    resetPlaylistIndex
  } = useAppStore()
  
  const [showCustomTask, setShowCustomTask] = useState(false)
  const [customTaskName, setCustomTaskName] = useState('')
  const [customTaskDuration, setCustomTaskDuration] = useState('25')

  // Enhanced playlist items with visual data
  const enhancedPlaylist = currentPlaylist.map(task => {
    const predefinedTask = PREDEFINED_TASKS.find(p => 
      p.name.toLowerCase() === task.name.toLowerCase() || 
      p.id === task.type
    )
    
    return {
      ...task,
      icon: predefinedTask?.icon || <Settings className="w-4 h-4" />,
      color: predefinedTask?.color || "bg-gray-400"
    }
  })

  const addTaskToPlaylist = (taskCard: TaskCard) => {
    const newTask: PlaylistTask = {
      id: crypto.randomUUID(),
      name: taskCard.name,
      duration: taskCard.defaultDuration * 60,
      type: taskCard.name.toLowerCase().includes('break') ? 'short' : 'focus',
      completed: false
    }

    setPlaylist([...currentPlaylist, newTask])
  }

  const addCustomTask = () => {
    if (!customTaskName.trim()) return
    
    const duration = parseInt(customTaskDuration) || 25
    const customTask: PlaylistTask = {
      id: crypto.randomUUID(),
      name: customTaskName.trim().substring(0, 14), // Limit to 14 characters
      duration: duration * 60,
      type: 'focus',
      completed: false
    }

    setPlaylist([...currentPlaylist, customTask])
    setCustomTaskName('')
    setCustomTaskDuration('25')
    setShowCustomTask(false)
  }

  const removeTaskFromPlaylist = (taskId: string) => {
    setPlaylist(currentPlaylist.filter(task => task.id !== taskId))
  }

  const updateTaskDuration = (taskId: string, newDuration: number) => {
    setPlaylist(currentPlaylist.map(task => 
      task.id === taskId ? { ...task, duration: newDuration } : task
    ))
  }

  const moveTaskUp = (index: number) => {
    if (index === 0) return
    const newPlaylist = [...currentPlaylist]
    const temp = newPlaylist[index]
    newPlaylist[index] = newPlaylist[index - 1]
    newPlaylist[index - 1] = temp
    setPlaylist(newPlaylist)
  }

  const moveTaskDown = (index: number) => {
    if (index === currentPlaylist.length - 1) return
    const newPlaylist = [...currentPlaylist]
    const temp = newPlaylist[index]
    newPlaylist[index] = newPlaylist[index + 1]
    newPlaylist[index + 1] = temp
    setPlaylist(newPlaylist)
  }

  const getTotalTime = () => {
    return currentPlaylist.reduce((total, task) => total + task.duration, 0)
  }

  const handleStartPlaylist = () => {
    if (currentPlaylist.length === 0) return
    
    // Enable playlist mode and reset to first task
    setPlaylistMode(true)
    resetPlaylistIndex()
    
    // Reset all tasks to not completed
    const resetPlaylist = currentPlaylist.map(task => ({
      ...task,
      completed: false
    }))
    setPlaylist(resetPlaylist)
    
    // Start the first task
    if (onStartPlaylist) {
      onStartPlaylist()
    }
  }

  return (
    <Card className={cn("w-full max-w-4xl", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            🎯 Task Playlist Builder
          </CardTitle>
          <div className="flex items-center gap-3">
            {currentPlaylist.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {currentPlaylist.length} tasks • {formatDuration(Math.floor(getTotalTime() / 60))}
              </div>
            )}
            <div className="flex items-center gap-2">
              {currentPlaylist.length > 0 && !playlistMode && (
                <Button
                  onClick={handleStartPlaylist}
                  variant="primary"
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Playlist
                </Button>
              )}
              <Button
                onClick={() => setPlaylistMode(!playlistMode)}
                variant={playlistMode ? "primary" : "outline"}
                size="sm"
              >
                {playlistMode ? 'Auto-Advance ON' : 'Enable Auto-Advance'}
              </Button>
            </div>
          </div>
        </div>
        
        {playlistMode && currentPlaylist.length > 0 && (
          <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
            🚀 Auto-advance is enabled! Tasks will run automatically one after another.
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Available Task Cards */}
        <div>
          <h3 className="font-medium mb-3">Available Tasks</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PREDEFINED_TASKS.map((taskCard) => (
              <button
                key={taskCard.id}
                onClick={() => addTaskToPlaylist(taskCard)}
                className="p-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 hover:scale-[1.02] group text-left"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("w-4 h-4 rounded-full flex items-center justify-center text-white", taskCard.color)}>
                    {React.cloneElement(taskCard.icon as React.ReactElement, { 
                      className: "w-2.5 h-2.5" 
                    })}
                  </div>
                </div>
                <div className="text-sm font-medium group-hover:text-primary transition-colors">
                  {taskCard.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {taskCard.defaultDuration}m default
                </div>
              </button>
            ))}
            
            {/* Custom Task Button */}
            {!showCustomTask ? (
              <button
                onClick={() => setShowCustomTask(true)}
                className="p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 hover:scale-[1.02] text-left"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center text-white">
                    <Plus className="w-2.5 h-2.5" />
                  </div>
                </div>
                <div className="text-sm font-medium">Custom Task</div>
                <div className="text-xs text-muted-foreground">Up to 14 chars</div>
              </button>
            ) : (
              <div className="p-3 border-2 border-primary rounded-lg bg-primary/5">
                <input
                  type="text"
                  placeholder="Task name..."
                  value={customTaskName}
                  onChange={(e) => setCustomTaskName(e.target.value)}
                  className="w-full p-1 mb-2 text-sm border rounded"
                  maxLength={14}
                  autoFocus
                />
                <div className="flex items-center gap-1 mb-2">
                  <input
                    type="number"
                    value={customTaskDuration}
                    onChange={(e) => setCustomTaskDuration(e.target.value)}
                    className="w-12 p-1 text-xs border rounded"
                    min="1"
                    max="180"
                  />
                  <span className="text-xs">min</span>
                </div>
                <div className="flex gap-1">
                  <Button onClick={addCustomTask} size="sm" className="flex-1 h-6 text-xs">
                    Add
                  </Button>
                  <Button 
                    onClick={() => setShowCustomTask(false)} 
                    variant="outline" 
                    size="sm"
                    className="h-6 text-xs"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Current Playlist */}
        {currentPlaylist.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Your Playlist</h3>
              <div className="flex items-center gap-2">
                {playlistMode && (
                  <div className="text-xs text-primary flex items-center gap-1">
                    <Play className="w-3 h-3" />
                    {currentPlaylistIndex < currentPlaylist.length 
                      ? `Playing: ${currentPlaylistIndex + 1}/${currentPlaylist.length}`
                      : 'Ready to start'
                    }
                  </div>
                )}
                <Button
                  onClick={() => setPlaylist([])}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                >
                  Clear All
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              {enhancedPlaylist.map((task, index) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  index={index}
                  onRemove={removeTaskFromPlaylist}
                  onUpdateDuration={updateTaskDuration}
                  onMoveUp={moveTaskUp}
                  onMoveDown={moveTaskDown}
                  isActive={playlistMode && index === currentPlaylistIndex}
                  isFirst={index === 0}
                  isLast={index === enhancedPlaylist.length - 1}
                />
              ))}
            </div>
          </div>
        )}

        {currentPlaylist.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">📋</div>
            <p>Click on task cards above to build your playlist</p>
            <p className="text-sm">Use the arrows to reorder tasks</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}