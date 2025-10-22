import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  ChefHat, 
  Lightbulb,
  MessageSquare,
  Sparkles
} from 'lucide-react'
import { chatbaseAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import { toast } from 'sonner'

const ChefChat = () => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const messagesEndRef = useRef(null)
  const { user } = useAuth()
  const location = useLocation()

  useEffect(() => {
    // Initialize with Chatbase welcome message
    const welcomeMessage = {
      id: Date.now(),
      type: 'bot',
      content: `Hello ${user?.user_metadata?.name || 'there'}! 👋 I'm your Chatbase AI assistant. I can help you with any questions you have. How can I assist you today?`,
      timestamp: new Date()
    }
    setMessages([welcomeMessage])

    // If coming from recipe page, add context
    if (location.state?.recipe) {
      const contextMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: `I see you're interested in ${location.state.recipe}! What would you like to know about this? I'm here to help with any questions.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, contextMessage])
    }
  }, [user, location.state])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await chatbaseAPI.sendMessage(userMessage.content, conversationId)
      
      // Update conversation ID
      if (response.conversationId) {
        setConversationId(response.conversationId)
      }

      const aiMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.text,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error sending message to Chatbase:', error)
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm experiencing some technical difficulties. Please try again in a moment!",
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
      toast.error('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }


  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickPrompts = [
    "How can you help me?",
    "What are your capabilities?",
    "Tell me something interesting",
    "Help me with a question",
    "What can you do?",
    "Give me some advice"
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header - Chatbase Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-sky-400 rounded-full flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold mb-1 bg-gradient-to-r from-orange-500 to-sky-400 bg-clip-text text-transparent">
            Chatbase Assistant
          </h1>
          <p className="text-sm text-muted-foreground">
            Powered by Chatbase • Ask me anything!
          </p>
        </motion.div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-[650px] flex flex-col border-0 shadow-xl bg-white dark:bg-gray-900">
            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-[80%] ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    {/* Avatar */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-400' 
                        : 'bg-gradient-to-r from-sky-500 to-sky-400'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Bot className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                    
                    {/* Message Bubble - Chatbase Style */}
                    <div className={`rounded-lg px-3 py-2 max-w-md ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white ml-auto'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <p className={`text-xs mt-1 opacity-60 ${
                        message.type === 'user' ? 'text-white' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Loading Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-muted rounded-2xl px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Chef is thinking...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Quick Prompts */}
            {messages.length <= 2 && (
              <div className="px-6 pb-4">
                <p className="text-sm text-muted-foreground mb-3 flex items-center">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Try these quick prompts:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {quickPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setInputMessage(prompt)}
                      className="text-left justify-start h-auto py-2 px-3"
                    >
                      <MessageSquare className="w-3 h-3 mr-2 flex-shrink-0" />
                      <span className="text-xs">{prompt}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input - Chatbase Style */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex space-x-3 items-end">
                <div className="flex-1 relative">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="pr-12 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-500 to-sky-400 hover:from-orange-600 hover:to-sky-500 text-white rounded-lg px-3 py-1.5"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Powered by Chatbase AI
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-orange-50 to-sky-50 dark:from-orange-950 dark:to-sky-950 border-orange-200 dark:border-sky-800">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-700 dark:text-orange-300">
                <Sparkles className="w-5 h-5 mr-2" />
                Tips for Better Conversations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-orange-600 dark:text-orange-400">
              <p>• Be clear and specific with your questions</p>
              <p>• Ask follow-up questions for more detailed information</p>
              <p>• Feel free to ask about any topic you're curious about</p>
              <p>• The AI learns from context, so provide relevant details</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default ChefChat
