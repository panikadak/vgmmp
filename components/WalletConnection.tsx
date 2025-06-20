import React, { useEffect } from 'react';

useEffect(() => {
  // Add error handler for extension conflicts
  const handleExtensionError = (error: ErrorEvent) => {
    // Suppress Chrome extension errors that don't affect our app
    if (error.message?.includes('chrome.runtime.sendMessage') || 
        error.filename?.includes('chrome-extension://')) {
      console.warn('Browser extension error (safe to ignore):', error.message);
      error.preventDefault();
      return false;
    }
  };

  window.addEventListener('error', handleExtensionError);
  
  return () => {
    window.removeEventListener('error', handleExtensionError);
  };
}, []); 