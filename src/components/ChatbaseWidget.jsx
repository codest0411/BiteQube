import React, { useEffect } from 'react'

const ChatbaseWidget = () => {
  useEffect(() => {
    // Get chatbot ID from environment
    const chatbotId = import.meta.env.VITE_CHATBASE_CHATBOT_ID
    
    // Don't load if chatbot ID is not configured
    if (!chatbotId || chatbotId === 'your_chatbase_chatbot_id') {
      console.warn('Chatbase chatbot ID not configured. Widget will not load.')
      return
    }
    
    // Configure Chatbase BEFORE loading the script
    window.embeddedChatbotConfig = {
      chatbotId: chatbotId,
      domain: "www.chatbase.co"
    }
    
    // Load Chatbase widget script
    const script = document.createElement('script')
    script.src = 'https://www.chatbase.co/embed.min.js'
    script.defer = true
    
    document.body.appendChild(script)

    // Cleanup function
    return () => {
      // Remove script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
      
      // Remove Chatbase elements
      const chatbaseFrame = document.querySelector('#chatbase-bubble-button')
      const chatbaseWidget = document.querySelector('#chatbase-bubble-window')
      if (chatbaseFrame) chatbaseFrame.remove()
      if (chatbaseWidget) chatbaseWidget.remove()
    }
  }, [])

  // Add custom styles and fix close button functionality
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      /* Ensure Chatbase widget is visible and comfortable */
      #chatbase-bubble-button {
        bottom: 24px !important;
        right: 24px !important;
        z-index: 9999 !important;
        width: 60px !important;
        height: 60px !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
        cursor: pointer !important;
      }
      
      #chatbase-bubble-window {
        bottom: 100px !important;
        right: 24px !important;
        z-index: 9999 !important;
        width: 380px !important;
        max-width: calc(100vw - 48px) !important;
        height: 600px !important;
        max-height: calc(100vh - 140px) !important;
        border-radius: 16px !important;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15) !important;
        border: 1px solid rgba(0, 0, 0, 0.08) !important;
      }
      
      /* Fix close button and header interactions */
      #chatbase-bubble-window iframe {
        border-radius: 16px !important;
      }
      
      /* Ensure all clickable elements work properly */
      #chatbase-bubble-button,
      #chatbase-bubble-window,
      #chatbase-bubble-window * {
        pointer-events: auto !important;
      }
      
      /* Fix close icon specifically */
      #closeIcon,
      #closeIcon *,
      [id*="close"],
      [class*="close"],
      button[aria-label*="close" i],
      button[title*="close" i] {
        cursor: pointer !important;
        pointer-events: auto !important;
        z-index: 10000 !important;
      }
      
      /* Make sure close button parent is clickable */
      #chatbase-bubble-window button:has(#closeIcon),
      #chatbase-bubble-window div:has(#closeIcon) {
        cursor: pointer !important;
        pointer-events: auto !important;
        z-index: 10000 !important;
      }
      
      /* Force states when closed */
      #chatbase-bubble-window.chatbase-closed {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
      
      #chatbase-bubble-button.chatbase-show {
        display: flex !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
      }
      
      /* Mobile responsive adjustments */
      @media (max-width: 640px) {
        #chatbase-bubble-window {
          width: calc(100vw - 32px) !important;
          height: calc(100vh - 120px) !important;
          bottom: 80px !important;
          right: 16px !important;
        }
        
        #chatbase-bubble-button {
          bottom: 16px !important;
          right: 16px !important;
          width: 56px !important;
          height: 56px !important;
        }
      }
      
      /* Ensure widget stays above other content */
      #chatbase-bubble-button,
      #chatbase-bubble-window {
        position: fixed !important;
      }
    `
    
    document.head.appendChild(style)
    
    // Global click handler to intercept close button clicks
    const handleGlobalClick = (e) => {
      const chatbaseWindow = document.querySelector('#chatbase-bubble-window')
      const chatbaseButton = document.querySelector('#chatbase-bubble-button')
      if (!chatbaseWindow) return
      
      // Check if click is on or near the close icon
      const target = e.target
      const closeIcon = chatbaseWindow.querySelector('#closeIcon')
      
      if (closeIcon && (
        target === closeIcon ||
        target.id === 'closeIcon' ||
        closeIcon.contains(target) ||
        target.closest('#closeIcon')
      )) {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        
        // Add class to force close state
        chatbaseWindow.classList.add('chatbase-closed')
        
        // Add class to force button visible
        if (chatbaseButton) {
          chatbaseButton.classList.add('chatbase-show')
        }
        
        console.log('✅ Chatbase widget closed')
        return false
      }
      
      // Also check if clicking on parent button/div containing closeIcon
      const parentButton = target.closest('button')
      if (parentButton && parentButton.querySelector('#closeIcon')) {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        
        // Add class to force close state
        chatbaseWindow.classList.add('chatbase-closed')
        
        // Add class to force button visible
        if (chatbaseButton) {
          chatbaseButton.classList.add('chatbase-show')
        }
        
        console.log('✅ Chatbase widget closed')
        return false
      }
    }
    
    // Add global click listener
    document.addEventListener('click', handleGlobalClick, true)
    
    // Watch for button clicks to remove closed class when reopening
    const handleButtonClick = () => {
      const chatbaseWindow = document.querySelector('#chatbase-bubble-window')
      const chatbaseButton = document.querySelector('#chatbase-bubble-button')
      
      if (chatbaseButton) {
        chatbaseButton.addEventListener('click', () => {
          setTimeout(() => {
            if (chatbaseWindow) {
              chatbaseWindow.classList.remove('chatbase-closed')
            }
            if (chatbaseButton) {
              chatbaseButton.classList.remove('chatbase-show')
            }
          }, 100)
        })
      }
    }
    
    handleButtonClick()
    setTimeout(handleButtonClick, 1000)
    setTimeout(handleButtonClick, 2000)
    
    // Add event listener to fix close button functionality
    const fixCloseButton = () => {
      const chatbaseWindow = document.querySelector('#chatbase-bubble-window')
      
      if (chatbaseWindow) {
        // Make entire widget clickable
        chatbaseWindow.style.pointerEvents = 'auto'
        
        // Find the close icon
        const closeIcon = chatbaseWindow.querySelector('#closeIcon')
        if (closeIcon) {
          // Style the close icon and parents
          let element = closeIcon
          while (element && element !== chatbaseWindow) {
            element.style.cursor = 'pointer'
            element.style.pointerEvents = 'auto'
            element.style.zIndex = '10000'
            element = element.parentElement
          }
        }
        
        // Find all buttons and check for close icon
        const chatbaseButton = document.querySelector('#chatbase-bubble-button')
        const allButtons = chatbaseWindow.querySelectorAll('button, div[role="button"]')
        allButtons.forEach(button => {
          if (button.querySelector('#closeIcon') || button.querySelector('svg')) {
            button.style.cursor = 'pointer'
            button.style.pointerEvents = 'auto'
            button.onclick = (e) => {
              e.preventDefault()
              e.stopPropagation()
              e.stopImmediatePropagation()
              
              // Add class to force close state
              chatbaseWindow.classList.add('chatbase-closed')
              
              // Add class to force button visible
              if (chatbaseButton) {
                chatbaseButton.classList.add('chatbase-show')
              }
              
              console.log('✅ Closed via button onclick')
              return false
            }
          }
        })
      }
    }
    
    // Run fix immediately and repeatedly
    fixCloseButton()
    const timeoutId1 = setTimeout(fixCloseButton, 500)
    const timeoutId2 = setTimeout(fixCloseButton, 1000)
    const timeoutId3 = setTimeout(fixCloseButton, 2000)
    
    // Also run on interval to catch dynamically added elements
    const intervalId = setInterval(fixCloseButton, 2000)
    
    // Add mutation observer to detect when chat window appears
    const observer = new MutationObserver(() => {
      const chatbaseWindow = document.querySelector('#chatbase-bubble-window')
      if (chatbaseWindow && chatbaseWindow.style.display !== 'none') {
        fixCloseButton()
      }
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style']
    })
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
      document.removeEventListener('click', handleGlobalClick, true)
      clearTimeout(timeoutId1)
      clearTimeout(timeoutId2)
      clearTimeout(timeoutId3)
      clearInterval(intervalId)
      observer.disconnect()
    }
  }, [])

  // This component doesn't render anything visible - the widget is injected by Chatbase
  return null
}

export default ChatbaseWidget
