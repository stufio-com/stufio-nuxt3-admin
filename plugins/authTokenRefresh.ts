export default defineNuxtPlugin(async (nuxtApp) => {
  // Skip on server
  if (process.server) return
  
  // Initialize auth store and activity tracker
  const authStore = useClientAuth()
  const { isActive, checkActivity, updateActivity } = useActivityTracker()
  const dialog = useDialog()
  
  // Constants for token refresh
  const REFRESH_INTERVAL = 4 * 60 * 1000 // 4 minutes (slightly less than 5 min expiry)
  const MAX_REFRESH_ATTEMPTS = 2 // Maximum retry attempts
  const SESSION_WARNING_SECONDS = 15 // Countdown time for session expiry warning
  
  let refreshTimerId: NodeJS.Timeout | null = null
  let failedAttempts = 0
  let isShowingExpiryDialog = false
  let expiryCountdownTimer: NodeJS.Timeout | null = null
  let remainingSeconds = SESSION_WARNING_SECONDS
  
  // Function to show session expiry warning dialog
  const showSessionExpiryDialog = () => {
    if (isShowingExpiryDialog) return // Prevent multiple dialogs
    
    isShowingExpiryDialog = true
    remainingSeconds = SESSION_WARNING_SECONDS
    
    // Start countdown in the dialog
    const updateDialogCountdown = () => {
      // Create new dialog with updated countdown
      dialog.confirm({
        title: "Session Expiring Soon",
        message: `Your session will expire in ${remainingSeconds} seconds due to inactivity. Would you like to stay logged in?`,
        confirmText: "Continue Session",
        cancelText: "Logout",
        variant: "warning",
        onConfirm: () => {
          // User wants to continue, reactivate them
          clearInterval(expiryCountdownTimer!)
          expiryCountdownTimer = null
          isShowingExpiryDialog = false
          updateActivity() // This marks the user as active again
          console.log("User chose to continue session")
          
          // Hide the dialog using the correct method
          dialog.hide()
        },
        onCancel: () => {
          // User chose to logout
          clearInterval(expiryCountdownTimer!)
          expiryCountdownTimer = null
          isShowingExpiryDialog = false
          console.log("User chose to logout")
          
          // Hide the dialog before navigation
          dialog.hide()
          
          // Then logout and navigate
          authStore.logout()
          navigateTo("/login")
        }
      })
      
      // Decrement counter
      remainingSeconds--
      
      // If countdown reaches zero, logout automatically
      if (remainingSeconds < 0) {
        clearInterval(expiryCountdownTimer!)
        expiryCountdownTimer = null
        isShowingExpiryDialog = false
        console.log("Session expired due to inactivity timeout")
        
        // Hide the dialog before logout
        dialog.hide()
        
        // Then logout and navigate
        authStore.logout()
        navigateTo("/login")
      }
    }
    
    // Show initial dialog
    updateDialogCountdown()
    
    // Update countdown every second
    expiryCountdownTimer = setInterval(updateDialogCountdown, 1000)
  }
  
  // Start the refresh cycle
  const startRefreshCycle = () => {
    if (refreshTimerId) {
      clearInterval(refreshTimerId)
    }
    
    refreshTimerId = setInterval(async () => {
      // Only refresh if:
      // 1. User is authenticated
      // 2. User is active
      // 3. We have a refresh token
      if (authStore.authenticated && authStore.refreshToken && checkActivity()) {
        try {
          console.log('Token refresh cycle - attempting refresh')
          const success = await authStore.refreshAccessToken()
          
          if (success) {
            console.log('Token refreshed successfully')
            failedAttempts = 0 // Reset failed attempts
          } else {
            failedAttempts++
            console.warn(`Token refresh failed (attempt ${failedAttempts} of ${MAX_REFRESH_ATTEMPTS})`)
            
            if (failedAttempts >= MAX_REFRESH_ATTEMPTS) {
              console.error('Max refresh attempts reached, logging out')
              authStore.logout()
              stopRefreshCycle()
            }
          }
        } catch (error) {
          failedAttempts++
          console.error('Token refresh error:', error)
          
          if (failedAttempts >= MAX_REFRESH_ATTEMPTS) {
            console.error('Max refresh attempts reached, logging out')
            authStore.logout()
            stopRefreshCycle()
          }
        }
      } else if (!isActive.value && authStore.authenticated && !isShowingExpiryDialog) {
        // If user is inactive but authenticated, show expiry warning
        console.log('User inactive, showing session expiry warning')
        showSessionExpiryDialog()
      }
    }, REFRESH_INTERVAL)
    
    console.log('Token refresh cycle started')
  }
  
  // Stop the refresh cycle
  const stopRefreshCycle = () => {
    if (refreshTimerId) {
      clearInterval(refreshTimerId)
      refreshTimerId = null
      console.log('Token refresh cycle stopped')
    }
    
    // Also clear expiry dialog if it's showing
    if (expiryCountdownTimer) {
      clearInterval(expiryCountdownTimer)
      expiryCountdownTimer = null
      isShowingExpiryDialog = false
    }
  }
  
  // Watch auth state changes to start/stop refresh cycle
  const stopWatcher = watch(
    () => authStore.authenticated,
    (authenticated) => {
      if (authenticated && authStore.token) {
        startRefreshCycle()
      } else {
        stopRefreshCycle()
      }
    },
    { immediate: true }
  )
  
  // Clean up on app unmount
  nuxtApp.hook('app:beforeUnmount', () => {
    stopRefreshCycle()
    stopWatcher()
  })
  
  return {
    provide: {
      startTokenRefresh: startRefreshCycle,
      stopTokenRefresh: stopRefreshCycle
    }
  }
})