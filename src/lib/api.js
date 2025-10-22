// TheMealDB API functions
export const mealAPI = {
  async searchByName(name) {
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(name)}`)
      const data = await response.json()
      return data.meals || []
    } catch (error) {
      console.error('Error searching meals:', error)
      return []
    }
  },

  async getRandomMeals(count = 6) {
    try {
      const meals = []
      for (let i = 0; i < count; i++) {
        const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php')
        const data = await response.json()
        if (data.meals && data.meals[0]) {
          meals.push(data.meals[0])
        }
      }
      return meals
    } catch (error) {
      console.error('Error fetching random meals:', error)
      return []
    }
  },

  async getMealById(id) {
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
      const data = await response.json()
      return data.meals ? data.meals[0] : null
    } catch (error) {
      console.error('Error fetching meal by ID:', error)
      return null
    }
  },

  async searchByCategory(category) {
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`)
      const data = await response.json()
      return data.meals || []
    } catch (error) {
      console.error('Error searching by category:', error)
      return []
    }
  }
}

// Hugging Face API for food image classification
export const imageAPI = {
  async classifyImage(imageFile) {
    const HF_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY
    
    // Fallback to demo mode if no API key
    if (!HF_API_KEY || HF_API_KEY === 'your_huggingface_api_key_here') {
      console.warn('Hugging Face API key not configured, using demo mode')
      const foodItems = [
        'pasta', 'salad', 'chicken', 'pizza', 'stir-fry', 
        'burger', 'tacos', 'cake', 'smoothie', 'pancakes',
        'sushi', 'curry', 'sandwich', 'soup', 'noodles'
      ]
      
      const randomItem = foodItems[Math.floor(Math.random() * foodItems.length)]
      const confidence = Math.random() * 0.3 + 0.7
      
      return [{
        label: randomItem,
        score: confidence
      }]
    }

    try {
      // Convert image file to base64
      const imageData = await this.fileToBase64(imageFile)
      
      // Use Hugging Face's food classification model
      const response = await fetch(
        'https://api-inference.huggingface.co/models/nateraw/food',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: imageData
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.status}`)
      }

      const result = await response.json()
      
      // Return top 3 predictions
      if (Array.isArray(result) && result.length > 0) {
        return result.slice(0, 3).map(item => ({
          label: item.label.replace(/_/g, ' '),
          score: item.score
        }))
      }
      
      throw new Error('No classification results')
    } catch (error) {
      console.error('Hugging Face API error:', error)
      
      // Fallback to demo mode on error
      const foodItems = [
        'pasta', 'salad', 'chicken', 'pizza', 'stir-fry', 
        'burger', 'tacos', 'cake', 'smoothie', 'pancakes'
      ]
      
      const randomItem = foodItems[Math.floor(Math.random() * foodItems.length)]
      
      return [{
        label: randomItem,
        score: 0.85
      }]
    }
  },

  // Helper function to convert file to base64
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
}

// Enhanced Chatbase API integration with multilingual support
export const chatbaseAPI = {
  // Detect language from user message
  detectLanguage(message) {
    const languagePatterns = {
      'es': /\b(hola|gracias|por favor|ayuda|receta|comida)\b/i,
      'fr': /\b(bonjour|merci|s'il vous plaît|aide|recette|nourriture)\b/i,
      'de': /\b(hallo|danke|bitte|hilfe|rezept|essen)\b/i,
      'it': /\b(ciao|grazie|per favore|aiuto|ricetta|cibo)\b/i,
      'pt': /\b(olá|obrigado|por favor|ajuda|receita|comida)\b/i,
      'hi': /[\u0900-\u097F]/,
      'mr': /\b(नमस्कार|धन्यवाद|कृपया|मदत|रेसिपी|अन्न|खाणे)\b|[\u0900-\u097F]/,
      'zh': /[\u4e00-\u9fff]/,
      'ja': /[\u3040-\u309f\u30a0-\u30ff]/,
      'ar': /[\u0600-\u06ff]/
    }
    
    for (const [lang, pattern] of Object.entries(languagePatterns)) {
      if (pattern.test(message)) {
        return lang
      }
    }
    return 'en' // Default to English
  },

  async sendMessage(message, conversationId = null) {
    const apiKey = import.meta.env.VITE_CHATBASE_API_KEY
    const chatbotId = import.meta.env.VITE_CHATBASE_CHATBOT_ID
    
    if (!apiKey || !chatbotId || apiKey === 'your_chatbase_api_key') {
      console.warn('Chatbase not configured, using demo mode')
      
      // Detect language and provide appropriate demo response
      const detectedLang = this.detectLanguage(message)
      const demoResponses = {
        'en': "Hello! I'm your BiteQube assistant. I can help you with food scanning, recipes, and cooking questions. What would you like to know?",
        'es': "¡Hola! Soy tu asistente de BiteQube. Puedo ayudarte con escaneo de comida, recetas y preguntas de cocina. ¿Qué te gustaría saber?",
        'fr': "Bonjour! Je suis votre assistant BiteQube. Je peux vous aider avec le scan de nourriture, les recettes et les questions de cuisine. Que voulez-vous savoir?",
        'de': "Hallo! Ich bin Ihr BiteQube-Assistent. Ich kann Ihnen beim Scannen von Lebensmitteln, Rezepten und Kochfragen helfen. Was möchten Sie wissen?",
        'it': "Ciao! Sono il tuo assistente BiteQube. Posso aiutarti con la scansione del cibo, ricette e domande di cucina. Cosa vorresti sapere?",
        'pt': "Olá! Sou seu assistente BiteQube. Posso ajudá-lo com digitalização de alimentos, receitas e questões culinárias. O que você gostaria de saber?",
        'hi': "नमस्ते! मैं आपका BiteQube सहायक हूं। मैं खाना स्कैन करने, रेसिपी और खाना पकाने के सवालों में आपकी मदद कर सकता हूं। आप क्या जानना चाहेंगे?",
        'mr': "नमस्कार! मी तुमचा BiteQube सहाय्यक आहे। मी अन्न स्कॅन करणे, रेसिपी आणि स्वयंपाकाच्या प्रश्नांमध्ये तुम्हाला मदत करू शकतो। तुम्हाला काय जाणून घ्यायचे आहे?",
        'zh': "你好！我是您的 BiteQube 助手。我可以帮助您进行食物扫描、食谱和烹饪问题。您想了解什么？",
        'ja': "こんにちは！私はあなたのBiteQubeアシスタントです。食べ物のスキャン、レシピ、料理の質問でお手伝いできます。何を知りたいですか？",
        'ar': "مرحباً! أنا مساعد BiteQube الخاص بك. يمكنني مساعدتك في مسح الطعام والوصفات وأسئلة الطبخ. ماذا تريد أن تعرف؟"
      }
      
      return {
        text: demoResponses[detectedLang] || demoResponses['en'],
        conversationId: 'demo-conversation'
      }
    }

    try {
      // Detect user's language
      const detectedLang = this.detectLanguage(message)
      
      // Enhanced message with context and language preference
      const enhancedMessage = `[Language: ${detectedLang}] [App: BiteQube] ${message}`
      
      // Chatbase API call with proper format
      const response = await fetch(`https://www.chatbase.co/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              content: enhancedMessage,
              role: 'user'
            }
          ],
          chatbotId: chatbotId,
          stream: false,
          temperature: 0.7,
          model: 'gpt-3.5-turbo',
          ...(conversationId && { conversationId })
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Chatbase API Error:', response.status, errorData)
        throw new Error(`Chatbase API error: ${response.status}`)
      }

      const data = await response.json()
      
      // Extract response text from various possible fields
      let responseText = data.text || data.response || data.message || data.content
      
      // If response is in an array or nested object
      if (!responseText && data.choices && data.choices[0]) {
        responseText = data.choices[0].message?.content || data.choices[0].text
      }
      
      // Fallback if no response found
      if (!responseText) {
        responseText = "I'm here to help with your BiteQube questions! Please try asking again."
      }
      
      return {
        text: responseText,
        conversationId: data.conversationId || data.conversation_id || conversationId || 'new-conversation'
      }
    } catch (error) {
      console.error('Chatbase API error:', error)
      
      // Language-aware fallback responses
      const detectedLang = this.detectLanguage(message)
      const fallbackResponses = {
        'en': [
          "I'm here to help with BiteQube! Ask me about food scanning, recipes, or cooking tips.",
          "How can I assist you with BiteQube today? I can help with recipes, food recognition, or app features.",
          "I'm your BiteQube assistant. What would you like to know about our app?"
        ],
        'es': [
          "¡Estoy aquí para ayudar con BiteQube! Pregúntame sobre escaneo de comida, recetas o consejos de cocina.",
          "¿Cómo puedo ayudarte con BiteQube hoy? Puedo ayudar con recetas, reconocimiento de comida o funciones de la app.",
          "Soy tu asistente de BiteQube. ¿Qué te gustaría saber sobre nuestra app?"
        ],
        'fr': [
          "Je suis là pour aider avec BiteQube! Demandez-moi des informations sur le scan de nourriture, les recettes ou les conseils de cuisine.",
          "Comment puis-je vous aider avec BiteQube aujourd'hui? Je peux aider avec les recettes, la reconnaissance alimentaire ou les fonctionnalités de l'app.",
          "Je suis votre assistant BiteQube. Que voulez-vous savoir sur notre app?"
        ],
        'mr': [
          "मी BiteQube साठी मदत करण्यासाठी येथे आहे! अन्न स्कॅनिंग, रेसिपी किंवा स्वयंपाकाच्या टिप्सबद्दल मला विचारा.",
          "आज मी BiteQube मध्ये तुम्हाला कशी मदत करू शकतो? मी रेसिपी, अन्न ओळख किंवा अॅप वैशिष्ट्यांमध्ये मदत करू शकतो.",
          "मी तुमचा BiteQube सहाय्यक आहे. आमच्या अॅपबद्दल तुम्हाला काय जाणून घ्यायचे आहे?"
        ]
      }
      
      const responses = fallbackResponses[detectedLang] || fallbackResponses['en']
      
      return {
        text: responses[Math.floor(Math.random() * responses.length)],
        conversationId: conversationId || 'fallback-conversation'
      }
    }
  }
}

// Voice recognition helper
export const voiceAPI = {
  startListening(onResult, onError) {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      onError('Speech recognition not supported')
      return null
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      onResult(transcript)
    }

    recognition.onerror = (event) => {
      onError(event.error)
    }

    recognition.start()
    return recognition
  }
}
