'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BarChart } from '@/components/ui/BarChart'
import { useAppStore } from '@/lib/store'
import { formatDuration } from '@/lib/utils'
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Calendar,
  Share,
  Download,
  Flame
} from 'lucide-react'
import { cn } from '@/lib/utils'
import * as htmlToImage from 'html-to-image'

export default function StatsPage() {
  const { 
    currentStreak, 
    longestStreak, 
    sessionsCompleted, 
    totalMinutes, 
    level, 
    totalXp,
    dailyStats 
  } = useAppStore()
  
  const [isGeneratingShareCard, setIsGeneratingShareCard] = useState(false)
  
  // Calculate this week's data
  const thisWeekData = dailyStats.slice(-7).map(stat => ({
    label: new Date(stat.date).toLocaleDateString('en-US', { weekday: 'short' }),
    value: stat.minutes
  }))
  
  // Calculate additional stats
  const avgSessionLength = sessionsCompleted > 0 ? Math.round(totalMinutes / sessionsCompleted) : 0
  const thisWeekTotal = thisWeekData.reduce((sum, day) => sum + day.value, 0)
  const lastWeekTotal = dailyStats.slice(-14, -7).reduce((sum, stat) => sum + stat.minutes, 0)
  
  // Calculate weekly growth with proper edge case handling
  let weeklyGrowth = 0
  if (lastWeekTotal > 0) {
    weeklyGrowth = Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100)
  } else if (thisWeekTotal > 0) {
    // If there was no activity last week but there is this week, show it as positive growth
    weeklyGrowth = 100
  }
  
  // Debug logging for weekly growth calculation
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('Weekly Growth Debug:', {
      thisWeekTotal,
      lastWeekTotal,
      weeklyGrowth,
      thisWeekData: thisWeekData.map(d => ({ label: d.label, value: d.value })),
      lastWeekData: dailyStats.slice(-14, -7).map(stat => ({ 
        date: stat.date, 
        minutes: stat.minutes 
      }))
    })
  }
  
  const handleShareProgress = async () => {
    setIsGeneratingShareCard(true)
    try {
      const element = document.getElementById('share-card')
      if (element) {
        const dataUrl = await htmlToImage.toPng(element, {
          backgroundColor: '#ffffff',
          width: 800,
          height: 600,
          style: {
            transform: 'scale(1)',
            transformOrigin: 'top left',
          }
        })
        
        // Create download link
        const link = document.createElement('a')
        link.download = `focusrun-progress-${new Date().toISOString().split('T')[0]}.png`
        link.href = dataUrl
        link.click()
      }
    } catch (error) {
      console.error('Failed to generate share card:', error)
    } finally {
      setIsGeneratingShareCard(false)
    }
  }
  
  const exportData = () => {
    const data = {
      level,
      totalXp,
      currentStreak,
      longestStreak,
      sessionsCompleted,
      totalMinutes,
      dailyStats,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `focusrun-data-${new Date().toISOString().split('T')[0]}.json`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }
  
  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Flame className="w-8 h-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{currentStreak}</div>
                <div className="text-sm text-muted-foreground">Current Streak</div>
                <div className="text-xs text-muted-foreground">
                  Best: {longestStreak} days
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{sessionsCompleted}</div>
                <div className="text-sm text-muted-foreground">Sessions</div>
                <div className="text-xs text-muted-foreground">
                  Avg: {formatDuration(avgSessionLength)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{formatDuration(totalMinutes)}</div>
                <div className="text-sm text-muted-foreground">Total Time</div>
                <div className="text-xs text-muted-foreground">
                  Level {level}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">
                  {weeklyGrowth > 0 ? '+' : ''}{weeklyGrowth}%
                </div>
                <div className="text-sm text-muted-foreground">Weekly Growth</div>
                <div className="text-xs text-muted-foreground">
                  This week: {formatDuration(thisWeekTotal)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 14-Day Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Last 14 Days</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={dailyStats.map(stat => ({
                label: new Date(stat.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                }),
                value: stat.minutes
              }))}
              height={300}
              showValues={true}
              color="#3b82f6"
            />
          </CardContent>
        </Card>
        
        {/* This Week Focus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>This Week</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={thisWeekData}
              height={300}
              showValues={true}
              color="#10b981"
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={handleShareProgress}
          disabled={isGeneratingShareCard}
          className="flex items-center space-x-2"
        >
          <Share className="w-4 h-4" />
          <span>{isGeneratingShareCard ? 'Generating...' : 'Share Progress'}</span>
        </Button>
        
        <Button 
          onClick={exportData}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Export Data</span>
        </Button>
      </div>
      
      {/* Hidden Share Card for Screenshot */}
      <div 
        id="share-card" 
        className="fixed -top-[9999px] left-0 w-[800px] h-[600px] bg-gradient-to-br from-blue-50 to-purple-50 p-8"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        <ShareCard 
          level={level}
          totalXp={totalXp}
          currentStreak={currentStreak}
          sessionsCompleted={sessionsCompleted}
          totalMinutes={totalMinutes}
          thisWeekData={thisWeekData}
        />
      </div>
    </div>
  )
}

interface ShareCardProps {
  level: number
  totalXp: number
  currentStreak: number
  sessionsCompleted: number
  totalMinutes: number
  thisWeekData: Array<{ label: string; value: number }>
}

const ShareCard: React.FC<ShareCardProps> = ({
  level,
  totalXp,
  currentStreak,
  sessionsCompleted,
  totalMinutes,
  thisWeekData
}) => {
  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-2xl p-8 flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          FocusRun Progress
        </div>
        <div className="text-gray-600">My focus journey this week</div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{level}</div>
          <div className="text-gray-600">Level</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">{totalXp}</div>
          <div className="text-gray-600">Total XP</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600">{currentStreak}</div>
          <div className="text-gray-600">Day Streak</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{formatDuration(totalMinutes)}</div>
          <div className="text-gray-600">Total Time</div>
        </div>
      </div>
      
      {/* Mini Chart */}
      <div className="flex-1 flex flex-col">
        <div className="text-lg font-semibold text-gray-800 mb-4 text-center">
          This Week's Progress
        </div>
        <div className="flex items-end justify-between h-32 bg-gray-50 rounded-lg p-4">
          {thisWeekData.map((day, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="w-8 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm mb-2"
                style={{ 
                  height: Math.max(4, (day.value / Math.max(...thisWeekData.map(d => d.value), 1)) * 80)
                }}
              />
              <div className="text-xs text-gray-600">{day.label}</div>
              <div className="text-xs font-semibold">{day.value}m</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <div className="text-center mt-6 text-gray-500 text-sm">
        Generated with FocusRun • {new Date().toLocaleDateString()}
      </div>
    </div>
  )
}