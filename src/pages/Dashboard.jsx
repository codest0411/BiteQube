import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Camera, 
  Mic, 
  BookOpen, 
  ShoppingCart, 
  Flame, 
  Star,
  TrendingUp,
  Award
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { dbHelpers } from '@/lib/supabase'
import { voiceAPI } from '@/lib/api'
import Navbar from '@/components/Navbar'
import { toast } from 'sonner'

const Dashboard = () => {
  const { user } = useAuth()
  const [userStats, setUserStats] = useState({ xp: 0, streak_days: 0 })
  const [isListening, setIsListening] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadUserStats()
    }
  }, [user])

  const loadUserStats = async () => {
    try {
      const { data, error } = await dbHelpers.getUserStats(user.id)
      if (!error && data) {
        setUserStats(data)
      }
    } catch (error) {
      console.error('Error loading user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const startVoiceSearch = () => {
    setIsListening(true)
    
    voiceAPI.startListening(
      (transcript) => {
        setIsListening(false)
        toast.success(`Voice command: "${transcript}"`)
        // Here you would typically process the voice command
        // For now, we'll just show a success message
      },
      (error) => {
        setIsListening(false)
        toast.error(`Voice recognition error: ${error}`)
      }
    )
  }

  const dashboardCards = [
    {
      title: 'Scan a Dish',
      description: 'Take a photo and discover recipes instantly',
      icon: Camera,
      link: '/scan',
      gradient: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950'
    },
    {
      title: 'Voice Search',
      description: 'Speak your recipe requests naturally',
      icon: Mic,
      link: '/search',
      gradient: 'from-blue-500 to-purple-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      title: 'My Cookbook',
      description: 'Browse your saved recipes',
      icon: BookOpen,
      link: '/cookbook',
      gradient: 'from-green-500 to-teal-500',
      bgColor: 'bg-green-50 dark:bg-green-950'
    },
    {
      title: 'Shopping List',
      description: 'Manage your ingredient lists',
      icon: ShoppingCart,
      link: '/shopping-list',
      gradient: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950'
    }
  ]

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getStreakEmoji = (days) => {
    if (days >= 30) return '🏆'
    if (days >= 14) return '🔥'
    if (days >= 7) return '⚡'
    if (days >= 3) return '🌟'
    return '💫'
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {getGreeting()}, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Chef'}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Ready to discover something delicious today?
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {/* XP Card */}
          <Card className="gradient-orange text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">
                Total XP
              </CardTitle>
              <Star className="h-4 w-4 text-white/90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.xp || 0}</div>
              <p className="text-xs text-white/70">
                +10 XP per scan
              </p>
            </CardContent>
          </Card>

          {/* Streak Card */}
          <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">
                Streak Days
              </CardTitle>
              <Flame className="h-4 w-4 text-white/90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                {userStats.streak_days || 0}
                <span className="ml-2 text-lg">
                  {getStreakEmoji(userStats.streak_days || 0)}
                </span>
              </div>
              <p className="text-xs text-white/70">
                Keep scanning daily!
              </p>
            </CardContent>
          </Card>

          {/* Level Card */}
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">
                Chef Level
              </CardTitle>
              <Award className="h-4 w-4 text-white/90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.floor((userStats.xp || 0) / 100) + 1}
              </div>
              <p className="text-xs text-white/70">
                {100 - ((userStats.xp || 0) % 100)} XP to next level
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          {dashboardCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className={`h-full hover:shadow-lg transition-all duration-300 ${card.bgColor} border-0`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.gradient} flex items-center justify-center`}>
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                    {card.title === 'Voice Search' && isListening && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-red-500 font-medium">Listening...</span>
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-xl">{card.title}</CardTitle>
                  <CardDescription className="text-base">
                    {card.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {card.link ? (
                    <Link to={card.link}>
                      <Button variant="gradient" className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      variant="gradient" 
                      className="w-full"
                      onClick={card.action}
                      disabled={isListening}
                    >
                      {isListening ? 'Listening...' : 'Start Voice Search'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Explore more features to enhance your cooking experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <Award className="w-4 h-4 mr-2" />
                    View Profile & Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950 border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-700 dark:text-orange-300">
                💡 Chef's Tip of the Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-600 dark:text-orange-400">
                Try scanning different angles of the same dish to get more accurate recipe suggestions. 
                Our AI works better with clear, well-lit photos!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
