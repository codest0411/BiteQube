import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url' && 
  supabaseAnonKey !== 'your_supabase_anon_key'

// Create Supabase client with fallback for demo mode
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Demo mode warning
if (!isSupabaseConfigured) {
  console.warn('Supabase not configured - running in demo mode. Some features will be limited.')
}

// Database helper functions
export const dbHelpers = {
  // User stats
  async getUserStats(userId) {
    if (!supabase) {
      // Return demo data when Supabase is not configured
      return { 
        data: { xp: 150, streak_days: 3, user_id: 'demo' }, 
        error: null 
      }
    }
    
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error && error.code === 'PGRST116') {
      // Create initial stats if they don't exist
      const { data: newStats, error: createError } = await supabase
        .from('user_stats')
        .insert({ user_id: userId, xp: 0, streak_days: 0 })
        .select()
        .single()
      
      return { data: newStats, error: createError }
    }
    
    return { data, error }
  },

  async updateUserStats(userId, updates) {
    const { data, error } = await supabase
      .from('user_stats')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()
    
    return { data, error }
  },

  // Saved recipes
  async saveRecipe(userId, recipe) {
    const { data, error } = await supabase
      .from('saved_recipes')
      .insert({
        user_id: userId,
        recipe_id: recipe.idMeal,
        recipe_name: recipe.strMeal,
        image_url: recipe.strMealThumb,
        data: recipe
      })
      .select()
      .single()
    
    return { data, error }
  },

  async getSavedRecipes(userId) {
    const { data, error } = await supabase
      .from('saved_recipes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  async removeRecipe(userId, recipeId) {
    const { data, error } = await supabase
      .from('saved_recipes')
      .delete()
      .eq('user_id', userId)
      .eq('recipe_id', recipeId)
    
    return { data, error }
  },

  // Shopping list
  async addToShoppingList(userId, items) {
    const itemsToInsert = items.map(item => ({
      user_id: userId,
      name: item,
      is_checked: false
    }))
    
    const { data, error } = await supabase
      .from('shopping_items')
      .insert(itemsToInsert)
      .select()
    
    return { data, error }
  },

  async getShoppingList(userId) {
    const { data, error } = await supabase
      .from('shopping_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  async updateShoppingItem(itemId, updates) {
    const { data, error } = await supabase
      .from('shopping_items')
      .update(updates)
      .eq('item_id', itemId)
      .select()
      .single()
    
    return { data, error }
  },

  async clearShoppingList(userId) {
    const { data, error } = await supabase
      .from('shopping_items')
      .delete()
      .eq('user_id', userId)
    
    return { data, error }
  },

  // User preferences
  async updateUserTheme(userId, theme) {
    const { data, error} = await supabase
      .from('users')
      .update({ theme })
      .eq('id', userId)
      .select()
      .single()
    
    return { data, error }
  },

  // Search history
  async saveSearch(userId, query) {
    if (!supabase) {
      return { data: null, error: null }
    }

    const { data, error } = await supabase
      .from('search_history')
      .insert({
        user_id: userId,
        query: query,
        searched_at: new Date().toISOString()
      })
      .select()
      .single()
    
    return { data, error }
  },

  async getRecentSearches(userId, limit = 10) {
    if (!supabase) {
      return { data: [], error: null }
    }

    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', userId)
      .order('searched_at', { ascending: false })
      .limit(limit)
    
    return { data, error }
  },

  async clearSearchHistory(userId) {
    if (!supabase) {
      return { data: null, error: null }
    }

    const { data, error } = await supabase
      .from('search_history')
      .delete()
      .eq('user_id', userId)
    
    return { data, error }
  },

  // Recipe database functions
  async searchRecipes(query, limit = 50) {
    if (!supabase) {
      return { data: [], error: null }
    }

    try {
      const searchTerm = query.toLowerCase()
      
      // Search in recipes table using simple text matching
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .or(`recipe_name.ilike.%${searchTerm}%,cuisine.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,ingredients.ilike.%${searchTerm}%`)
        .limit(limit)
      
      console.log('Database recipe search results:', data?.length || 0, 'recipes found')
      return { data, error }
    } catch (error) {
      console.error('Recipe search error:', error)
      return { data: [], error }
    }
  },

  async getRecipeById(recipeId) {
    if (!supabase) {
      return { data: null, error: null }
    }

    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', recipeId)
      .single()
    
    return { data, error }
  },

  async getRecipesByCuisine(cuisine, limit = 20) {
    if (!supabase) {
      return { data: [], error: null }
    }

    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .ilike('cuisine', `%${cuisine}%`)
      .limit(limit)
    
    return { data, error }
  },

  async getRandomRecipes(limit = 12) {
    if (!supabase) {
      return { data: [], error: null }
    }

    // Get random recipes using ORDER BY random()
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('id', { ascending: false })
      .limit(limit)
    
    return { data, error }
  },

  async getAllCuisines() {
    if (!supabase) {
      return { data: [], error: null }
    }

    const { data, error } = await supabase
      .from('recipes')
      .select('cuisine')
      .not('cuisine', 'is', null)
    
    if (data) {
      // Get unique cuisines
      const uniqueCuisines = [...new Set(data.map(r => r.cuisine))].sort()
      return { data: uniqueCuisines, error: null }
    }
    
    return { data: [], error }
  },

  // Visitor tracking functions
  async trackVisitor(sessionId) {
    if (!supabase) {
      return { data: null, error: null }
    }

    try {
      // Try to update existing session
      const { data: existing } = await supabase
        .from('visitor_stats')
        .select('*')
        .eq('session_id', sessionId)
        .single()

      if (existing) {
        // Update last activity and increment page views
        const { data, error } = await supabase
          .from('visitor_stats')
          .update({
            last_activity: new Date().toISOString(),
            page_views: existing.page_views + 1,
            is_active: true
          })
          .eq('session_id', sessionId)
          .select()
          .single()
        
        return { data, error }
      } else {
        // Insert new visitor
        const { data, error } = await supabase
          .from('visitor_stats')
          .insert({
            session_id: sessionId,
            user_agent: navigator.userAgent,
            is_active: true
          })
          .select()
          .single()
        
        return { data, error }
      }
    } catch (error) {
      console.error('Error tracking visitor:', error)
      return { data: null, error }
    }
  },

  async getActiveVisitors() {
    if (!supabase) {
      return { data: 0, error: null }
    }

    try {
      const { data, error } = await supabase.rpc('get_active_visitors')
      return { data: data || 0, error }
    } catch (error) {
      console.error('Error getting active visitors:', error)
      return { data: 0, error }
    }
  },

  async getTotalVisitors() {
    if (!supabase) {
      return { data: 0, error: null }
    }

    try {
      const { data, error } = await supabase.rpc('get_total_visitors')
      return { data: data || 0, error }
    } catch (error) {
      console.error('Error getting total visitors:', error)
      return { data: 0, error }
    }
  },

  // User-created recipes functions
  async createUserRecipe(userId, recipeData) {
    if (!supabase) {
      return { data: null, error: null }
    }

    const { data, error } = await supabase
      .from('user_recipes')
      .insert({
        user_id: userId,
        title: recipeData.title,
        description: recipeData.description,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        prep_time: recipeData.prep_time,
        cook_time: recipeData.cook_time,
        servings: recipeData.servings,
        category: recipeData.category,
        cuisine: recipeData.cuisine,
        difficulty: recipeData.difficulty,
        image_url: recipeData.image_url,
        is_public: true // All user recipes are public by default
      })
      .select()
      .single()
    
    return { data, error }
  },

  async getAllUserRecipes() {
    if (!supabase) {
      return { data: [], error: null }
    }

    try {
      const { data, error } = await supabase
        .from('user_recipes')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching user recipes:', error)
        return { data: [], error }
      }

      // Get user info for each recipe
      const recipesWithUsers = await Promise.all(
        (data || []).map(async (recipe) => {
          const { data: userData } = await supabase
            .from('users')
            .select('id, email, name')
            .eq('id', recipe.user_id)
            .single()
          
          return {
            ...recipe,
            users: userData
          }
        })
      )
      
      return { data: recipesWithUsers, error: null }
    } catch (error) {
      console.error('Error in getAllUserRecipes:', error)
      return { data: [], error }
    }
  },

  async getUserRecipeById(recipeId) {
    if (!supabase) {
      return { data: null, error: null }
    }

    try {
      console.log('Querying user_recipes table for ID:', recipeId)
      const { data, error } = await supabase
        .from('user_recipes')
        .select('*')
        .eq('id', recipeId)
        .single()
      
      console.log('Query result - data:', data, 'error:', error)
      
      if (error) {
        console.error('Error fetching user recipe by ID:', error)
        return { data: null, error }
      }

      // Get user info
      const { data: userData } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('id', data.user_id)
        .single()
      
      return { 
        data: {
          ...data,
          users: userData
        }, 
        error: null 
      }
    } catch (error) {
      console.error('Error in getUserRecipeById:', error)
      return { data: null, error }
    }
  },

  async updateUserRecipe(recipeId, userId, updates) {
    if (!supabase) {
      return { data: null, error: null }
    }

    const { data, error } = await supabase
      .from('user_recipes')
      .update(updates)
      .eq('id', recipeId)
      .eq('user_id', userId) // Ensure only owner can update
      .select()
      .single()
    
    return { data, error }
  },

  async deleteUserRecipe(recipeId, userId) {
    if (!supabase) {
      return { data: null, error: null }
    }

    const { data, error } = await supabase
      .from('user_recipes')
      .delete()
      .eq('id', recipeId)
      .eq('user_id', userId) // Ensure only owner can delete
    
    return { data, error }
  },

  async getUserOwnRecipes(userId) {
    if (!supabase) {
      return { data: [], error: null }
    }

    const { data, error } = await supabase
      .from('user_recipes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  // Combined search function for both recipe database and user recipes
  async searchAllRecipes(query, limit = 50) {
    if (!supabase) {
      return { data: [], error: null }
    }

    try {
      const searchTerm = query.toLowerCase()
      console.log('🔍 searchAllRecipes called with query:', query)
      
      // Search in recipe database (existing function)
      const { data: dbRecipes, error: dbError } = await this.searchRecipes(query, limit)
      console.log('📊 Database search results:', dbRecipes?.length || 0, 'Error:', dbError)
      
      // Search in user-created recipes
      const { data: userRecipes, error: userError } = await supabase
        .from('user_recipes')
        .select('*')
        .eq('is_public', true)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,cuisine.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(Math.floor(limit / 2)) // Reserve half the results for user recipes
      
      console.log('👥 User recipe search results:', userRecipes?.length || 0, 'Error:', userError)

      // Combine results
      const combinedResults = []
      
      // Add database recipes (from CSV/existing data)
      if (dbRecipes && !dbError) {
        combinedResults.push(...dbRecipes.map(recipe => ({
          ...recipe,
          source: 'database',
          isUserRecipe: false
        })))
      }
      
      // Add user-created recipes
      if (userRecipes && !userError) {
        combinedResults.push(...userRecipes.map(recipe => ({
          ...recipe,
          source: 'community',
          isUserRecipe: true,
          // Map user recipe fields to match expected format
          recipe_name: recipe.title,
          recipe_id: recipe.id,
          image_url: recipe.image_url || '/api/placeholder/400/300'
        })))
      }
      
      // Sort by relevance (exact matches first, then partial matches)
      combinedResults.sort((a, b) => {
        const aTitle = (a.recipe_name || a.title || '').toLowerCase()
        const bTitle = (b.recipe_name || b.title || '').toLowerCase()
        
        const aExact = aTitle.includes(searchTerm)
        const bExact = bTitle.includes(searchTerm)
        
        if (aExact && !bExact) return -1
        if (!aExact && bExact) return 1
        
        return 0
      })
      
      console.log('🎯 Final combined results:', combinedResults.length)
      
      // If no results from database or community, fallback to TheMealDB
      if (combinedResults.length === 0) {
        console.log('⚠️ No results from database/community, falling back to TheMealDB...')
        // Note: This would require importing mealAPI, but for now we'll return empty
        // The SearchPage will handle TheMealDB fallback
      }
      
      return { 
        data: combinedResults.slice(0, limit), 
        error: null,
        sources: {
          database: dbRecipes?.length || 0,
          community: userRecipes?.length || 0
        }
      }
    } catch (error) {
      console.error('Error in searchAllRecipes:', error)
      return { data: [], error }
    }
  }
}
