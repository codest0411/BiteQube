import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Camera, 
  Upload, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  X,
  MessageSquare
} from 'lucide-react'
import { imageAPI, mealAPI } from '@/lib/api'
import { dbHelpers } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { askChefAboutFood } from '@/lib/chatbase'
import Navbar from '@/components/Navbar'
import { toast } from 'sonner'

const ScanPage = () => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [recipes, setRecipes] = useState([])
  const [confidence, setConfidence] = useState(0)
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState(null)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  const handleImageSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
      setAnalysisResult(null)
      setRecipes([])
    }
  }

  // Open camera with permission
  const openCamera = async () => {
    try {
      // Request camera permission
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      })
      
      setStream(mediaStream)
      setShowCamera(true)
      
      // Wait for video element to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      }, 100)
      
      toast.success('Camera ready! Position your dish and capture.')
    } catch (error) {
      console.error('Camera error:', error)
      
      if (error.name === 'NotAllowedError') {
        toast.error('Camera permission denied. Please allow camera access in your browser settings.')
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera found on this device.')
      } else {
        toast.error('Failed to access camera. Please try uploading an image instead.')
      }
    }
  }

  // Capture photo from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Draw video frame to canvas
      const context = canvas.getContext('2d')
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
        setSelectedImage(file)
        setImagePreview(canvas.toDataURL('image/jpeg'))
        
        // Close camera
        closeCamera()
        
        toast.success('Photo captured! Click "Analyze Image" to identify the dish.')
      }, 'image/jpeg', 0.95)
    }
  }

  // Close camera
  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setShowCamera(false)
  }

  const analyzeImage = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)
    try {
      // Classify image with local API
      const classification = await imageAPI.classifyImage(selectedImage)
      
      if (classification && classification.length > 0) {
        const topResult = classification[0]
        setAnalysisResult(topResult.label)
        setConfidence(Math.round(topResult.score * 100))

        console.log('🔍 Detected food:', topResult.label, 'Confidence:', Math.round(topResult.score * 100) + '%')

        // Search for recipes based on the classification (including community recipes)
        console.log('🔍 Searching for:', topResult.label)
        let { data: foundRecipes, sources } = await dbHelpers.searchAllRecipes(topResult.label, 20)
        console.log('📋 Found recipes:', foundRecipes?.length || 0, 'Sources:', sources)
        
        // If no recipes found, try searching with individual words
        if (!foundRecipes || foundRecipes.length === 0) {
          console.log('⚠️ No exact match, trying individual words...')
          const words = topResult.label.split(' ')
          for (const word of words) {
            if (word.length > 3) { // Skip short words
              console.log('🔍 Trying word:', word)
              const { data: wordResults } = await dbHelpers.searchAllRecipes(word, 20)
              if (wordResults && wordResults.length > 0) {
                console.log('✅ Found recipes with:', word)
                foundRecipes = wordResults
                break
              }
            }
          }
        }
        
        // Fallback to TheMealDB if still no results
        if (!foundRecipes || foundRecipes.length === 0) {
          console.log('⚠️ No results from combined search, trying TheMealDB fallback...')
          foundRecipes = await mealAPI.searchByName(topResult.label)
        }
        
        // If still no recipes, try getting all recipes from TheMealDB
        if (!foundRecipes || foundRecipes.length === 0) {
          console.log('⚠️ No matches found, getting all available recipes...')
          toast.info(`No exact matches for "${topResult.label}". Showing all available recipes.`)
          foundRecipes = await mealAPI.getRandomMeals(12) // Get more recipes
        }
        
        // Show ALL found recipes (no limit)
        setRecipes(foundRecipes) // Show all recipes found
        
        if (foundRecipes && foundRecipes.length > 0) {
          toast.success(`Found ${foundRecipes.length} recipe${foundRecipes.length > 1 ? 's' : ''} for "${topResult.label}"!`)
        } else {
          toast.warning('No recipes available in database.')
        }

        // Update user XP
        if (user) {
          try {
            const { data: currentStats } = await dbHelpers.getUserStats(user.id)
            const newXP = (currentStats?.xp || 0) + 10
            const today = new Date().toISOString().split('T')[0]
            const lastScan = currentStats?.last_scan ? new Date(currentStats.last_scan).toISOString().split('T')[0] : null
            
            let newStreak = currentStats?.streak_days || 0
            if (lastScan !== today) {
              newStreak = lastScan === new Date(Date.now() - 86400000).toISOString().split('T')[0] ? newStreak + 1 : 1
            }

            await dbHelpers.updateUserStats(user.id, {
              xp: newXP,
              streak_days: newStreak,
              last_scan: new Date().toISOString()
            })

            toast.success(`+10 XP earned! 🎉`)
          } catch (error) {
            console.error('Error updating user stats:', error)
          }
        }

      } else {
        toast.error('Could not identify the food item. Showing all available recipes.')
        // Show all random recipes as fallback
        const randomRecipes = await mealAPI.getRandomMeals(12)
        setRecipes(randomRecipes)
        setAnalysisResult('All Recipes')
        setConfidence(0)
      }
    } catch (error) {
      console.error('Error analyzing image:', error)
      toast.error('Failed to analyze image. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const saveRecipe = async (recipe) => {
    if (!user) return

    try {
      await dbHelpers.saveRecipe(user.id, recipe)
      toast.success('Recipe saved to your cookbook!')
    } catch (error) {
      console.error('Error saving recipe:', error)
      toast.error('Failed to save recipe')
    }
  }

  const resetScan = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setAnalysisResult(null)
    setRecipes([])
    setConfidence(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            📸 Scan Your Dish
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Take a photo or upload an image of any dish, and our AI will identify it and find matching recipes for you.
          </p>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <Card className="border-2 border-dashed border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 transition-colors">
            <CardContent className="p-8">
              {!imagePreview ? (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 gradient-orange rounded-full flex items-center justify-center mx-auto">
                    <Camera className="w-10 h-10 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Upload Your Food Photo</h3>
                    <p className="text-muted-foreground">
                      Choose from your device or take a new photo
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      variant="gradient"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={openCamera}
                      className="flex items-center"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Open Camera
                    </Button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Image Preview */}
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Selected food"
                      className="w-full max-h-96 object-cover rounded-lg"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={resetScan}
                      className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Analysis Button */}
                  {!analysisResult && (
                    <Button
                      variant="gradient"
                      onClick={analyzeImage}
                      disabled={isAnalyzing}
                      className="w-full"
                      size="lg"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Analyzing with AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Analyze Image
                        </>
                      )}
                    </Button>
                  )}

                  {/* Analysis Result */}
                  {analysisResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center p-6 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800"
                    >
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-2">
                        Detected: {analysisResult}
                      </h3>
                      <p className="text-green-600 dark:text-green-400 mb-4">
                        Confidence: {confidence}%
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const success = askChefAboutFood(analysisResult)
                          if (!success) {
                            toast.info('Chat widget is loading. Please try again in a moment.')
                          }
                        }}
                        className="mt-2"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Ask Chef AI About This
                      </Button>
                    </motion.div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recipe Results */}
        {analysisResult && recipes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-center">
              {analysisResult === 'All Recipes' ? (
                <>🍽️ Showing {recipes.length} Available Recipes</>
              ) : (
                <>🍽️ Found {recipes.length} Recipe{recipes.length > 1 ? 's' : ''} for "{analysisResult}"</>
              )}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe, index) => (
                <motion.div
                  key={recipe.idMeal}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={recipe.strMealThumb}
                        alt={recipe.strMeal}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{recipe.strMeal}</CardTitle>
                      <CardDescription>
                        {recipe.strCategory} • {recipe.strArea}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="flex gap-2">
                        <Button
                          variant="gradient"
                          size="sm"
                          onClick={() => navigate(`/recipe/${recipe.idMeal}`)}
                          className="flex-1"
                        >
                          View Recipe
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => saveRecipe(recipe)}
                        >
                          Save
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Camera Modal */}
        {showCamera && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-4xl">
              <Button
                variant="ghost"
                size="icon"
                onClick={closeCamera}
                className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-6 h-6" />
              </Button>
              
              <div className="bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-auto"
                />
                
                <div className="p-6 text-center">
                  <p className="text-white mb-4">Position your dish in the frame</p>
                  <Button
                    variant="gradient"
                    size="lg"
                    onClick={capturePhoto}
                    className="w-full sm:w-auto"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Capture Photo
                  </Button>
                </div>
              </div>
              
              {/* Hidden canvas for capturing */}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </motion.div>
        )}

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 max-w-2xl mx-auto"
        >
          <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-700 dark:text-orange-300">
                💡 Tips for Better Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-orange-600 dark:text-orange-400">
              <p>• Use well-lit, clear photos for best accuracy</p>
              <p>• Capture the entire dish from a good angle</p>
              <p>• Avoid blurry or heavily filtered images</p>
              <p>• Try different angles if the first scan isn't accurate</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default ScanPage
