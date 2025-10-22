// Chatbase Widget Helper Functions

/**
 * Opens the Chatbase chat widget
 * @param {string} prefilledMessage - Optional message to pre-fill in the chat
 * @returns {boolean} - Whether the widget was successfully opened
 */
export const openChatbaseWidget = (prefilledMessage = '') => {
  const chatbaseButton = document.querySelector('#chatbase-bubble-button')
  
  if (!chatbaseButton) {
    console.warn('Chatbase widget not found. It may still be loading.')
    return false
  }
  
  // Click the button to open the widget
  chatbaseButton.click()
  
  // If there's a pre-filled message, try to set it
  if (prefilledMessage) {
    setTimeout(() => {
      try {
        const chatbaseWindow = document.querySelector('#chatbase-bubble-window')
        if (chatbaseWindow) {
          const iframe = chatbaseWindow.querySelector('iframe')
          if (iframe) {
            try {
              const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
              const input = iframeDoc.querySelector('input[type="text"], textarea, [contenteditable="true"]')
              
              if (input) {
                if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
                  input.value = prefilledMessage
                  input.dispatchEvent(new Event('input', { bubbles: true }))
                  input.dispatchEvent(new Event('change', { bubbles: true }))
                } else if (input.contentEditable === 'true') {
                  input.textContent = prefilledMessage
                  input.dispatchEvent(new Event('input', { bubbles: true }))
                }
              }
            } catch (e) {
              // Cross-origin restriction - this is expected for embedded iframes
              console.log('Could not pre-fill message due to cross-origin restrictions')
            }
          }
        }
      } catch (error) {
        console.error('Error pre-filling Chatbase message:', error)
      }
    }, 500)
  }
  
  return true
}

/**
 * Closes the Chatbase chat widget
 */
export const closeChatbaseWidget = () => {
  const chatbaseWindow = document.querySelector('#chatbase-bubble-window')
  const chatbaseButton = document.querySelector('#chatbase-bubble-button')
  
  if (chatbaseWindow) {
    chatbaseWindow.style.display = 'none'
    chatbaseWindow.style.visibility = 'hidden'
  }
  
  // Show the open button again - force it to show
  if (chatbaseButton) {
    chatbaseButton.style.display = 'block'
    chatbaseButton.style.visibility = 'visible'
    chatbaseButton.style.opacity = '1'
    chatbaseButton.style.pointerEvents = 'auto'
  }
}

/**
 * Checks if Chatbase widget is loaded
 * @returns {boolean}
 */
export const isChatbaseLoaded = () => {
  return !!document.querySelector('#chatbase-bubble-button')
}

/**
 * Waits for Chatbase widget to load
 * @param {number} timeout - Maximum time to wait in milliseconds
 * @returns {Promise<boolean>}
 */
export const waitForChatbase = (timeout = 5000) => {
  return new Promise((resolve) => {
    if (isChatbaseLoaded()) {
      resolve(true)
      return
    }
    
    const startTime = Date.now()
    const checkInterval = setInterval(() => {
      if (isChatbaseLoaded()) {
        clearInterval(checkInterval)
        resolve(true)
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval)
        resolve(false)
      }
    }, 100)
  })
}

/**
 * Opens Chatbase with a recipe-specific message
 * @param {string} recipeName - Name of the recipe
 * @param {string} customMessage - Optional custom message
 */
export const askChefAboutRecipe = (recipeName, customMessage = '') => {
  const message = customMessage || 
    `I'm looking at the recipe for ${recipeName}. Can you help me with cooking tips, ingredient substitutions, or answer any questions about this dish?`
  
  return openChatbaseWidget(message)
}

/**
 * Opens Chatbase with a food scanning question
 * @param {string} foodName - Name of the detected food
 */
export const askChefAboutFood = (foodName) => {
  const message = `I just scanned an image and detected "${foodName}". Can you tell me more about this dish and suggest some recipes?`
  
  return openChatbaseWidget(message)
}

/**
 * Opens Chatbase with a cooking question
 * @param {string} question - The cooking question
 */
export const askChefQuestion = (question) => {
  return openChatbaseWidget(question)
}
