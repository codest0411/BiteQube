import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Check, 
  X,
  Package,
  ListChecks,
  Loader2
} from 'lucide-react'
import { dbHelpers, supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import { toast } from 'sonner'

const ShoppingList = () => {
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState('')
  const [loading, setLoading] = useState(true)
  const [addingItem, setAddingItem] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadShoppingList()
      setupRealtimeSubscription()
    }
  }, [user])

  const loadShoppingList = async () => {
    try {
      const { data, error } = await dbHelpers.getShoppingList(user.id)
      if (!error && data) {
        setItems(data)
      }
    } catch (error) {
      console.error('Error loading shopping list:', error)
      toast.error('Failed to load shopping list')
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('shopping_items_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shopping_items',
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
        setItems(prev => [newRecord, ...prev])
        break
      case 'UPDATE':
        setItems(prev => prev.map(item => 
          item.item_id === newRecord.item_id ? newRecord : item
        ))
        break
      case 'DELETE':
        setItems(prev => prev.filter(item => item.item_id !== oldRecord.item_id))
        break
    }
  }

  const addItem = async () => {
    if (!newItem.trim() || addingItem) return

    setAddingItem(true)
    try {
      await dbHelpers.addToShoppingList(user.id, [newItem.trim()])
      setNewItem('')
      toast.success('Item added to shopping list!')
    } catch (error) {
      console.error('Error adding item:', error)
      toast.error('Failed to add item')
    } finally {
      setAddingItem(false)
    }
  }

  const toggleItem = async (itemId, currentStatus) => {
    try {
      await dbHelpers.updateShoppingItem(itemId, { is_checked: !currentStatus })
    } catch (error) {
      console.error('Error updating item:', error)
      toast.error('Failed to update item')
    }
  }

  const deleteItem = async (itemId) => {
    try {
      const { error } = await supabase
        .from('shopping_items')
        .delete()
        .eq('item_id', itemId)
      
      if (error) throw error
      toast.success('Item removed from list')
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item')
    }
  }

  const clearCompleted = async () => {
    try {
      const completedItems = items.filter(item => item.is_checked)
      if (completedItems.length === 0) {
        toast.info('No completed items to clear')
        return
      }

      const { error } = await supabase
        .from('shopping_items')
        .delete()
        .eq('user_id', user.id)
        .eq('is_checked', true)
      
      if (error) throw error
      toast.success(`Cleared ${completedItems.length} completed items`)
    } catch (error) {
      console.error('Error clearing completed items:', error)
      toast.error('Failed to clear completed items')
    }
  }

  const clearAll = async () => {
    if (items.length === 0) {
      toast.info('Shopping list is already empty')
      return
    }

    try {
      await dbHelpers.clearShoppingList(user.id)
      toast.success('Shopping list cleared')
    } catch (error) {
      console.error('Error clearing shopping list:', error)
      toast.error('Failed to clear shopping list')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addItem()
    }
  }

  const completedCount = items.filter(item => item.is_checked).length
  const totalCount = items.length
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

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
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 gradient-orange rounded-full flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            🛒 Shopping List
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your ingredients with real-time sync
          </p>
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-300">
                    Shopping Progress
                  </h3>
                  <p className="text-orange-600 dark:text-orange-400">
                    {completedCount} of {totalCount} items completed
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {Math.round(progressPercentage)}%
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Add Item */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2 text-orange-500" />
                Add New Item
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter ingredient or item..."
                  disabled={addingItem}
                  className="flex-1"
                />
                <Button
                  onClick={addItem}
                  disabled={!newItem.trim() || addingItem}
                  variant="gradient"
                >
                  {addingItem ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Shopping Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <ListChecks className="w-5 h-5 mr-2 text-orange-500" />
                  Items ({totalCount})
                </CardTitle>
                
                {totalCount > 0 && (
                  <div className="flex space-x-2">
                    {completedCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearCompleted}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Clear Completed
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAll}
                      className="hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Clear All
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Your shopping list is empty</h3>
                  <p className="text-muted-foreground mb-4">
                    Add ingredients from recipes or create your own list
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.item_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                        item.is_checked 
                          ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' 
                          : 'bg-background hover:bg-muted/50'
                      }`}
                    >
                      <Checkbox
                        checked={item.is_checked}
                        onCheckedChange={() => toggleItem(item.item_id, item.is_checked)}
                        className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                      />
                      
                      <span className={`flex-1 ${
                        item.is_checked 
                          ? 'line-through text-muted-foreground' 
                          : 'text-foreground'
                      }`}>
                        {item.name}
                      </span>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteItem(item.item_id)}
                        className="hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-700 dark:text-blue-300">
                💡 Shopping Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-blue-600 dark:text-blue-400">
              <p>• Items sync in real-time across all your devices</p>
              <p>• Add ingredients directly from recipe pages</p>
              <p>• Group similar items together for easier shopping</p>
              <p>• Check items off as you shop to track progress</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default ShoppingList
