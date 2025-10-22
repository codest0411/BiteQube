/**
 * Recipe CSV Import Script
 * 
 * This script imports recipes from your CSV file into Supabase
 * 
 * Usage:
 * 1. Place your CSV file in the project root as 'recipes.csv'
 * 2. Make sure your .env has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * 3. Run: node scripts/import-recipes.js
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { parse } from 'csv-parse/sync'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
const envPath = path.join(__dirname, '..', '.env')
const envContent = fs.readFileSync(envPath, 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').trim()
  }
})

const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseKey = env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function importRecipes() {
  try {
    console.log('📖 Reading CSV file...')
    
    // Read CSV file
    const csvPath = path.join(__dirname, '..', 'recipes.csv')
    if (!fs.existsSync(csvPath)) {
      console.error('❌ recipes.csv not found in project root')
      console.log('💡 Please place your CSV file as: recipes.csv')
      process.exit(1)
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    
    // Parse CSV
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    })
    
    console.log(`✅ Found ${records.length} recipes in CSV`)
    
    // Transform and batch insert
    const batchSize = 100
    let imported = 0
    let errors = 0
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize)
      
      const recipesToInsert = batch.map(record => ({
        recipe_name: record.TranslatedRecipeName || record.RecipeName || 'Unnamed Recipe',
        ingredients: record.TranslatedIngredients || record.Ingredients || '',
        instructions: record.TranslatedInstructions || record.Instructions || '',
        cuisine: record.Cuisine || 'Unknown',
        total_time_mins: parseInt(record.TotalTimeInMins) || null,
        ingredient_count: parseInt(record['Ingredient-count']) || null,
        image_url: record['image-url'] || record.ImageURL || null,
        source_url: record.URL || null
      }))
      
      // Insert batch
      const { data, error } = await supabase
        .from('recipes')
        .insert(recipesToInsert)
      
      if (error) {
        console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error.message)
        errors += batch.length
      } else {
        imported += batch.length
        console.log(`✅ Imported batch ${i / batchSize + 1} (${imported}/${records.length})`)
      }
    }
    
    console.log('\n🎉 Import Complete!')
    console.log(`✅ Successfully imported: ${imported} recipes`)
    if (errors > 0) {
      console.log(`❌ Failed to import: ${errors} recipes`)
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  }
}

// Run import
importRecipes()
