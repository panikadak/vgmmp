'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

export function WalletErrorHandler() {
  const [showExtensionWarning, setShowExtensionWarning] = useState(false)

  useEffect(() => {
    let errorCount = 0
    const maxErrors = 3
    const timeWindow = 10000 // 10 seconds

    const handleExtensionError = (error: ErrorEvent) => {
      // Check if it's a Chrome extension error
      if (error.message?.includes('chrome.runtime.sendMessage') || 
          error.filename?.includes('chrome-extension://')) {
        
        errorCount++
        
        // Show warning if multiple extension errors occur
        if (errorCount >= maxErrors && !showExtensionWarning) {
          setShowExtensionWarning(true)
        }
        
        // Reset error count after time window
        setTimeout(() => {
          errorCount = Math.max(0, errorCount - 1)
        }, timeWindow)
        
        // Prevent the error from propagating
        error.preventDefault()
        return false
      }
    }

    window.addEventListener('error', handleExtensionError)
    
    return () => {
      window.removeEventListener('error', handleExtensionError)
    }
  }, [showExtensionWarning])

  if (!showExtensionWarning) return null

  return (
    <div className="fixed top-4 right-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 max-w-sm shadow-lg z-50">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-yellow-200 mb-1">
            Extension Conflict Detected
          </h4>
          <p className="text-xs text-yellow-300/80">
            Multiple wallet extensions may be causing conflicts. Try disabling unused wallet extensions for the best experience.
          </p>
        </div>
        <button
          onClick={() => setShowExtensionWarning(false)}
          className="text-yellow-400 hover:text-yellow-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
} 