import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore()
  
  // Initialize auth on app startup
  await authStore.init()
  
  // Add global error handler for auth errors
  nuxtApp.hook('app:error', (error: any) => {
    // Handle auth errors globally
    if (error?.statusCode === 401 || error?.statusCode === 403) {
      console.warn('Authentication error detected:', error.statusCode)
      authStore.logout()
    }
  })
  
  // Check auth state on page navigation
  nuxtApp.hook('page:start', () => {
    if (authStore.token) {
      // Verify token periodically
      const now = Date.now()
      if (now - authStore.lastTokenCheck > 60000) { // Check once per minute
        authStore.init().catch(() => {}) // Catch errors to avoid breaking navigation
      }
    }
  })

  // Add auth interceptor for $api if it exists
  try {
    const { $api } = useNuxtApp()
    
    if ($api && $api.interceptors) {
      $api.interceptors.response.use(
        (response) => response,
        async (error) => {
          console.log("API Error:", error)
          // Handle token refresh for 401 errors
          // Safely access response property with optional chaining
          if (error?.response?.status === 401 && authStore.refreshToken) {
            // Only try refresh if we have config to retry
            if (error.config) {
              const originalRequest = error.config
              
              // Only try once to prevent infinite loops
              if (!originalRequest._retry) {
                originalRequest._retry = true
                
                try {
                  // Try to refresh the token
                  const refreshSuccess = await authStore.refreshAccessToken()
                  
                  if (refreshSuccess) {
                    // Retry the original request with new token
                    originalRequest.headers = originalRequest.headers || {}
                    originalRequest.headers.Authorization = `Bearer ${authStore.token}`
                    return $api(originalRequest)
                  }
                } catch (refreshError) {
                  console.error("Error refreshing token:", refreshError)
                  authStore.logout()
                }
              }
            }
          }
          
          // For all other errors, just pass them through
          return Promise.reject(error)
        }
      )
    }
  } catch (err) {
    console.warn("Could not setup API interceptors:", err)
  }
})