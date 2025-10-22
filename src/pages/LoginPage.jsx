import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ChefHat, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Chrome,
  ArrowLeft,
  Sparkles,
  Shield,
  Zap,
  Users,
  X,
  FileText,
  ShieldCheck
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })

  const { signIn, signUp, signInWithGoogle, resetPassword, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password)
        if (error) {
          toast.error(error.message)
        } else {
          toast.success('Welcome back!')
          navigate('/dashboard')
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, {
          name: formData.name
        })
        if (error) {
          toast.error(error.message)
        } else {
          toast.success('Account created! Please check your email to verify.')
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        toast.error(error.message)
      }
    } catch (error) {
      toast.error('Failed to sign in with Google')
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setFormData({ email: '', password: '', name: '' })
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!forgotPasswordEmail) {
      toast.error('Please enter your email address')
      return
    }

    setForgotPasswordLoading(true)
    try {
      const { error } = await resetPassword(forgotPasswordEmail)
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Password reset email sent! Check your inbox.')
        setShowForgotPasswordModal(false)
        setForgotPasswordEmail('')
      }
    } catch (error) {
      toast.error('Failed to send reset email')
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Modern Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-sky-50 to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-orange-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-sky-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg text-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-8"
            >
              <div className="w-24 h-24 gradient-orange rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <ChefHat className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-sky-600 bg-clip-text text-transparent mb-4">
                Welcome to BiteQube
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
               Snap. Identify. Cook. From "What's for dinner?" to "Wow, that's good!" — cooking just got effortless. ❤️ Join thousands of home chefs already cooking smarter.
              </p>
            </motion.div>

            {/* Feature Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="space-y-4"
            >
              {[
                { icon: Sparkles, text: "AI-Powered Food Recognition" },
                { icon: Shield, text: "Secure & Private" },
                { icon: Users, text: "Join 10,000+ Happy Chefs" }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center space-x-3 text-left"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-sky-500 rounded-xl flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-muted-foreground">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8 lg:hidden"
            >
              <Link to="/" className="inline-flex items-center space-x-2">
                <div className="w-12 h-12 gradient-orange rounded-xl flex items-center justify-center shadow-lg">
                  <ChefHat className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-bold">BiteQube</span>
              </Link>
            </motion.div>

            {/* Modern Auth Card */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="text-center pb-8 pt-8">
                  <div className="flex items-center justify-between mb-6">
                    <Link to="/">
                      <Button variant="ghost" size="sm" className="hover:bg-orange-50 dark:hover:bg-orange-950 rounded-xl">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                      </Button>
                    </Link>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-sky-600 bg-clip-text text-transparent mb-2">
                      {isLogin ? 'Welcome Back!' : 'Join BiteQube'}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {isLogin 
                        ? 'Sign in to continue your culinary journey' 
                        : 'Create your account and start cooking smarter'
                      }
                    </CardDescription>
                  </motion.div>
                </CardHeader>

                <CardContent className="space-y-6 px-8 pb-8">
                  {/* Enhanced Google Sign In */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full h-12 rounded-xl border-2 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all duration-300"
                      onClick={handleGoogleSignIn}
                    >
                      <Chrome className="w-5 h-5 mr-3" />
                      Continue with Google
                    </Button>
                  </motion.div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-gray-900 px-4 text-muted-foreground font-medium">
                        Or continue with email
                      </span>
                    </div>
                  </div>

                  {/* Enhanced Form */}
                  <motion.form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="relative group">
                          <Input
                            name="name"
                            type="text"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required={!isLogin}
                            className="pl-12 h-12 rounded-xl border-2 focus:border-orange-400 transition-all duration-300"
                          />
                          <ChefHat className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-orange-500 transition-colors" />
                        </div>
                      </motion.div>
                    )}

                    <div className="relative group">
                      <Input
                        name="email"
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="pl-12 h-12 rounded-xl border-2 focus:border-orange-400 transition-all duration-300"
                      />
                      <Mail className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-orange-500 transition-colors" />
                    </div>

                    <div className="relative group">
                      <Input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="pl-12 pr-12 h-12 rounded-xl border-2 focus:border-orange-400 transition-all duration-300"
                      />
                      <Lock className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-orange-500 transition-colors" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3.5 text-muted-foreground hover:text-orange-500 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-sky-500 hover:from-orange-600 hover:to-sky-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            {isLogin ? 'Signing In...' : 'Creating Account...'}
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Zap className="w-5 h-5 mr-2" />
                            {isLogin ? 'Sign In' : 'Create Account'}
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  </motion.form>

                  {/* Enhanced Toggle Mode */}
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <p className="text-sm text-muted-foreground">
                      {isLogin ? "Don't have an account?" : "Already have an account?"}
                      <button
                        onClick={toggleMode}
                        className="ml-2 text-orange-600 hover:text-orange-700 font-semibold hover:underline transition-all duration-200"
                      >
                        {isLogin ? 'Sign up for free' : 'Sign in here'}
                      </button>
                    </p>
                  </motion.div>

                  {/* Forgot Password */}
                  {isLogin && (
                    <motion.div
                      className="text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      <button 
                        onClick={() => setShowForgotPasswordModal(true)}
                        className="text-sm text-muted-foreground hover:text-orange-600 transition-colors"
                      >
                        Forgot your password?
                      </button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center mt-8 text-sm text-muted-foreground"
            >
              <p className="mb-2">
                By continuing, you agree to our{' '}
                <button 
                  onClick={() => setShowTermsModal(true)}
                  className="text-orange-600 hover:text-orange-700 hover:underline transition-all cursor-pointer"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button 
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-orange-600 hover:text-orange-700 hover:underline transition-all cursor-pointer"
                >
                  Privacy Policy
                </button>
              </p>
              <p className="text-xs opacity-75">
                Secure authentication powered by Supabase
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-sky-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Terms of Service</h2>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-lg font-semibold mb-4">1. Acceptance of Terms</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  By accessing and using BiteQube, you accept and agree to be bound by the terms and provision of this agreement.
                </p>

                <h3 className="text-lg font-semibold mb-4">2. Use License</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  Permission is granted to temporarily download one copy of BiteQube per device for personal, non-commercial transitory viewing only.
                </p>

                <h3 className="text-lg font-semibold mb-4">3. User Account</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  You are responsible for safeguarding the password and for all activities that occur under your account.
                </p>

                <h3 className="text-lg font-semibold mb-4">4. Food Recognition Service</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  BiteQube provides AI-powered food recognition and recipe suggestions. Results are for informational purposes only and should not replace professional dietary advice.
                </p>

                <h3 className="text-lg font-semibold mb-4">5. Privacy</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service.
                </p>

                <h3 className="text-lg font-semibold mb-4">6. Prohibited Uses</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  You may not use our service for any illegal or unauthorized purpose nor may you, in the use of the service, violate any laws.
                </p>

                <h3 className="text-lg font-semibold mb-4">7. Disclaimer</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  The information on this app is provided on an "as is" basis. To the fullest extent permitted by law, BiteQube excludes all representations, warranties, conditions and terms.
                </p>

                <h3 className="text-lg font-semibold mb-4">8. Contact Information</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  If you have any questions about these Terms of Service, please contact us through the app's support section.
                </p>
              </div>
            </div>
            
            <div className="flex-shrink-0 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <Button 
                onClick={() => setShowTermsModal(false)}
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-orange-500 to-sky-500 hover:from-orange-600 hover:to-sky-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                I Understand
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-sky-500 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Privacy Policy</h2>
              </div>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-lg font-semibold mb-4">Information We Collect</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  We collect information you provide directly to us, such as when you create an account, use our food scanning features, or contact us for support.
                </p>

                <h3 className="text-lg font-semibold mb-4">How We Use Your Information</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  We use the information we collect to provide, maintain, and improve our services, including food recognition, recipe suggestions, and personalized recommendations.
                </p>

                <h3 className="text-lg font-semibold mb-4">Image Processing</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  Food images you upload are processed using AI technology to identify food items and suggest recipes. Images are not stored permanently on our servers.
                </p>

                <h3 className="text-lg font-semibold mb-4">Data Security</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>

                <h3 className="text-lg font-semibold mb-4">Third-Party Services</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  We use Supabase for authentication and data storage, and various APIs for recipe data. These services have their own privacy policies.
                </p>

                <h3 className="text-lg font-semibold mb-4">Cookies and Analytics</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  We may use cookies and similar technologies to enhance your experience and analyze app usage patterns.
                </p>

                <h3 className="text-lg font-semibold mb-4">Your Rights</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  You have the right to access, update, or delete your personal information. You can do this through your account settings or by contacting us.
                </p>

                <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  If you have any questions about this Privacy Policy, please contact us through the app's support section.
                </p>
              </div>
            </div>
            
            <div className="flex-shrink-0 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <Button 
                onClick={() => setShowPrivacyModal(false)}
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-orange-500 to-sky-500 hover:from-orange-600 hover:to-sky-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                I Understand
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-sky-500 rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold">Reset Password</h2>
              </div>
              <button
                onClick={() => {
                  setShowForgotPasswordModal(false)
                  setForgotPasswordEmail('')
                }}
                className="w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="relative group">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    required
                    className="pl-12 h-12 rounded-xl border-2 focus:border-orange-400 transition-all duration-300"
                  />
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-orange-500 transition-colors" />
                </div>
                
                <div className="flex space-x-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForgotPasswordModal(false)
                      setForgotPasswordEmail('')
                    }}
                    className="flex-1 h-12 rounded-xl border-2 hover:border-gray-300 transition-all duration-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={forgotPasswordLoading}
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-sky-500 hover:from-orange-600 hover:to-sky-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {forgotPasswordLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending...
                      </div>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default LoginPage
