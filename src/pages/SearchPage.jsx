import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Mic, 
  Loader2, 
  ArrowRight,
  ChefHat,
  Clock,
  Users,
  Sparkles,
  X,
  TrendingUp
} from 'lucide-react'
import { mealAPI } from '@/lib/api'
import { voiceAPI } from '@/lib/api'
import { dbHelpers } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import { toast } from 'sonner'

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [recipes, setRecipes] = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const [popularSearches] = useState([
    'chicken', 'beef', 'pasta', 'pizza', 'salad', 
    'curry', 'soup', 'dessert', 'seafood', 'vegan'
  ])
  const { user } = useAuth()
  const navigate = useNavigate()

  // Load recent searches on mount
  useEffect(() => {
    if (user) {
      loadRecentSearches()
    }
  }, [user])

  const loadRecentSearches = async () => {
    if (!user) return
    
    try {
      const { data, error } = await dbHelpers.getRecentSearches(user.id)
      if (data) {
        setRecentSearches(data)
      }
    } catch (error) {
      console.error('Error loading recent searches:', error)
    }
  }

  const saveSearch = async (query) => {
    if (!user || !query.trim()) return
    
    try {
      await dbHelpers.saveSearch(user.id, query.trim())
      loadRecentSearches()
    } catch (error) {
      console.error('Error saving search:', error)
    }
  }

  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) {
      toast.error('Please enter a search term')
      return
    }

    setIsSearching(true)
    try {
      const searchTerm = query.trim()
      console.log('🔍 Searching for:', searchTerm)
      
      // Search in both recipe database and user-created recipes
      const { data: allResults, error, sources } = await dbHelpers.searchAllRecipes(searchTerm)
      
      let results = []
      
      if (allResults && allResults.length > 0) {
        console.log(`✅ Found ${allResults.length} recipes (${sources?.database || 0} from database, ${sources?.community || 0} from community)`)
        results = allResults
        
        const dbCount = sources?.database || 0
        const communityCount = sources?.community || 0
        let message = `Found ${results.length} recipe${results.length > 1 ? 's' : ''} for "${searchTerm}"!`
        
        if (dbCount > 0 && communityCount > 0) {
          message += ` (${dbCount} from database, ${communityCount} from community)`
        } else if (communityCount > 0) {
          message += ` (${communityCount} from community recipes)`
        }
        
        toast.success(message)
      } else {
        // Fallback to TheMealDB if Supabase has no results
        console.log('⚠️ No results in database, trying TheMealDB...')
        let mealResults = await mealAPI.searchByName(searchTerm)
        
        // Try word-by-word if no direct match
        if (!mealResults || mealResults.length === 0) {
          const words = searchTerm.split(' ')
          for (const word of words) {
            if (word.length > 3) {
              mealResults = await mealAPI.searchByName(word)
              if (mealResults && mealResults.length > 0) {
                console.log(`✅ Found results with: ${word}`)
                break
              }
            }
          }
        }
        
        if (mealResults && mealResults.length > 0) {
          results = mealResults
          toast.success(`Found ${results.length} recipe${results.length > 1 ? 's' : ''} for "${searchTerm}"!`)
        } else {
          // Last resort: show random recipes
          console.log('ℹ️ No matches found, showing random suggestions...')
          const { data: randomRecipes } = await dbHelpers.getRandomRecipes(12)
          results = randomRecipes || await mealAPI.getRandomMeals(12)
          toast.info(`No exact matches for "${searchTerm}". Here are some recipe suggestions!`)
        }
      }
      
      setRecipes(results || [])
      
      // Save search to history
      if (results && results.length > 0) {
        await saveSearch(searchTerm)
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Failed to search recipes. Please try again.')
      
      // Show random recipes on error
      try {
        const { data: fallbackRecipes } = await dbHelpers.getRandomRecipes(12)
        setRecipes(fallbackRecipes || [])
        toast.info('Showing random recipes instead')
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError)
      }
    } finally {
      setIsSearching(false)
    }
  }

  const startVoiceSearch = () => {
    setIsListening(true)
    
    const recognition = voiceAPI.startListening(
      (transcript) => {
        setSearchQuery(transcript)
        setIsListening(false)
        toast.success(`Heard: "${transcript}"`)
        
        // Automatically search with voice input
        handleSearch(transcript)
      },
      (error) => {
        setIsListening(false)
        console.error('Voice recognition error:', error)
        
        if (error === 'not-allowed') {
          toast.error('Microphone permission denied. Please allow microphone access.')
        } else if (error === 'no-speech') {
          toast.error('No speech detected. Please try again.')
        } else {
          toast.error('Voice recognition failed. Please try again.')
        }
      }
    )
  }

  const handleQuickSearch = (query) => {
    setSearchQuery(query)
    handleSearch(query)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setRecipes([])
  }

  const saveRecipe = async (recipe) => {
    if (!user) {
      toast.error('Please login to save recipes')
      return
    }

    try {
      await dbHelpers.saveRecipe(user.id, {
        recipe_id: recipe.idMeal,
        title: recipe.strMeal,
        image_url: recipe.strMealThumb,
        category: recipe.strCategory,
        area: recipe.strArea
      })
      toast.success('Recipe saved to cookbook!')
    } catch (error) {
      console.error('Error saving recipe:', error)
      toast.error('Failed to save recipe')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            🔍 Search Recipes
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Find your favorite recipes by text or voice
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-3xl mx-auto mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search for recipes... (e.g., pizza, pasta, chicken curry)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 pr-10 h-12 text-lg"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                <Button
                  variant={isListening ? "destructive" : "outline"}
                  size="lg"
                  onClick={startVoiceSearch}
                  disabled={isListening}
                  className="px-6"
                >
                  {isListening ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Listening...
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5" />
                    </>
                  )}
                </Button>
                
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={() => handleSearch()}
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-8"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Search Suggestions */}
        {!recipes.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto mb-8"
          >
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Clock className="w-5 h-5 mr-2 text-orange-500" />
                    Recent Searches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.slice(0, 5).map((search, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickSearch(search.query)}
                        className="rounded-full"
                      >
                        {search.query}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Popular Searches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                  Popular Searches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickSearch(term)}
                      className="rounded-full"
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      {term}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Search Results */}
        {recipes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-center">
              Found {recipes.length} Recipe{recipes.length > 1 ? 's' : ''}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe, index) => {
                // Debug: Log recipe data to see what we're getting
                console.log('Recipe data:', recipe)
                
                // Handle all recipe formats (database, community, TheMealDB)
                const recipeId = recipe.recipe_id || recipe.id || recipe.idMeal
                const recipeName = recipe.recipe_name || recipe.title || recipe.strMeal
                const recipeImage = recipe.image_url || recipe.strMealThumb || 'https://via.placeholder.com/400x300?text=No+Image'
                const recipeCuisine = recipe.cuisine || recipe.strArea || 'Unknown'
                const recipeCategory = recipe.category || recipe.strCategory || 'Recipe'
                const recipeTime = recipe.total_time_mins || (recipe.prep_time && recipe.cook_time ? recipe.prep_time + recipe.cook_time : null)
                const isUserRecipe = recipe.isUserRecipe || recipe.source === 'community'
                
                // Debug: Log extracted values
                console.log('Extracted values:', { recipeId, recipeName, recipeImage, recipeCuisine })
                
                // Skip recipes with no valid data
                if (!recipeId || !recipeName) {
                  console.warn('Skipping invalid recipe:', recipe)
                  return null
                }
                
                return (
                  <motion.div
                    key={recipeId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <div className="aspect-video overflow-hidden rounded-t-lg relative">
                        <img
                          src={recipeImage}
                          alt={recipeName}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'
                          }}
                        />
                        
                        {/* Source Badge */}
                        {isUserRecipe && (
                          <div className="absolute top-2 left-2">
                            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                              <ChefHat className="w-3 h-3 mr-1" />
                              Community
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <CardHeader>
                        <CardTitle className="line-clamp-2">{recipeName}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <span>{recipeCuisine}</span>
                          {recipeTime && (
                            <>
                              <span>•</span>
                              <Clock className="w-3 h-3" />
                              <span>{recipeTime} mins</span>
                            </>
                          )}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        <div className="flex gap-2">
                          <Button
                            variant="gradient"
                            size="sm"
                            onClick={() => {
                              // Use consistent routing - RecipeDetails will determine type by ID format
                              const recipeId = recipe.recipe_id || recipe.id || recipe.idMeal
                              navigate(`/recipe/${recipeId}`)
                            }}
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
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 max-w-2xl mx-auto"
        >
          <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-700 dark:text-orange-300">
                💡 Search Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-orange-600 dark:text-orange-400">
              <p>• <strong>Text Search:</strong> Type dish name, ingredient, or cuisine</p>
              <p>• <strong>Voice Search:</strong> Click mic icon and speak clearly</p>
              <p>• <strong>Quick Search:</strong> Click suggested terms for instant results</p>
              <p>• <strong>Examples:</strong> "chicken curry", "italian pasta", "vegan dessert"</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default SearchPage
