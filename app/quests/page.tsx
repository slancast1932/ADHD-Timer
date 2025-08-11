'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LevelBadge } from '@/components/ui/LevelBadge'
import { XPProgressBar } from '@/components/ui/XPProgressBar'
import { QuestProgress } from '@/components/ui/QuestProgress'
import { XPFlyUpManager, useXPAnimation } from '@/components/ui/XPFlyUp'
import { LevelUpManager, useLevelUpAnimation } from '@/components/ui/LevelUpAnimation'
import { useAppStore } from '@/lib/store'
import { Trophy, Star, CheckCircle, XCircle, Target, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function QuestsPage() {
  const { 
    quests, 
    claimQuest, 
    pendingXp, 
    totalXp, 
    level, 
    claimPendingXp,
    weeklyXPGoal,
    weeklyXPEarned 
  } = useAppStore()
  const progressBarRef = useRef<HTMLDivElement>(null)
  const { animations, triggerXPAnimation, handleAnimationComplete } = useXPAnimation()
  const { animations: levelUpAnimations, triggerLevelUpAnimation, handleAnimationComplete: handleLevelUpComplete } = useLevelUpAnimation()
  const [previousLevel, setPreviousLevel] = useState(level)
  
  // Watch for level changes and trigger animation
  useEffect(() => {
    if (level > previousLevel && previousLevel > 0) {
      triggerLevelUpAnimation(level)
    }
    setPreviousLevel(level)
  }, [level, previousLevel, triggerLevelUpAnimation])
  
  const dailyQuests = quests.filter(q => q.type === 'daily')
  const weeklyQuests = quests.filter(q => q.type === 'weekly')
  
  const handleClaimQuest = (questId: string, questElement?: HTMLElement) => {
    const quest = quests.find(q => q.id === questId)
    if (quest && questElement) {
      // Trigger XP fly-up animation
      triggerXPAnimation(quest.xp, questElement)
    }
    claimQuest(questId)
  }
  
  const handleClaimAllXp = () => {
    claimPendingXp()
  }
  
  return (
    <div className="space-y-8">
      {/* Weekly XP Goal Meter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-purple-500" />
            <span>Weekly XP Goal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QuestProgress 
            current={weeklyXPEarned} 
            target={weeklyXPGoal} 
            size="md"
            color="purple"
            className="mb-4"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{weeklyXPEarned} XP earned this week</span>
            <span>{Math.max(0, weeklyXPGoal - weeklyXPEarned)} XP remaining</span>
          </div>
        </CardContent>
      </Card>

      {/* Level Progress and Badge */}
      <Card ref={progressBarRef}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span>Level Progress</span>
            </div>
            <LevelBadge level={level} size="lg" showAnimation={false} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <XPProgressBar 
            currentXP={totalXp}
            level={level}
            pendingXP={pendingXp}
            showAnimation={true}
            size="lg"
          />
          
          {pendingXp > 0 && (
            <div className="text-center">
              <Button 
                onClick={handleClaimAllXp}
                size="lg"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold px-8"
              >
                Claim {pendingXp} Pending XP
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* XP Fly-up Animations */}
      <XPFlyUpManager 
        animations={animations}
        onAnimationComplete={handleAnimationComplete}
      />
      
      {/* Level-up Animations */}
      <LevelUpManager 
        animations={levelUpAnimations}
        onAnimationComplete={handleLevelUpComplete}
      />
      
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
            <QuestCard key={quest.id} quest={quest} onClaim={handleClaimQuest} showProgress={true} />
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
    progress?: number
    target?: number
  }
  onClaim: (questId: string, element?: HTMLElement) => void
  showProgress?: boolean
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, onClaim, showProgress = false }) => {
  const cardRef = useRef<HTMLDivElement>(null)
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
                Completed on {new Date(quest.completedAt).toLocaleDateString()}
              </div>
            )}
          </div>
          
          {quest.status === 'completed' && (
            <Button 
              ref={cardRef}
              onClick={() => onClaim(quest.id, cardRef.current || undefined)}
              size="sm"
              className="bg-green-600 hover:bg-green-700 transition-transform hover:scale-105"
            >
              Claim {quest.xp} XP
            </Button>
          )}
        </div>
        
        {/* Quest Progress Bar */}
        {showProgress && quest.progress !== undefined && quest.target !== undefined && (
          <div className="mt-4 pt-3 border-t border-muted">
            <QuestProgress 
              current={quest.progress}
              target={quest.target}
              size="sm"
              color={quest.type === 'weekly' ? 'purple' : 'blue'}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
