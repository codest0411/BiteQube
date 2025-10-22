import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function calculateStreak(lastScan) {
  if (!lastScan) return 0
  
  const today = new Date()
  const lastScanDate = new Date(lastScan)
  const diffTime = Math.abs(today - lastScanDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays <= 1 ? 1 : 0
}

export function extractIngredients(meal) {
  const ingredients = []
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`]
    const measure = meal[`strMeasure${i}`]
    
    if (ingredient && ingredient.trim()) {
      ingredients.push({
        name: ingredient.trim(),
        measure: measure ? measure.trim() : ''
      })
    }
  }
  return ingredients
}

export function estimateNutrition(meal) {
  // Simple estimation based on ingredients and meal type
  const baseCalories = 300
  const ingredients = extractIngredients(meal)
  const additionalCalories = ingredients.length * 25
  
  return {
    calories: baseCalories + additionalCalories,
    protein: Math.round((baseCalories + additionalCalories) * 0.15 / 4),
    carbs: Math.round((baseCalories + additionalCalories) * 0.45 / 4),
    fat: Math.round((baseCalories + additionalCalories) * 0.30 / 9)
  }
}

export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
