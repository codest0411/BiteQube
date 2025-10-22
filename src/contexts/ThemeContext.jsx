import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { dbHelpers, supabase } from '@/lib/supabase'

const ThemeContext = createContext({})

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light')
  const { user } = useAuth()

  useEffect(() => {
    // Load theme from localStorage or user preferences
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    }
  }, [])

  useEffect(() => {
    // Load user's theme preference from database
    if (user) {
      loadUserTheme()
    }
  }, [user])

  const loadUserTheme = async () => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('theme')
        .eq('id', user.id)
        .single()
      
      if (userData?.theme) {
        setTheme(userData.theme)
        document.documentElement.classList.toggle('dark', userData.theme === 'dark')
        localStorage.setItem('theme', userData.theme)
      }
    } catch (error) {
      console.error('Error loading user theme:', error)
    }
  }

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    localStorage.setItem('theme', newTheme)

    // Save to database if user is logged in
    if (user) {
      try {
        await dbHelpers.updateUserTheme(user.id, newTheme)
      } catch (error) {
        console.error('Error saving theme preference:', error)
      }
    }
  }

  const value = {
    theme,
    toggleTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
