'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/lib/store'
import { Trophy, Star, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function QuestsPage() {
  const { quests, claimQuest, pendingXp, totalXp, level, claimPendingXp } = useAppStore()
  
  const dailyQuests = quests.filter(q => q.type === 'daily')
  const weeklyQuests = quests.filter(q => q.type === 'weekly')
  
  const handleClaimQuest = (questId: string) => {
    claimQuest(questId)
  }
  
  const handleClaimAllXp = () => {
    claimPendingXp()
  }
  
  return (
    <div className="space-y-8">
      {/* XP Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span>Experience Points</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{pendingXp}</div>
              <div className="text-sm text-muted-foreground">Pending XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalXp}</div>
              <div className="text-sm text-muted-foreground">Total XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{level}</div>
              <div className="text-sm text-muted-foreground">Current Level</div>
            </div>
            <div className="text-center">
              <Button 
                onClick={handleClaimAllXp}
                disabled={pendingXp === 0}
                className="w-full"
              >
                Claim All XP
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Daily Quests */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
          <Star className="w-6 h-6 text-blue-500" />
          <span>Daily Quests</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dailyQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} onClaim={handleClaimQuest} />
          ))}
        </div>
      </div>
      
      {/* Weekly Quests */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
          <Trophy className="w-6 h-6 text-purple-500" />
          <span>Weekly Quests</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weeklyQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} onClaim={handleClaimQuest} />
          ))}
        </div>
      </div>
    </div>
  )
}

interface QuestCardProps {
  quest: {
    id: string
    title: string
    description: string
    xp: number
    type: 'daily' | 'weekly'
    status: 'active' | 'completed' | 'claimed'
    completedAt?: Date
  }
  onClaim: (questId: string) => void
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, onClaim }) => {
  const getStatusIcon = () => {
    switch (quest.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'claimed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />
      default:
        return <XCircle className="w-5 h-5 text-muted-foreground" />
    }
  }
  
  const getStatusText = () => {
    switch (quest.status) {
      case 'completed':
        return 'Ready to Claim!'
      case 'claimed':
        return 'Completed'
      default:
        return 'In Progress'
    }
  }
  
  const getStatusColor = () => {
    switch (quest.status) {
      case 'completed':
        return 'text-green-600'
      case 'claimed':
        return 'text-blue-600'
      default:
        return 'text-muted-foreground'
    }
  }
  
  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      quest.status === 'completed' && "ring-2 ring-green-200 bg-green-50/50"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{quest.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{quest.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-lg font-bold text-primary">{quest.xp} XP</div>
              <div className="text-xs text-muted-foreground">{quest.type}</div>
            </div>
            {getStatusIcon()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className={cn("font-medium", getStatusColor())}>
              {getStatusText()}
            </span>
            {quest.completedAt && quest.status === 'claimed' && (
              <div className="text-xs text-muted-foreground mt-1">
                Completed on {quest.completedAt.toLocaleDateString()}
              </div>
            )}
          </div>
          
          {quest.status === 'completed' && (
            <Button 
              onClick={() => onClaim(quest.id)}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              Claim {quest.xp} XP
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
