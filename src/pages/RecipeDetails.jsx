import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Heart, 
  ShoppingCart, 
  MessageSquare,
  Bookmark,
  BookmarkCheck,
  ChefHat,
  Flame
} from 'lucide-react'
import { mealAPI } from '@/lib/api'
import { dbHelpers } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { extractIngredients, estimateNutrition } from '@/lib/utils'
import { askChefAboutRecipe } from '@/lib/chatbase'
import Navbar from '@/components/Navbar'
import { toast } from 'sonner'

const RecipeDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [nutrition, setNutrition] = useState(null)
  const [ingredients, setIngredients] = useState([])
  const [isUserRecipe, setIsUserRecipe] = useState(false)

  useEffect(() => {
    loadRecipe()
  }, [id])

  const loadRecipe = async () => {
    try {
      // Check if this is a UUID (user recipe) or numeric ID (TheMealDB recipe)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
      
      if (isUUID) {
        // Load user-created recipe
        console.log('Loading user recipe with ID:', id)
        const { data: userRecipeData, error } = await dbHelpers.getUserRecipeById(id)
        console.log('User recipe data:', userRecipeData, 'Error:', error)
        
        if (!error && userRecipeData) {
          setRecipe(userRecipeData)
          setIngredients(userRecipeData.ingredients || [])
          setIsUserRecipe(true)
          // User recipes can't be "saved" since they're already public
          setIsSaved(false)
        } else {
          console.error('Failed to load user recipe:', error)
          toast.error('Recipe not found')
          navigate('/cookbook')
        }
      } else {
        // Load TheMealDB recipe
        const recipeData = await mealAPI.getMealById(id)
        if (recipeData) {
          setRecipe(recipeData)
          const recipeIngredients = extractIngredients(recipeData)
          setIngredients(recipeIngredients)
          setNutrition(estimateNutrition(recipeData))
          setIsUserRecipe(false)
          
          // Check if recipe is already saved
          if (user) {
            checkIfSaved(recipeData.idMeal)
          }
        } else {
          toast.error('Recipe not found')
          navigate('/dashboard')
        }
      }
    } catch (error) {
      console.error('Error loading recipe:', error)
      toast.error('Failed to load recipe')
    } finally {
      setLoading(false)
    }
  }

  const checkIfSaved = async (recipeId) => {
    try {
      const { data } = await dbHelpers.getSavedRecipes(user.id)
      const saved = data?.some(savedRecipe => savedRecipe.recipe_id === recipeId)
      setIsSaved(saved)
    } catch (error) {
      console.error('Error checking if recipe is saved:', error)
    }
  }

  const toggleSaveRecipe = async () => {
    if (!user || !recipe) return

    try {
      if (isSaved) {
        await dbHelpers.removeRecipe(user.id, recipe.idMeal)
        setIsSaved(false)
        toast.success('Recipe removed from cookbook')
      } else {
        await dbHelpers.saveRecipe(user.id, recipe)
        setIsSaved(true)
        toast.success('Recipe saved to cookbook!')
      }
    } catch (error) {
      console.error('Error toggling recipe save:', error)
      toast.error('Failed to update recipe')
    }
  }

  const addToShoppingList = async () => {
    if (!user || !ingredients.length) return

    try {
      const ingredientNames = ingredients.map(ing => `${ing.measure} ${ing.name}`.trim())
      await dbHelpers.addToShoppingList(user.id, ingredientNames)
      toast.success(`Added ${ingredients.length} ingredients to shopping list!`)
    } catch (error) {
      console.error('Error adding to shopping list:', error)
      toast.error('Failed to add ingredients to shopping list')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-6 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Recipe Not Found</h1>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="hover:bg-orange-50 dark:hover:bg-orange-950"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recipe Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={isUserRecipe ? (recipe.image_url || '/api/placeholder/400/300') : recipe.strMealThumb}
                    alt={isUserRecipe ? recipe.title : recipe.strMeal}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-2xl md:text-3xl mb-2">
                        {isUserRecipe ? recipe.title : recipe.strMeal}
                      </CardTitle>
                      <CardDescription className="text-lg">
                        {isUserRecipe ? (
                          <>
                            {recipe.category} • {recipe.cuisine} Cuisine
                            {recipe.users && (
                              <div className="text-sm mt-1 text-muted-foreground">
                                By {recipe.users.name || recipe.users.email}
                              </div>
                            )}
                          </>
                        ) : (
                          <>{recipe.strCategory} • {recipe.strArea} Cuisine</>
                        )}
                      </CardDescription>
                    </div>
                    
                    {!isUserRecipe && (
                      <Button
                        variant={isSaved ? "default" : "outline"}
                        onClick={toggleSaveRecipe}
                        className={isSaved ? "bg-orange-500 hover:bg-orange-600" : ""}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-4 h-4 mr-2" />
                        ) : (
                          <Bookmark className="w-4 h-4 mr-2" />
                        )}
                        {isSaved ? 'Saved' : 'Save'}
                      </Button>
                    )}
                  </div>
                </CardHeader>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="gradient"
                      onClick={addToShoppingList}
                      disabled={!ingredients.length}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Shopping List
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        const recipeName = isUserRecipe ? recipe.title : recipe.strMeal
                        const success = askChefAboutRecipe(recipeName)
                        if (!success) {
                          toast.info('Chat widget is loading. Please try again in a moment.')
                        }
                      }}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Ask Chef AI
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ChefHat className="w-5 h-5 mr-2 text-orange-500" />
                    Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    {isUserRecipe ? (
                      // User recipe instructions (array)
                      recipe.instructions.map((instruction, index) => (
                        <div key={index} className="mb-4 flex items-start">
                          <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                            {index + 1}
                          </div>
                          <p className="text-foreground leading-relaxed">
                            {instruction.trim()}
                          </p>
                        </div>
                      ))
                    ) : (
                      // TheMealDB instructions (string)
                      recipe.strInstructions.split('\n').map((instruction, index) => {
                        if (!instruction.trim()) return null
                        return (
                          <div key={index} className="mb-4 flex items-start">
                            <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                              {index + 1}
                            </div>
                            <p className="text-foreground leading-relaxed">
                              {instruction.trim()}
                            </p>
                          </div>
                        )
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Video Tutorial - Only for TheMealDB recipes */}
            {!isUserRecipe && recipe.strYoutube && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Video Tutorial</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${recipe.strYoutube.split('v=')[1]}`}
                        title="Recipe Video"
                        className="w-full h-full rounded-lg"
                        allowFullScreen
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Nutrition Info - Only for TheMealDB recipes */}
            {!isUserRecipe && nutrition && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Flame className="w-5 h-5 mr-2 text-orange-500" />
                      Nutrition (Estimated)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {nutrition.calories}
                        </div>
                        <div className="text-sm text-muted-foreground">Calories</div>
                      </div>
                      
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {nutrition.protein}g
                        </div>
                        <div className="text-sm text-muted-foreground">Protein</div>
                      </div>
                      
                      <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {nutrition.carbs}g
                        </div>
                        <div className="text-sm text-muted-foreground">Carbs</div>
                      </div>
                      
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {nutrition.fat}g
                        </div>
                        <div className="text-sm text-muted-foreground">Fat</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Ingredients */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Ingredients ({ingredients.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {isUserRecipe ? (
                      // User recipe ingredients (simple array)
                      ingredients.map((ingredient, index) => (
                        <div
                          key={index}
                          className="flex items-center p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <span className="font-medium">{ingredient}</span>
                        </div>
                      ))
                    ) : (
                      // TheMealDB ingredients (with measures)
                      ingredients.map((ingredient, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <span className="font-medium">{ingredient.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {ingredient.measure}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recipe Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Recipe Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isUserRecipe ? (
                    // User recipe info
                    <>
                      {recipe.prep_time && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                            <span>Prep Time</span>
                          </div>
                          <span className="font-medium">{recipe.prep_time} min</span>
                        </div>
                      )}
                      
                      {recipe.cook_time && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                            <span>Cook Time</span>
                          </div>
                          <span className="font-medium">{recipe.cook_time} min</span>
                        </div>
                      )}
                      
                      {recipe.servings && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                            <span>Servings</span>
                          </div>
                          <span className="font-medium">{recipe.servings}</span>
                        </div>
                      )}
                      
                      {recipe.difficulty && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <ChefHat className="w-4 h-4 mr-2 text-muted-foreground" />
                            <span>Difficulty</span>
                          </div>
                          <span className="font-medium">{recipe.difficulty}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    // TheMealDB recipe info
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span>Prep Time</span>
                        </div>
                        <span className="font-medium">30-45 min</span>
                      </div>
                    </>
                  )}
                  
                  {!isUserRecipe && (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span>Servings</span>
                        </div>
                        <span className="font-medium">4-6 people</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Heart className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span>Difficulty</span>
                        </div>
                        <span className="font-medium">Medium</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecipeDetails
