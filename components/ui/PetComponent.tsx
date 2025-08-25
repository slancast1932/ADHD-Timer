'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { useAppStore, Pet } from '@/lib/store'
import { Heart, Zap, UtensilsCrossed, Gamepad2, Plus, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const getPetEmoji = (pet: Pet): string => {
  const { type, stage, hunger, happiness, health } = pet
  
  // Check if pet is in poor condition
  const poorCondition = hunger < 30 || happiness < 30 || health < 30
  
  switch (type) {
    case 'dragon':
      if (poorCondition) return '😴'
      switch (stage) {
        case 'baby': return '🐲'
        case 'adult': return '🐉'
        case 'evolved': return '✨🐉✨'
        default: return '🐲'
      }
    case 'plant':
      if (poorCondition) return '🥀'
      switch (stage) {
        case 'baby': return '🌿'
        case 'adult': return '🌳'
        case 'evolved': return '✨🌳✨'
        default: return '🌿'
      }
    case 'cat':
      if (poorCondition) return '😿'
      switch (stage) {
        case 'baby': return '🐱'
        case 'adult': return '🐈'
        case 'evolved': return '✨🐈✨'
        default: return '🐱'
      }
    default:
      return '🐲'
  }
}

const getStageDisplayName = (stage: Pet['stage']): string => {
  switch (stage) {
    case 'baby': return 'Baby'
    case 'adult': return 'Adult'
    case 'evolved': return 'Evolved'
    default: return 'Unknown'
  }
}

const getCareCost = (action: 'feed' | 'play' | 'heal'): number => {
  switch (action) {
    case 'feed': return 10
    case 'play': return 15
    case 'heal': return 20
    default: return 10
  }
}

interface PetComponentProps {
  className?: string
}

export const PetComponent: React.FC<PetComponentProps> = ({ className }) => {
  const { 
    pet, 
    totalXp, 
    feedPet, 
    playWithPet, 
    healPet, 
    updatePetStatus 
  } = useAppStore()
  
  const [feedAnimation, setFeedAnimation] = useState(false)
  const [healAnimation, setHealAnimation] = useState(false)
  const [playAnimation, setPlayAnimation] = useState(false)
  const [growthAnimation, setGrowthAnimation] = useState(false)
  
  // Update pet status on mount and periodically
  useEffect(() => {
    updatePetStatus()
    const interval = setInterval(updatePetStatus, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [updatePetStatus])
  
  if (!pet) {
    return null
  }
  
  const handleFeed = () => {
    const cost = getCareCost('feed')
    if (totalXp >= cost) {
      setFeedAnimation(true)
      setGrowthAnimation(true)
      
      // Play "nom nom" sound effect
      const audio = new Audio('/sounds/nom.wav')
      audio.play().catch(() => {}) // Ignore errors if sound fails
      
      feedPet(cost)
      
      // Reset animations
      setTimeout(() => setFeedAnimation(false), 2000)
      setTimeout(() => setGrowthAnimation(false), 1000)
    }
  }
  
  const handlePlay = () => {
    const cost = getCareCost('play')
    if (totalXp >= cost) {
      setPlayAnimation(true)
      playWithPet(cost)
      
      // Reset animation
      setTimeout(() => setPlayAnimation(false), 1500)
    }
  }
  
  const handleHeal = () => {
    const cost = getCareCost('heal')
    if (totalXp >= cost) {
      setHealAnimation(true)
      healPet(cost)
      
      // Reset animation
      setTimeout(() => setHealAnimation(false), 2000)
    }
  }
  
  const getStatusColor = (value: number): string => {
    if (value >= 70) return 'bg-green-500'
    if (value >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }
  
  const canAfford = (action: 'feed' | 'play' | 'heal'): boolean => {
    return totalXp >= getCareCost(action)
  }
  
  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span>{pet.name}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {getStageDisplayName(pet.stage)}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pet Avatar */}
        <div className="flex justify-center relative">
          <div className={cn(
            "text-8xl transition-all duration-500",
            playAnimation && "animate-bounce",
            growthAnimation && "scale-110 animate-pulse",
            !playAnimation && !growthAnimation && "animate-bounce"
          )}>
            {getPetEmoji(pet)}
          </div>
          
          {/* Feed Animation - Sparkles */}
          {feedAnimation && (
            <>
              <div className="absolute top-2 left-2 animate-ping">
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="absolute top-4 right-2 animate-ping" style={{ animationDelay: '0.2s' }}>
                <Sparkles className="w-4 h-4 text-orange-400" />
              </div>
              <div className="absolute bottom-6 left-6 animate-ping" style={{ animationDelay: '0.4s' }}>
                <Sparkles className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-2xl animate-bounce">
                ✨🍎✨
              </div>
              <div className="absolute bottom-2 right-4 text-lg animate-pulse font-bold text-green-600">
                nom nom!
              </div>
            </>
          )}
          
          {/* Heal Animation - Glowing Aura */}
          {healAnimation && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/30 to-green-400/30 animate-pulse blur-xl"></div>
          )}
          
          {/* Play Animation - Happy indicators */}
          {playAnimation && (
            <>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-3xl animate-bounce">
                💫
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-lg animate-pulse font-bold text-pink-500">
                wheee!
              </div>
            </>
          )}
        </div>
        
        {/* Pet Stats */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <UtensilsCrossed className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium w-16">Hunger</span>
            <Progress 
              value={pet.hunger} 
              className="flex-1"
              indicatorClassName={getStatusColor(pet.hunger)}
            />
            <span className="text-xs text-muted-foreground w-8">{pet.hunger}%</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Gamepad2 className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium w-16">Happy</span>
            <Progress 
              value={pet.happiness} 
              className="flex-1"
              indicatorClassName={getStatusColor(pet.happiness)}
            />
            <span className="text-xs text-muted-foreground w-8">{pet.happiness}%</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium w-16">Health</span>
            <Progress 
              value={pet.health} 
              className={cn("flex-1 transition-transform", healAnimation && "animate-bounce")}
              indicatorClassName={getStatusColor(pet.health)}
            />
            <span className="text-xs text-muted-foreground w-8">{pet.health}%</span>
          </div>
        </div>
        
        {/* Care Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={handleFeed}
            disabled={!canAfford('feed')}
            size="sm"
            variant={canAfford('feed') ? 'primary' : 'secondary'}
            className="flex flex-col items-center space-y-1 h-auto py-3"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span className="text-xs">Feed</span>
            <span className="text-xs opacity-75">{getCareCost('feed')} XP</span>
          </Button>
          
          <Button
            onClick={handlePlay}
            disabled={!canAfford('play')}
            size="sm"
            variant={canAfford('play') ? 'primary' : 'secondary'}
            className="flex flex-col items-center space-y-1 h-auto py-3"
          >
            <Gamepad2 className="w-4 h-4" />
            <span className="text-xs">Play</span>
            <span className="text-xs opacity-75">{getCareCost('play')} XP</span>
          </Button>
          
          <Button
            onClick={handleHeal}
            disabled={!canAfford('heal')}
            size="sm"
            variant={canAfford('heal') ? 'primary' : 'secondary'}
            className="flex flex-col items-center space-y-1 h-auto py-3"
          >
            <Heart className="w-4 h-4" />
            <span className="text-xs">Heal</span>
            <span className="text-xs opacity-75">{getCareCost('heal')} XP</span>
          </Button>
        </div>
        
        {/* Evolution Progress */}
        <div className="pt-3 border-t border-muted">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Evolution Progress</span>
            <span className="text-xs text-muted-foreground">
              {pet.totalCareGiven} / {getNextEvolutionThreshold(pet.stage)} care
            </span>
          </div>
          <Progress 
            value={(pet.totalCareGiven / getNextEvolutionThreshold(pet.stage)) * 100}
            className="h-2"
            indicatorClassName="bg-gradient-to-r from-purple-500 to-pink-500"
          />
        </div>
        
        <div className="text-center text-xs text-muted-foreground">
          Your XP: {totalXp}
        </div>
      </CardContent>
    </Card>
  )
}

const getNextEvolutionThreshold = (stage: Pet['stage']): number => {
  switch (stage) {
    case 'baby': return 100
    case 'adult': return 250
    case 'evolved': return 250 // Already max
    default: return 100
  }
}

// Pet Creation Modal Component
interface PetCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onCreatePet: (type: Pet['type'], name: string) => void
}

export const PetCreationModal: React.FC<PetCreationModalProps> = ({
  isOpen,
  onClose,
  onCreatePet
}) => {
  const [selectedType, setSelectedType] = useState<Pet['type']>('dragon')
  const [petName, setPetName] = useState('')
  
  if (!isOpen) return null
  
  const handleCreate = () => {
    if (petName.trim()) {
      onCreatePet(selectedType, petName.trim())
      onClose()
    }
  }
  
  const petTypes: Array<{ type: Pet['type'], emoji: string, name: string }> = [
    { type: 'dragon', emoji: '🐲', name: 'Dragon' },
    { type: 'plant', emoji: '🌱', name: 'Plant' },
    { type: 'cat', emoji: '🐱', name: 'Cat' }
  ]
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Adopt Your Pet!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-3 block">Choose a pet type:</label>
            <div className="grid grid-cols-3 gap-3">
              {petTypes.map((pet) => (
                <Button
                  key={pet.type}
                  variant={selectedType === pet.type ? 'primary' : 'outline'}
                  onClick={() => setSelectedType(pet.type)}
                  className="flex flex-col items-center space-y-2 h-auto py-4"
                >
                  <span className="text-2xl">{pet.emoji}</span>
                  <span className="text-xs">{pet.name}</span>
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Give your pet a name:</label>
            <input
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="Enter pet name..."
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
              disabled={!petName.trim()}
              className="flex-1"
            >
              Adopt Pet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}