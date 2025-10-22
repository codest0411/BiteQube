# 🍽️ BiteQube

**Snap. Speak. Cook Smarter.**

A futuristic AI-powered recipe discovery website that combines image recognition, voice search, and intelligent cooking assistance. Built with React, Supabase, and Hugging Face AI models.

## ✨ Features

### 🔍 **AI-Powered Food Recognition**
- Upload or capture photos of dishes
- Advanced image classification using Hugging Face models
- Instant recipe matching from TheMealDB
- Confidence scoring for accurate results

### 🎤 **Voice Search**
- Natural language recipe queries
- Web Speech API integration
- Real-time voice feedback
- Hands-free cooking experience

### 🤖 **ChefChat AI Assistant**
- Intelligent cooking advice and tips
- Recipe modifications and substitutions
- Personalized recommendations
- Interactive chat interface

### 📚 **Personal Cookbook**
- Save and organize favorite recipes
- Real-time sync across devices
- Advanced search and filtering
- Recipe categorization

### 🛒 **Smart Shopping Lists**
- Auto-generate from recipes
- Real-time collaboration
- Check off items as you shop
- Ingredient grouping

### 🎯 **Gamification**
- XP system for recipe scanning
- Daily streak tracking
- Achievement badges
- Chef level progression

### 🎨 **Beautiful Design**
- Light/Dark theme support
- Orange-white aesthetic
- Glassmorphism effects
- Smooth animations with Framer Motion
- Fully responsive design

## 🚀 Tech Stack

### **Frontend**
- **React.js** (Vite) - Modern React development
- **Tailwind CSS** - Utility-first styling
- **Shadcn UI** - Beautiful component library
- **Framer Motion** - Smooth animations
- **Lucide React** - Icon library

### **Backend & Database**
- **Supabase** - Backend-as-a-Service
  - Authentication & user management
  - PostgreSQL database
  - Real-time subscriptions
  - Row-level security

### **AI & APIs**
- **Hugging Face** - Image classification & text generation
- **TheMealDB** - Recipe database
- **Web Speech API** - Voice recognition

### **Deployment**
- **Vercel** - Frontend hosting
- **Environment variables** - Secure configuration

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Supabase account**
- **Hugging Face account**

## ⚙️ Setup Instructions

### 1. **Clone the Repository**
```bash
git clone <repository-url>
cd foodsnap-ai
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Environment Configuration**
Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Hugging Face Configuration
VITE_HUGGINGFACE_API_KEY=your_huggingface_api_key
```

### 4. **Supabase Setup**

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key

#### Database Schema
Run these SQL commands in your Supabase SQL editor:

```sql
-- Users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User statistics
CREATE TABLE public.user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  xp INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_scan TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved recipes
CREATE TABLE public.saved_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  recipe_id TEXT NOT NULL,
  recipe_name TEXT NOT NULL,
  image_url TEXT,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shopping list items
CREATE TABLE public.shopping_items (
  item_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_checked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own stats" ON public.user_stats
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own recipes" ON public.saved_recipes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own shopping items" ON public.shopping_items
  FOR ALL USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.saved_recipes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shopping_items;
```

#### Authentication Setup
1. Go to Authentication > Settings
2. Enable Google OAuth (optional)
3. Configure redirect URLs:
   - `http://localhost:5173/dashboard` (development)
   - `https://your-domain.com/dashboard` (production)

### 5. **Hugging Face Setup**
1. Create account at [huggingface.co](https://huggingface.co)
2. Go to Settings > Access Tokens
3. Create a new token with read permissions
4. Add to your `.env` file

### 6. **Development Server**
```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn UI components
│   ├── Navbar.jsx      # Navigation component
│   └── ProtectedRoute.jsx
├── contexts/           # React contexts
│   ├── AuthContext.jsx # Authentication state
│   └── ThemeContext.jsx # Theme management
├── hooks/              # Custom React hooks
│   └── use-toast.js    # Toast notifications
├── lib/                # Utility libraries
│   ├── api.js          # API functions
│   ├── supabase.js     # Supabase client & helpers
│   └── utils.js        # Utility functions
├── pages/              # Page components
│   ├── LandingPage.jsx # Homepage
│   ├── LoginPage.jsx   # Authentication
│   ├── Dashboard.jsx   # Main dashboard
│   ├── ScanPage.jsx    # Image scanning
│   ├── RecipeDetails.jsx # Recipe view
│   ├── ChefChat.jsx    # AI assistant
│   ├── ShoppingList.jsx # Shopping list
│   ├── Cookbook.jsx    # Saved recipes
│   └── Profile.jsx     # User profile
├── App.jsx             # Main app component
├── main.jsx           # Entry point
└── index.css          # Global styles
```

## 🎨 Design System

### **Colors**
- **Primary Orange**: `#FF7A00`
- **Light Orange**: `#FF9E40`
- **Neon Orange**: `#FF8A3C`
- **Background Light**: `#FFFFFF`
- **Background Dark**: `#0D0D0D`

### **Typography**
- **Headings**: Bold, gradient text effects
- **Body**: Clean, readable fonts
- **Code**: Monospace for technical content

### **Components**
- **Cards**: Glassmorphism effects with subtle shadows
- **Buttons**: Gradient backgrounds with hover effects
- **Inputs**: Clean borders with focus states
- **Navigation**: Sticky header with backdrop blur

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Deployment
npm run deploy       # Deploy to Vercel (if configured)
```

## 🚀 Deployment

### **Vercel Deployment**
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Environment Variables for Production**
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_key
VITE_HUGGINGFACE_API_KEY=your_huggingface_api_key
```

## 📱 Features Walkthrough

### **1. Landing Page**
- Hero section with animated elements
- Feature showcase
- Trending recipes carousel
- Tech stack highlights

### **2. Authentication**
- Email/password signup/login
- Google OAuth integration
- Animated form transitions
- Password visibility toggle

### **3. Dashboard**
- Welcome message with user stats
- XP and streak tracking
- Quick action cards
- Voice search activation

### **4. Scan Page**
- Image upload/capture
- AI analysis with confidence scores
- Recipe matching results
- XP rewards for scanning

### **5. Recipe Details**
- Full recipe information
- Nutrition estimation
- Ingredient lists
- Shopping list integration
- AI chat integration

### **6. ChefChat**
- AI-powered cooking assistant
- Natural conversation interface
- Quick prompt suggestions
- Cooking tips and advice

### **7. Shopping List**
- Real-time sync across devices
- Progress tracking
- Item checking/unchecking
- Bulk operations

### **8. Cookbook**
- Personal recipe collection
- Search and filtering
- Category organization
- Real-time updates

### **9. Profile**
- User information management
- Theme switcher
- Achievement system
- Account settings

## 🔒 Security Features

- **Row Level Security** (RLS) in Supabase
- **JWT-based authentication**
- **Environment variable protection**
- **Input validation and sanitization**
- **HTTPS enforcement**

## 🎯 Performance Optimizations

- **Code splitting** with React.lazy
- **Image optimization** with proper sizing
- **Lazy loading** for better performance
- **Efficient state management**
- **Minimal bundle size**

## 🐛 Troubleshooting

### **Common Issues**

1. **Supabase Connection Error**
   - Check environment variables
   - Verify project URL and keys
   - Ensure RLS policies are set correctly

2. **Hugging Face API Errors**
   - Verify API key is valid
   - Check rate limits
   - Ensure model availability

3. **Voice Recognition Not Working**
   - Requires HTTPS in production
   - Check browser permissions
   - Verify microphone access

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check for missing dependencies
   - Verify environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Hugging Face** for AI models
- **TheMealDB** for recipe data
- **Supabase** for backend services
- **Shadcn** for UI components
- **Vercel** for hosting

---

**Built with ❤️ and 🍕 by the BiteQubeAI team**
