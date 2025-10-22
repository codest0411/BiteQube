import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BookOpen, 
  Search, 
  Filter, 
  Heart, 
  Clock, 
  Users,
  Trash2,
  Eye,
  ChefHat,
  Loader2,
  Camera,
  Plus,
  Edit,
  Crown,
  Globe
} from 'lucide-react'
import { dbHelpers, supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate } from '@/lib/utils'
import Navbar from '@/components/Navbar'
import { toast } from 'sonner'
import AddRecipeModal from '@/components/AddRecipeModal'

const Cookbook = () => {
  const [recipes, setRecipes] = useState([])
  const [userRecipes, setUserRecipes] = useState([])
  const [filteredRecipes, setFilteredRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState('all') // 'all', 'saved', 'community'
  const [showAddModal, setShowAddModal] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadAllRecipes()
      setupRealtimeSubscription()
    }
  }, [user])

  useEffect(() => {
    filterRecipes()
  }, [recipes, userRecipes, searchTerm, selectedCategory, viewMode])

  const loadAllRecipes = async () => {
    try {
      // Load saved recipes
      const { data: savedData, error: savedError } = await dbHelpers.getSavedRecipes(user.id)
      if (!savedError && savedData) {
        console.log('Loaded saved recipes:', savedData.length)
        setRecipes(savedData)
      } else if (savedError) {
        console.error('Error loading saved recipes:', savedError)
      }
      
      // Load community recipes (user-created)
      const { data: userData, error: userError } = await dbHelpers.getAllUserRecipes()
      if (!userError && userData) {
        console.log('Loaded user recipes:', userData.length)
        setUserRecipes(userData)
      } else if (userError) {
        console.error('Error loading user recipes:', userError)
      }
    } catch (error) {
      console.error('Error loading recipes:', error)
      toast.error('Failed to load cookbook')
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('saved_recipes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'saved_recipes',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          handleRealtimeUpdate(payload)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const handleRealtimeUpdate = (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload

    switch (eventType) {
      case 'INSERT':
        setRecipes(prev => [newRecord, ...prev])
        break
      case 'DELETE':
        setRecipes(prev => prev.filter(recipe => recipe.id !== oldRecord.id))
        break
    }
  }

  const filterRecipes = () => {
    let filtered = []
    
    // Combine recipes based on view mode
    if (viewMode === 'saved') {
      filtered = recipes
    } else if (viewMode === 'community') {
      filtered = userRecipes.map(recipe => ({
        ...recipe,
        isUserRecipe: true,
        recipe_name: recipe.title,
        recipe_id: recipe.id
      }))
    } else {
      // All recipes - combine both saved and user recipes
      const savedRecipes = recipes
      const communityRecipes = userRecipes.map(recipe => ({
        ...recipe,
        isUserRecipe: true,
        recipe_name: recipe.title,
        recipe_id: recipe.id
      }))
      filtered = [...communityRecipes, ...savedRecipes]
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(recipe => {
        const name = recipe.recipe_name || recipe.title || ''
        const category = recipe.isUserRecipe ? recipe.category : recipe.data?.strCategory
        const area = recipe.isUserRecipe ? recipe.cuisine : recipe.data?.strArea
        
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               area?.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(recipe => {
        const category = recipe.isUserRecipe ? recipe.category : recipe.data?.strCategory
        return category?.toLowerCase() === selectedCategory.toLowerCase()
      })
    }

    setFilteredRecipes(filtered)
  }

  const removeRecipe = async (recipeId) => {
    try {
      await dbHelpers.removeRecipe(user.id, recipeId)
      toast.success('Recipe removed from cookbook')
    } catch (error) {
      console.error('Error removing recipe:', error)
      toast.error('Failed to remove recipe')
    }
  }

  const handleDeleteUserRecipe = async (recipeId) => {
    if (!confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      return
    }

    try {
      await dbHelpers.deleteUserRecipe(recipeId, user.id)
      toast.success('Recipe deleted successfully')
      // Refresh the recipes
      loadAllRecipes()
    } catch (error) {
      console.error('Error deleting recipe:', error)
      toast.error('Failed to delete recipe')
    }
  }

  const handleRecipeAdded = (newRecipe) => {
    // Refresh all recipes to get the complete data with user info
    loadAllRecipes()
    toast.success('Recipe added to community cookbook!')
  }

  const getCategories = () => {
    const categories = new Set()
    
    // Add categories from saved recipes
    recipes.forEach(recipe => {
      if (recipe.data?.strCategory) {
        categories.add(recipe.data.strCategory)
      }
    })
    
    // Add categories from user recipes
    userRecipes.forEach(recipe => {
      if (recipe.category) {
        categories.add(recipe.category)
      }
    })
    
    return Array.from(categories).sort()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        </div>
      </div>
    )
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
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 gradient-orange rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            📚 Community Cookbook
          </h1>
          <p className="text-muted-foreground text-lg">
            Your saved recipes and community shared recipes
          </p>
        </motion.div>

        {/* View Mode Tabs and Add Recipe Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* View Mode Tabs */}
            <div className="flex bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'all'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Globe className="w-4 h-4 mr-2 inline" />
                All Recipes
              </button>
              <button
                onClick={() => setViewMode('saved')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'saved'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <BookOpen className="w-4 h-4 mr-2 inline" />
                My Saved
              </button>
              <button
                onClick={() => setViewMode('community')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'community'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ChefHat className="w-4 h-4 mr-2 inline" />
                Community
              </button>
            </div>

            {/* Add Recipe Button */}
            <Button
              onClick={() => setShowAddModal(true)}
              variant="gradient"
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Recipe
            </Button>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search recipes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Category Filter */}
                <div className="md:w-48">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="all">All Categories</option>
                    {getCategories().map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-4 text-sm text-muted-foreground">
                Showing {filteredRecipes.length} of {recipes.length + userRecipes.length} recipes
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recipe Grid */}
        {filteredRecipes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12"
          >
            <ChefHat className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {recipes.length === 0 && userRecipes.length === 0 ? 'No recipes yet' : 'No recipes match your search'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {recipes.length === 0 && userRecipes.length === 0
                ? 'Start by scanning dishes, browsing recipes, or adding your own recipes'
                : 'Try adjusting your search terms or filters'
              }
            </p>
            {recipes.length === 0 && userRecipes.length === 0 && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/scan">
                  <Button variant="gradient">
                    <Camera className="w-4 h-4 mr-2" />
                    Scan Your First Dish
                  </Button>
                </Link>
                <Button variant="outline" onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your Recipe
                </Button>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow group">
                  {/* Recipe Image */}
                  <div className="aspect-video overflow-hidden rounded-t-lg relative">
                    <img
                      src={recipe.image_url || recipe.data?.strMealThumb || '/api/placeholder/400/300'}
                      alt={recipe.recipe_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Recipe Type Badge */}
                    <div className="absolute top-2 left-2">
                      {recipe.isUserRecipe ? (
                        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                          <ChefHat className="w-3 h-3 mr-1" />
                          Community
                        </div>
                      ) : (
                        <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                          <BookOpen className="w-3 h-3 mr-1" />
                          Saved
                        </div>
                      )}
                    </div>

                    {/* Owner Badge */}
                    {recipe.isUserRecipe && recipe.user_id === user.id && (
                      <div className="absolute top-2 right-2">
                        <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                          <Crown className="w-3 h-3 mr-1" />
                          Mine
                        </div>
                      </div>
                    )}
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <Link to={`/recipe/${recipe.recipe_id}`}>
                        <Button size="sm" variant="secondary">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      
                      {/* Show edit/delete for user's own recipes */}
                      {recipe.isUserRecipe && recipe.user_id === user.id ? (
                        <>
                          <Button size="sm" variant="secondary">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteUserRecipe(recipe.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </>
                      ) : !recipe.isUserRecipe ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeRecipe(recipe.recipe_id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="line-clamp-2">{recipe.recipe_name}</CardTitle>
                    <CardDescription>
                      {recipe.isUserRecipe ? (
                        <>
                          {recipe.category} • {recipe.cuisine}
                          {recipe.users && (
                            <div className="text-xs mt-1 text-muted-foreground">
                              By {recipe.users.user_metadata?.full_name || recipe.users.email}
                            </div>
                          )}
                        </>
                      ) : (
                        <>{recipe.data?.strCategory} • {recipe.data?.strArea}</>
                      )}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Recipe Info */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {recipe.isUserRecipe ? (
                          `${(recipe.prep_time || 0) + (recipe.cook_time || 0)} min`
                        ) : (
                          '30-45 min'
                        )}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {recipe.isUserRecipe ? (
                          `${recipe.servings || 4} servings`
                        ) : (
                          '4-6 servings'
                        )}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="text-xs text-muted-foreground">
                      {recipe.isUserRecipe ? (
                        `Added on ${formatDate(recipe.created_at)}`
                      ) : (
                        `Saved on ${formatDate(recipe.created_at)}`
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Link to={`/recipe/${recipe.recipe_id}`} className="flex-1">
                        <Button variant="gradient" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-1" />
                          View Recipe
                        </Button>
                      </Link>
                      
                      {/* Show appropriate action button based on ownership */}
                      {recipe.isUserRecipe && recipe.user_id === user.id ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUserRecipe(recipe.id)}
                          className="hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      ) : !recipe.isUserRecipe ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeRecipe(recipe.recipe_id)}
                          className="hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add Recipe Modal */}
        <AddRecipeModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onRecipeAdded={handleRecipeAdded}
        />

        {/* Stats */}
        {(recipes.length > 0 || userRecipes.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950 border-orange-200 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-700 dark:text-orange-300">
                  📊 Cookbook Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {recipes.length + userRecipes.length}
                    </div>
                    <div className="text-sm text-orange-500 dark:text-orange-500">
                      Total Recipes
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {getCategories().length}
                    </div>
                    <div className="text-sm text-orange-500 dark:text-orange-500">
                      Categories
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {userRecipes.filter(r => r.user_id === user.id).length}
                    </div>
                    <div className="text-sm text-orange-500 dark:text-orange-500">
                      My Recipes
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {Math.round((recipes.length + userRecipes.length) / 7)}
                    </div>
                    <div className="text-sm text-orange-500 dark:text-orange-500">
                      Weeks of Meals
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Cookbook
