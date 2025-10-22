import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  Star, 
  Flame, 
  Moon, 
  Sun,
  Edit,
  Save,
  X,
  Trash2,
  LogOut
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { dbHelpers, supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import Navbar from '@/components/Navbar'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

const Profile = () => {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [userStats, setUserStats] = useState({ xp: 0, streak_days: 0 })
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    email: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadUserData()
      setEditForm({
        name: user.user_metadata?.name || '',
        email: user.email || ''
      })
    }
  }, [user])

  const loadUserData = async () => {
    try {
      const { data, error } = await dbHelpers.getUserStats(user.id)
      if (!error && data) {
        setUserStats(data)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: editForm.name }
      })

      if (error) throw error

      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      toast.error('Error signing out')
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    try {
      // Note: In a real app, you'd want to implement proper account deletion
      // This would typically involve calling a server-side function
      toast.info('Account deletion requested. Please contact support to complete this process.')
    } catch (error) {
      toast.error('Failed to delete account')
    }
  }

  const getChefLevel = (xp) => {
    return Math.floor(xp / 100) + 1
  }

  const getNextLevelXP = (xp) => {
    const currentLevel = getChefLevel(xp)
    return currentLevel * 100
  }

  const getLevelProgress = (xp) => {
    const currentLevelXP = (getChefLevel(xp) - 1) * 100
    const nextLevelXP = getNextLevelXP(xp)
    return ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
  }

  const getStreakEmoji = (days) => {
    if (days >= 30) return '🏆'
    if (days >= 14) return '🔥'
    if (days >= 7) return '⚡'
    if (days >= 3) return '🌟'
    return '💫'
  }

  const getBadges = (xp, streakDays) => {
    const badges = []
    
    if (xp >= 100) badges.push({ name: 'First Century', icon: '💯', description: 'Earned 100 XP' })
    if (xp >= 500) badges.push({ name: 'Recipe Master', icon: '👨‍🍳', description: 'Earned 500 XP' })
    if (xp >= 1000) badges.push({ name: 'Culinary Expert', icon: '🏆', description: 'Earned 1000 XP' })
    if (streakDays >= 7) badges.push({ name: 'Week Warrior', icon: '⚡', description: '7-day streak' })
    if (streakDays >= 30) badges.push({ name: 'Monthly Master', icon: '🔥', description: '30-day streak' })
    
    return badges
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-white">
              {user?.user_metadata?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {user?.user_metadata?.name || 'Chef Profile'}
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your account and cooking preferences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2 text-orange-500" />
                      Profile Information
                    </CardTitle>
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(false)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="gradient"
                          size="sm"
                          onClick={handleSaveProfile}
                          disabled={loading}
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Name</label>
                    {isEditing ? (
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Enter your name"
                      />
                    ) : (
                      <p className="text-foreground">{user?.user_metadata?.name || 'Not set'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <p className="text-foreground flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                      {user?.email}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Member Since</label>
                    <p className="text-foreground flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      {formatDate(user?.created_at)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Customize your BiteQube experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {theme === 'light' ? (
                        <Sun className="w-5 h-5 text-orange-500" />
                      ) : (
                        <Moon className="w-5 h-5 text-blue-500" />
                      )}
                      <div>
                        <p className="font-medium">Dark Mode</p>
                        <p className="text-sm text-muted-foreground">
                          Switch between light and dark themes
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={theme === 'dark'}
                      onCheckedChange={toggleTheme}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-red-200 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                  <CardDescription>Irreversible and destructive actions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      onClick={handleSignOut}
                      className="hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 border-red-200 dark:border-red-800"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                    
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Level Progress */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="gradient-orange text-white border-0">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Award className="w-5 h-5 mr-2" />
                    Chef Level {getChefLevel(userStats.xp)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{userStats.xp}</div>
                      <p className="text-white/80">Total XP</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm text-white/80 mb-2">
                        <span>Progress to Level {getChefLevel(userStats.xp) + 1}</span>
                        <span>{getNextLevelXP(userStats.xp) - userStats.xp} XP to go</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-white h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getLevelProgress(userStats.xp)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Streak */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Flame className="w-5 h-5 mr-2" />
                    Daily Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl mb-2">
                      {getStreakEmoji(userStats.streak_days)}
                    </div>
                    <div className="text-3xl font-bold">{userStats.streak_days}</div>
                    <p className="text-white/80">Days in a row</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Badges */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 mr-2 text-orange-500" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getBadges(userStats.xp, userStats.streak_days).map((badge, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 bg-muted rounded-lg">
                        <div className="text-2xl">{badge.icon}</div>
                        <div>
                          <p className="font-medium text-sm">{badge.name}</p>
                          <p className="text-xs text-muted-foreground">{badge.description}</p>
                        </div>
                      </div>
                    ))}
                    
                    {getBadges(userStats.xp, userStats.streak_days).length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground text-sm">
                          Keep scanning and cooking to earn badges!
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
