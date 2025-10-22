import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Mic, ChefHat, ShoppingCart, Sparkles, Zap, Brain, Globe, Moon, Sun, Check, Star, X, Info, BookOpen, Users, Award, Target } from 'lucide-react'
import { mealAPI } from '@/lib/api'
import { useTheme } from '@/contexts/ThemeContext'
import { toast } from 'sonner'
import VisitorCounter from '@/components/VisitorCounter'

const LandingPage = () => {
  const [trendingRecipes, setTrendingRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAboutModal, setShowAboutModal] = useState(false)
  const [showBlogModal, setShowBlogModal] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState(null)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    loadTrendingRecipes()
  }, [])

  const loadTrendingRecipes = async () => {
    try {
      const recipes = await mealAPI.getRandomMeals(6)
      setTrendingRecipes(recipes)
    } catch (error) {
      console.error('Error loading trending recipes:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle Stripe checkout
  const handleSubscribe = async (planName) => {
    // Free plan - redirect to login
    if (planName === 'BiteQube Free') {
      window.location.href = '/login'
      return
    }

    setLoadingPlan(planName)
    
    try {
      // Call backend API to create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: planName }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to start checkout', {
        description: error.message || 'Please try again or contact support'
      })
      setLoadingPlan(null)
    }
  }

  const features = [
    {
      icon: Camera,
      title: 'Snap & Identify',
      description: 'Take a photo of any dish and our AI will identify it instantly using advanced image recognition.'
    },
    {
      icon: Mic,
      title: 'Voice Search',
      description: 'Simply speak your recipe requests and find exactly what you\'re craving in seconds.'
    },
    {
      icon: ChefHat,
      title: 'AI Chef Assistant - BiteQube',
      description: 'Get personalized cooking tips, ingredient substitutions, and recipe modifications.'
    },
    {
      icon: ShoppingCart,
      title: 'Smart Shopping Lists',
      description: 'Automatically generate shopping lists from recipes with real-time sync across devices.'
    }
  ]

  const pricingPlans = [
    {
      name: 'BiteQube Free',
      price: '₹0',
      period: '/month',
      description: 'Perfect for home cooking enthusiasts',
      features: [
        'Basic food scanning (10 scans/day)',
        'Access to 500+ recipes',
        'Personal cookbook (up to 20 recipes)',
        'Basic shopping lists',
        'Email support'
      ],
      popular: false,
      buttonText: 'Get Started',
      buttonVariant: 'outline'
    },
    {
      name: 'BiteQube Extra',
      price: '₹199',
      period: '/month',
      description: 'Great for cooking enthusiasts and small families',
      features: [
        'Unlimited food scanning',
        'Access to 2000+ recipes',
        'Unlimited personal cookbook',
        'Smart shopping lists with sync',
        'Voice search & commands',
        'Priority email support',
        'Meal planning tools'
      ],
      popular: true,
      buttonText: 'Most Popular',
      buttonVariant: 'default'
    },
    {
      name: 'BiteQube Extra Large',
      price: '₹499',
      period: '/month',
      description: 'Perfect for professional chefs and food businesses',
      features: [
        'Everything in Extra plan',
        'AI nutrition analysis',
        'Advanced meal planning',
        'Recipe sharing & collaboration',
        'Multi-language support',
        'API access for businesses',
        'Custom recipe categories',
        '24/7 priority support',
        'Advanced analytics'
      ],
      popular: false,
      buttonText: 'Go Professional',
      buttonVariant: 'outline'
    }
  ]

  const howItWorks = [
    { step: '1', title: 'Snap', description: 'Take a photo of any dish', icon: Camera },
    { step: '2', title: 'Identify', description: 'AI recognizes the food instantly', icon: Brain },
    { step: '3', title: 'Cook', description: 'Get detailed recipes and instructions', icon: ChefHat },
    { step: '4', title: 'Shop', description: 'Add ingredients to your smart list', icon: ShoppingCart }
  ]

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 gradient-orange rounded-lg flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">BiteQube</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover:bg-orange-50 dark:hover:bg-orange-950"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </Button>
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/login">
              <Button variant="gradient">Get Started</Button>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Snap. Speak. Cook Smarter.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Snap. Identify. Cook. From "What's for dinner?" to "Wow, that's good!" — cooking just got effortless. ❤️
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/login">
                <Button size="lg" variant="gradient" className="text-lg px-8 py-6">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Cooking
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6"
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>

            {/* Hero Image/Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative max-w-4xl mx-auto"
            >
              <div className="relative gradient-orange rounded-3xl p-8 shadow-2xl">
                <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: Camera, label: 'Scan', key: 'scan' },
                    { icon: Mic, label: 'Voice', key: 'voice' },
                    { icon: ChefHat, label: 'Cook', key: 'cook' },
                    { icon: ShoppingCart, label: 'Shop', key: 'shop' }
                  ].map((item, index) => (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="bg-white/25 backdrop-blur-sm rounded-xl p-6 text-center border border-white/30 shadow-lg hover:bg-white/30 transition-all duration-300"
                    >
                      <item.icon className="w-8 h-8 text-white mx-auto mb-2 drop-shadow-sm" />
                      <p className="text-white text-sm font-medium drop-shadow-sm">
                        {item.label}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Four simple steps to culinary mastery</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-16 h-16 gradient-orange rounded-full flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-orange-600 dark:text-orange-400 font-bold">{item.step}</span>
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{item.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Powered by Advanced AI</h2>
            <p className="text-xl text-muted-foreground">Experience the future of cooking with cutting-edge technology</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 gradient-orange rounded-lg flex items-center justify-center">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-xl text-muted-foreground">Start cooking smarter with the perfect plan for your needs</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-orange-500 to-sky-400 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}
                
                <Card className={`h-full ${plan.popular ? 'ring-2 ring-orange-500 shadow-xl' : 'hover:shadow-lg'} transition-all duration-300`}>
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                    <CardDescription className="text-base mb-4">{plan.description}</CardDescription>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-primary">{plan.price}</span>
                      <span className="text-muted-foreground ml-1">{plan.period}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="pt-6">
                      <Button 
                        variant={plan.buttonVariant}
                        className={`w-full ${plan.popular ? 'bg-gradient-to-r from-orange-500 to-sky-400 hover:from-orange-600 hover:to-sky-500 text-white' : ''}`}
                        size="lg"
                        onClick={() => handleSubscribe(plan.name)}
                        disabled={loadingPlan === plan.name}
                      >
                        {loadingPlan === plan.name ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Processing...
                          </>
                        ) : (
                          plan.buttonText
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-muted-foreground">
              All plans include a 7-day free trial. No credit card required to start.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Trending Recipes */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Trending Recipes</h2>
            <p className="text-xl text-muted-foreground">Discover what's cooking around the world</p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-muted rounded-lg h-48 mb-4"></div>
                  <div className="bg-muted rounded h-4 mb-2"></div>
                  <div className="bg-muted rounded h-4 w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trendingRecipes.map((recipe, index) => (
                <motion.div
                  key={recipe.idMeal}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={recipe.strMealThumb}
                        alt={recipe.strMeal}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">{recipe.strMeal}</CardTitle>
                      <CardDescription>{recipe.strCategory} • {recipe.strArea}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-16 px-4 gradient-orange">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-8 text-white">Ready to Transform Your Cooking?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of home chefs who are already cooking smarter with BiteQube
            </p>
            <Link to="/login">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                <ChefHat className="w-5 h-5 mr-2" />
                Start Your Culinary Journey
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 gradient-orange rounded-lg flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">BiteQube</span>
              </div>
              <p className="text-muted-foreground">
               Snap. Identify. Cook. From "What's for dinner?" to "Wow, that's good!" — cooking just got effortless. ❤️
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-foreground">How it Works</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <button 
                    onClick={() => setShowAboutModal(true)}
                    className="hover:text-foreground cursor-pointer transition-colors"
                  >
                    About
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setShowBlogModal(true)}
                    className="hover:text-foreground cursor-pointer transition-colors"
                  >
                    Blog
                  </button>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
                <li><a href="#" className="hover:text-foreground">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8">
            {/* Visitor Counter */}
            <VisitorCounter />
            
            {/* Copyright */}
            <div className="text-center text-muted-foreground mt-4">
              <p>&copy; 2024 BiteQube. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-sky-500 rounded-xl flex items-center justify-center">
                  <Info className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold">About BiteQube</h2>
              </div>
              <button
                onClick={() => setShowAboutModal(false)}
                className="w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="prose dark:prose-invert max-w-none">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Target className="w-6 h-6 mr-2 text-orange-500" />
                    Our Mission
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    BiteQube is revolutionizing the way people cook and discover food. We believe that everyone deserves access to personalized, intelligent cooking assistance that makes meal preparation enjoyable, efficient, and creative.
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Sparkles className="w-6 h-6 mr-2 text-sky-500" />
                    What We Do
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Our AI-powered platform combines cutting-edge computer vision with extensive culinary knowledge to help users identify food, discover recipes, and manage their cooking journey. From scanning ingredients to generating shopping lists, we make cooking smarter and more accessible.
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Users className="w-6 h-6 mr-2 text-green-500" />
                    Our Team
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    We're a passionate team of food enthusiasts, AI engineers, and UX designers who share a common goal: making cooking accessible to everyone. Our diverse backgrounds in technology, culinary arts, and user experience design drive our innovation.
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Award className="w-6 h-6 mr-2 text-purple-500" />
                    Our Values
                  </h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>Innovation:</strong> Continuously pushing the boundaries of AI in culinary technology</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>Accessibility:</strong> Making cooking knowledge available to everyone, regardless of skill level</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>Quality:</strong> Providing accurate, helpful, and reliable culinary guidance</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>Community:</strong> Building a supportive ecosystem for home chefs worldwide</span>
                    </li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">Join Our Journey</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Whether you're a beginner cook or a seasoned chef, BiteQube is here to enhance your culinary experience. Join thousands of users who are already cooking smarter, discovering new flavors, and enjoying the art of cooking like never before.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <Button 
                onClick={() => setShowAboutModal(false)}
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-orange-500 to-sky-500 hover:from-orange-600 hover:to-sky-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Got It!
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Blog Modal */}
      {showBlogModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-sky-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold">BiteQube Blog</h2>
              </div>
              <button
                onClick={() => setShowBlogModal(false)}
                className="w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="prose dark:prose-invert max-w-none">
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Latest Articles</h3>
                  
                  <div className="space-y-6">
                    <article className="border-l-4 border-orange-500 pl-4 py-2">
                      <h4 className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-2">
                        The Future of AI in Your Kitchen
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 mb-2">
                        Discover how artificial intelligence is transforming the way we cook, from ingredient recognition to personalized recipe recommendations.
                      </p>
                      <span className="text-sm text-gray-500">Published 2 days ago</span>
                    </article>

                    <article className="border-l-4 border-sky-500 pl-4 py-2">
                      <h4 className="text-lg font-semibold text-sky-600 dark:text-sky-400 mb-2">
                        5 Tips for Better Food Photography
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 mb-2">
                        Learn how to capture stunning food photos that help our AI better identify your ingredients and dishes.
                      </p>
                      <span className="text-sm text-gray-500">Published 1 week ago</span>
                    </article>

                    <article className="border-l-4 border-green-500 pl-4 py-2">
                      <h4 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                        Sustainable Cooking with BiteQube
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 mb-2">
                        Explore how our smart shopping lists and recipe suggestions help reduce food waste and promote sustainable cooking practices.
                      </p>
                      <span className="text-sm text-gray-500">Published 2 weeks ago</span>
                    </article>

                    <article className="border-l-4 border-purple-500 pl-4 py-2">
                      <h4 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-2">
                        Global Cuisine Discovery Made Easy
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 mb-2">
                        From Italian pasta to Indian curries, learn how BiteQube helps you explore and master international cuisines from your home kitchen.
                      </p>
                      <span className="text-sm text-gray-500">Published 3 weeks ago</span>
                    </article>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {['AI & Technology', 'Cooking Tips', 'Recipe Ideas', 'Food Photography', 'Nutrition', 'Sustainability', 'Global Cuisine'].map((category, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">Stay Updated</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Subscribe to our newsletter to get the latest cooking tips, AI insights, and recipe inspiration delivered straight to your inbox.
                  </p>
                  <div className="flex gap-2">
                    <input 
                      type="email" 
                      placeholder="Enter your email"
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800"
                    />
                    <Button className="bg-gradient-to-r from-orange-500 to-sky-500 hover:from-orange-600 hover:to-sky-600">
                      Subscribe
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <Button 
                onClick={() => setShowBlogModal(false)}
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-orange-500 to-sky-500 hover:from-orange-600 hover:to-sky-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default LandingPage
