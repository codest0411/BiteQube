import React, { useState, useEffect } from 'react'
import { Users, Eye } from 'lucide-react'
import { dbHelpers } from '@/lib/supabase'

const VisitorCounter = () => {
  const [activeVisitors, setActiveVisitors] = useState(0)
  const [totalVisitors, setTotalVisitors] = useState(0)
  const [sessionId, setSessionId] = useState(null)

  // Generate or retrieve session ID
  useEffect(() => {
    let sid = localStorage.getItem('visitor_session_id')
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('visitor_session_id', sid)
    }
    setSessionId(sid)
  }, [])

  // Track this visitor
  useEffect(() => {
    if (!sessionId) return

    const trackVisit = async () => {
      await dbHelpers.trackVisitor(sessionId)
      fetchVisitorCounts()
    }

    trackVisit()

    // Update activity every 2 minutes
    const activityInterval = setInterval(trackVisit, 2 * 60 * 1000)

    return () => clearInterval(activityInterval)
  }, [sessionId])

  // Fetch visitor counts
  const fetchVisitorCounts = async () => {
    try {
      const [activeResult, totalResult] = await Promise.all([
        dbHelpers.getActiveVisitors(),
        dbHelpers.getTotalVisitors()
      ])

      if (activeResult.data !== null) {
        setActiveVisitors(activeResult.data)
      }
      if (totalResult.data !== null) {
        setTotalVisitors(totalResult.data)
      }
    } catch (error) {
      console.error('Error fetching visitor counts:', error)
    }
  }

  // Refresh counts every 10 seconds
  useEffect(() => {
    fetchVisitorCounts()
    const interval = setInterval(fetchVisitorCounts, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 py-4">
      {/* Active Visitors */}
      <div className="flex items-center gap-2 text-sm">
        <div className="relative">
          <Eye className="w-5 h-5 text-green-500" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        </div>
        <span className="text-muted-foreground">
          <span className="font-bold text-green-600 dark:text-green-400">{activeVisitors}</span> online now
        </span>
      </div>

      {/* Total Visitors */}
      <div className="flex items-center gap-2 text-sm">
        <Users className="w-5 h-5 text-blue-500" />
        <span className="text-muted-foreground">
          <span className="font-bold text-blue-600 dark:text-blue-400">{totalVisitors.toLocaleString()}</span> total visitors
        </span>
      </div>
    </div>
  )
}

export default VisitorCounter
