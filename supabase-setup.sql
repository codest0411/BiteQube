-- =====================================================
-- BiteQubeAI - Complete Supabase Database Setup
-- =====================================================
-- Run this entire file in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABLES CREATION
-- =====================================================

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User statistics for gamification
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  xp INTEGER DEFAULT 0 CHECK (xp >= 0),
  streak_days INTEGER DEFAULT 0 CHECK (streak_days >= 0),
  last_scan TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Saved recipes from TheMealDB
CREATE TABLE IF NOT EXISTS public.saved_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  recipe_id TEXT NOT NULL,
  recipe_name TEXT NOT NULL,
  image_url TEXT,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- Shopping list items with real-time sync
CREATE TABLE IF NOT EXISTS public.shopping_items (
  item_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_checked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User-created recipes for community sharing
CREATE TABLE IF NOT EXISTS public.user_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  ingredients TEXT[] NOT NULL,
  instructions TEXT[] NOT NULL,
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  category TEXT,
  cuisine TEXT,
  difficulty TEXT DEFAULT 'Easy' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  image_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_xp ON public.user_stats(xp DESC);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_user_id ON public.saved_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_created_at ON public.saved_recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shopping_items_user_id ON public.shopping_items(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_items_checked ON public.shopping_items(user_id, is_checked);
CREATE INDEX IF NOT EXISTS idx_user_recipes_user_id ON public.user_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recipes_created_at ON public.user_recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_recipes_public ON public.user_recipes(is_public);
CREATE INDEX IF NOT EXISTS idx_user_recipes_category ON public.user_recipes(category);
CREATE INDEX IF NOT EXISTS idx_user_recipes_cuisine ON public.user_recipes(cuisine);

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_recipes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

DROP POLICY IF EXISTS "Users can view own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON public.user_stats;

DROP POLICY IF EXISTS "Users can view own recipes" ON public.saved_recipes;
DROP POLICY IF EXISTS "Users can insert own recipes" ON public.saved_recipes;
DROP POLICY IF EXISTS "Users can update own recipes" ON public.saved_recipes;
DROP POLICY IF EXISTS "Users can delete own recipes" ON public.saved_recipes;

DROP POLICY IF EXISTS "Users can view own shopping items" ON public.shopping_items;
DROP POLICY IF EXISTS "Users can insert own shopping items" ON public.shopping_items;
DROP POLICY IF EXISTS "Users can update own shopping items" ON public.shopping_items;
DROP POLICY IF EXISTS "Users can delete own shopping items" ON public.shopping_items;

DROP POLICY IF EXISTS "Anyone can view public user recipes" ON public.user_recipes;
DROP POLICY IF EXISTS "Users can insert own user recipes" ON public.user_recipes;
DROP POLICY IF EXISTS "Users can update own user recipes" ON public.user_recipes;
DROP POLICY IF EXISTS "Users can delete own user recipes" ON public.user_recipes;

-- =====================================================
-- 4. RLS POLICIES
-- =====================================================

-- Users table policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User stats policies
CREATE POLICY "Users can view own stats" ON public.user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON public.user_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON public.user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Saved recipes policies
CREATE POLICY "Users can view own recipes" ON public.saved_recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes" ON public.saved_recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes" ON public.saved_recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes" ON public.saved_recipes
  FOR DELETE USING (auth.uid() = user_id);

-- Shopping items policies
CREATE POLICY "Users can view own shopping items" ON public.shopping_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shopping items" ON public.shopping_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shopping items" ON public.shopping_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shopping items" ON public.shopping_items
  FOR DELETE USING (auth.uid() = user_id);

-- User recipes policies (public recipes visible to all, but only owners can modify)
CREATE POLICY "Anyone can view public user recipes" ON public.user_recipes
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert own user recipes" ON public.user_recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own user recipes" ON public.user_recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own user recipes" ON public.user_recipes
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 5. FUNCTIONS
-- =====================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into users table
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  
  -- Insert initial user stats
  INSERT INTO public.user_stats (user_id, xp, streak_days)
  VALUES (NEW.id, 0, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate user level based on XP
CREATE OR REPLACE FUNCTION public.get_user_level(user_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN FLOOR(user_xp / 100) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get next level XP requirement
CREATE OR REPLACE FUNCTION public.get_next_level_xp(user_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN (FLOOR(user_xp / 100) + 1) * 100;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 6. TRIGGERS
-- =====================================================

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_user_stats_updated_at ON public.user_stats;
DROP TRIGGER IF EXISTS update_shopping_items_updated_at ON public.shopping_items;
DROP TRIGGER IF EXISTS update_user_recipes_updated_at ON public.user_recipes;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Triggers for updated_at timestamps
CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_shopping_items_updated_at
  BEFORE UPDATE ON public.shopping_items
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_user_recipes_updated_at
  BEFORE UPDATE ON public.user_recipes
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- =====================================================
-- 7. REALTIME SUBSCRIPTIONS
-- =====================================================

-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.saved_recipes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shopping_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_recipes;

-- =====================================================
-- 8. VIEWS (Optional - for analytics)
-- =====================================================

-- View for user statistics with calculated fields
CREATE OR REPLACE VIEW public.user_stats_view AS
SELECT 
  us.*,
  u.name,
  u.email,
  public.get_user_level(us.xp) as level,
  public.get_next_level_xp(us.xp) as next_level_xp,
  public.get_next_level_xp(us.xp) - us.xp as xp_to_next_level,
  CASE 
    WHEN us.xp = 0 THEN 0
    ELSE ((us.xp % 100)::FLOAT / 100 * 100)
  END as level_progress_percentage
FROM public.user_stats us
JOIN public.users u ON us.user_id = u.id;

-- View for recipe statistics
CREATE OR REPLACE VIEW public.recipe_stats_view AS
SELECT 
  user_id,
  COUNT(*) as total_recipes,
  COUNT(DISTINCT (data->>'strCategory')) as unique_categories,
  COUNT(DISTINCT (data->>'strArea')) as unique_cuisines,
  MIN(created_at) as first_recipe_saved,
  MAX(created_at) as last_recipe_saved
FROM public.saved_recipes
GROUP BY user_id;

-- =====================================================
-- 9. SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Uncomment below to insert sample categories for testing
/*
INSERT INTO public.recipe_categories (name, description) VALUES
('Breakfast', 'Morning meals and dishes'),
('Lunch', 'Midday meals and light dishes'),
('Dinner', 'Evening meals and main courses'),
('Dessert', 'Sweet treats and desserts'),
('Snack', 'Light snacks and appetizers'),
('Beverage', 'Drinks and beverages')
ON CONFLICT (name) DO NOTHING;
*/

-- =====================================================
-- 10. GRANTS AND PERMISSIONS
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions to anon users (for public access if needed)
GRANT USAGE ON SCHEMA public TO anon;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================

-- Verify the setup
SELECT 'BiteQubeAI Database Setup Complete!' as status;

-- Show created tables
SELECT 
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'user_stats', 'saved_recipes', 'shopping_items', 'user_recipes');

-- Show RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'user_stats', 'saved_recipes', 'shopping_items', 'user_recipes');
