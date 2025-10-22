import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  X, 
  Plus, 
  Minus, 
  Clock, 
  Users, 
  ChefHat,
  Upload,
  Loader2,
  Camera,
  Image as ImageIcon,
  Trash2
} from 'lucide-react'
import { dbHelpers } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

const AddRecipeModal = ({ isOpen, onClose, onRecipeAdded }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    prep_time: '',
    cook_time: '',
    servings: '',
    category: '',
    cuisine: '',
    difficulty: 'Easy',
    image_url: ''
  })

  const categories = [
    'Appetizer', 'Main Course', 'Dessert', 'Breakfast', 'Lunch', 'Dinner',
    'Snack', 'Beverage', 'Soup', 'Salad', 'Side Dish', 'Sauce'
  ]

  const cuisines = [
    'Italian', 'Chinese', 'Indian', 'Mexican', 'French', 'Japanese',
    'Thai', 'Greek', 'American', 'Mediterranean', 'Korean', 'Vietnamese',
    'Spanish', 'Turkish', 'Lebanese', 'Other'
  ]

  const difficulties = ['Easy', 'Medium', 'Hard']

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayItem = (field, index) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }))
    }
  }

  // Image handling functions
  const handleImageSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }
      
      setSelectedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = () => {
    // Create a file input that accepts camera
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment' // Use back camera
    input.onchange = handleImageSelect
    input.click()
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setFormData(prev => ({ ...prev, image_url: '' }))
  }

  // Convert image to base64 for storage (simple approach)
  const uploadImage = async () => {
    if (!selectedImage) return null
    
    setUploadingImage(true)
    try {
      // For now, we'll convert to base64 and store directly
      // In production, you'd upload to a service like Supabase Storage or Cloudinary
      const reader = new FileReader()
      return new Promise((resolve) => {
        reader.onload = (e) => {
          setUploadingImage(false)
          resolve(e.target.result) // Returns base64 string
        }
        reader.readAsDataURL(selectedImage)
      })
    } catch (error) {
      setUploadingImage(false)
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
      return null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Recipe title is required')
      return
    }
    
    if (!formData.description.trim()) {
      toast.error('Recipe description is required')
      return
    }

    if (formData.ingredients.filter(ing => ing.trim()).length === 0) {
      toast.error('At least one ingredient is required')
      return
    }

    if (formData.instructions.filter(inst => inst.trim()).length === 0) {
      toast.error('At least one instruction is required')
      return
    }

    setLoading(true)

    try {
      // Upload image if selected
      let imageUrl = formData.image_url
      if (selectedImage) {
        toast.info('Uploading image...')
        imageUrl = await uploadImage()
      }

      // Clean up arrays by removing empty items
      const cleanedData = {
        ...formData,
        ingredients: formData.ingredients.filter(ing => ing.trim()),
        instructions: formData.instructions.filter(inst => inst.trim()),
        prep_time: parseInt(formData.prep_time) || null,
        cook_time: parseInt(formData.cook_time) || null,
        servings: parseInt(formData.servings) || null,
        image_url: imageUrl
      }

      const { data, error } = await dbHelpers.createUserRecipe(user.id, cleanedData)
      
      if (error) {
        throw error
      }

      toast.success('Recipe added successfully!')
      onRecipeAdded(data)
      onClose()
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        ingredients: [''],
        instructions: [''],
        prep_time: '',
        cook_time: '',
        servings: '',
        category: '',
        cuisine: '',
        difficulty: 'Easy',
        image_url: ''
      })
      
      // Reset image state
      setSelectedImage(null)
      setImagePreview(null)
    } catch (error) {
      console.error('Error creating recipe:', error)
      toast.error('Failed to add recipe')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <ChefHat className="w-5 h-5 mr-2 text-orange-500" />
                    Add New Recipe
                  </CardTitle>
                  <CardDescription>
                    Share your favorite recipe with the community
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Recipe Image Upload */}
                <div className="space-y-4">
                  <label className="text-sm font-medium block">Recipe Image</label>
                  
                  {/* Image Preview */}
                  {imagePreview ? (
                    <div className="relative">
                      <div className="aspect-video w-full max-w-md mx-auto overflow-hidden rounded-lg border-2 border-dashed border-gray-300">
                        <img
                          src={imagePreview}
                          alt="Recipe preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removeImage}
                        className="absolute top-2 right-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    /* Upload Options */
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <div className="text-center space-y-4">
                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-4">
                            Add a photo of your delicious recipe
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            {/* Upload from Gallery */}
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('image-upload').click()}
                              disabled={uploadingImage}
                              className="flex items-center"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {uploadingImage ? 'Uploading...' : 'Upload Image'}
                            </Button>
                            
                            {/* Take Photo */}
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleCameraCapture}
                              disabled={uploadingImage}
                              className="flex items-center"
                            >
                              <Camera className="w-4 h-4 mr-2" />
                              Take Photo
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Hidden file input */}
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    Supported formats: JPG, PNG, GIF. Max size: 5MB
                  </p>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Recipe Title *</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter recipe title"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Description *</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Brief description of your recipe"
                        className="w-full h-20 px-3 py-2 border border-input rounded-md resize-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Image URL</label>
                      <Input
                        value={formData.image_url}
                        onChange={(e) => handleInputChange('image_url', e.target.value)}
                        placeholder="https://example.com/recipe-image.jpg"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-sm font-medium mb-2 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Prep (min)
                        </label>
                        <Input
                          type="number"
                          value={formData.prep_time}
                          onChange={(e) => handleInputChange('prep_time', e.target.value)}
                          placeholder="15"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Cook (min)
                        </label>
                        <Input
                          type="number"
                          value={formData.cook_time}
                          onChange={(e) => handleInputChange('cook_time', e.target.value)}
                          placeholder="30"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          Servings
                        </label>
                        <Input
                          type="number"
                          value={formData.servings}
                          onChange={(e) => handleInputChange('servings', e.target.value)}
                          placeholder="4"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Category</label>
                        <select
                          value={formData.category}
                          onChange={(e) => handleInputChange('category', e.target.value)}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        >
                          <option value="">Select category</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Cuisine</label>
                        <select
                          value={formData.cuisine}
                          onChange={(e) => handleInputChange('cuisine', e.target.value)}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        >
                          <option value="">Select cuisine</option>
                          {cuisines.map(cuisine => (
                            <option key={cuisine} value={cuisine}>{cuisine}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Difficulty</label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => handleInputChange('difficulty', e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      >
                        {difficulties.map(diff => (
                          <option key={diff} value={diff}>{diff}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Ingredients */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Ingredients *</label>
                  <div className="space-y-2">
                    {formData.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={ingredient}
                          onChange={(e) => handleArrayChange('ingredients', index, e.target.value)}
                          placeholder={`Ingredient ${index + 1}`}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem('ingredients', index)}
                          disabled={formData.ingredients.length === 1}
                          className="px-3"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('ingredients')}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Ingredient
                    </Button>
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Instructions *</label>
                  <div className="space-y-2">
                    {formData.instructions.map((instruction, index) => (
                      <div key={index} className="flex gap-2">
                        <div className="flex-shrink-0 w-8 h-10 bg-orange-100 dark:bg-orange-900 rounded-md flex items-center justify-center text-sm font-medium text-orange-600 dark:text-orange-400">
                          {index + 1}
                        </div>
                        <textarea
                          value={instruction}
                          onChange={(e) => handleArrayChange('instructions', index, e.target.value)}
                          placeholder={`Step ${index + 1}`}
                          className="flex-1 h-10 px-3 py-2 border border-input rounded-md resize-none"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem('instructions', index)}
                          disabled={formData.instructions.length === 1}
                          className="px-3"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('instructions')}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Step
                    </Button>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="gradient"
                    disabled={loading || uploadingImage}
                  >
                    {loading || uploadingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {uploadingImage ? 'Uploading Image...' : 'Adding Recipe...'}
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Recipe
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default AddRecipeModal
