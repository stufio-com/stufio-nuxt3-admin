import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

// Interface definitions for type safety
interface User {
  id?: string
  email?: string
  full_name: string
  email_validated: boolean
  is_superuser: boolean
  is_active: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  authenticated: boolean
  loading: boolean
  error: string | null
  lastTokenCheck: number
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    // Use vueuse's persistent storage for token and user data
    user: useStorage('stufio-admin-user', null),
    token: useStorage('stufio-admin-token', null),
    refreshToken: useStorage('stufio-admin-refresh-token', null),
    authenticated: false,
    loading: false,
    error: null,
    lastTokenCheck: 0
  }),

  actions: {
    /**
     * Initialize auth state by checking token validity
     */
    async init() {
      // If token exists and we haven't checked recently, validate it
      if (this.token && Date.now() - this.lastTokenCheck > 5000) {
        try {
          await this.loadUser()
          this.lastTokenCheck = Date.now()
        } catch (err: any) {
          // If loading fails due to auth errors, clear token
          if (err?.status === 401 || err?.status === 403) {
            this.logout()
          }
        }
      }
    },

    /**
     * Authenticate user with email and password
     */
    async login({ email, password }: { email: string; password: string }) {
      this.loading = true
      this.error = null
      
      try {
        // Use the open-fetch client to call the OAuth endpoint
        const { data, error } = await useApi('/api/v1/login/oauth', {
          method: 'POST',
          body: new URLSearchParams({
            grant_type: 'password',
            username: email,
            password: password,
            scope: 'admin'
          }),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
        
        if (error.value) {
          throw new Error(error.value?.data?.detail || error.value.message || 'Authentication failed')
        }
        
        if (data.value) {
          this.token = data.value.access_token
          this.refreshToken = data.value.refresh_token || null
          this.authenticated = true
          
          // Load user data
          await this.loadUser()
        }
        
        return this.authenticated
      } catch (err: any) {
        this.error = err.message || 'Authentication failed'
        return false
      } finally {
        this.loading = false
      }
    },
    
    /**
     * Load user data from API
     */
    async loadUser() {
      if (!this.token) {
        this.authenticated = false
        return
      }
      
      try {
        const { data, error } = await useApi('/api/v1/users/', {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })
        
        if (error.value) {
          throw new Error(error.value?.data?.detail || error.value.message || 'Failed to load user data')
        }
        
        if (data.value) {
          // Check if user has admin privileges
          if (!data.value.is_superuser) {
            throw new Error('Insufficient permissions for admin access')
          }
          
          this.user = data.value
          this.authenticated = true
        }
      } catch (err: any) {
        this.error = err.message
        this.authenticated = false
        this.token = null
        this.refreshToken = null
        this.user = null
      }
    },
    
    /**
     * Refresh the access token using refresh token
     */
    async refreshAccessToken(): Promise<boolean> {
      if (!this.refreshToken) return false
      
      try {
        const { data, error } = await useApi('/api/v1/login/refresh', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.refreshToken}`
          }
        })
        
        if (error.value) {
          throw new Error(error.value?.data?.detail || error.value.message || 'Token refresh failed')
        }
        
        if (data.value?.access_token) {
          this.token = data.value.access_token
          this.refreshToken = data.value.refresh_token || this.refreshToken
          this.authenticated = true
          return true
        }
        
        return false
      } catch (err) {
        this.logout()
        return false
      }
    },
    
    /**
     * Log out the current user
     */
    logout() {
      // Optionally call an API endpoint to invalidate the token
      if (this.token) {
        // Fire and forget - don't wait for response
        useApi('/api/v1/login/revoke', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        }).catch(() => {})
      }
      
      // Reset state
      this.token = null
      this.refreshToken = null
      this.user = null
      this.authenticated = false
      this.error = null
      
      // Navigate to login page
      navigateTo('/login')
    },
    
    /**
     * Request password reset email
     */
    async requestPasswordReset(email: string): Promise<string> {
      this.loading = true
      this.error = null
      
      try {
        const { data, error } = await useApi(`/api/v1/login/recover/${encodeURIComponent(email)}`, {
          method: 'POST'
        })
        
        if (error.value) {
          throw new Error(error.value?.data?.detail || error.value.message || 'Failed to send reset email')
        }
        
        return data.value?.msg || 'Password reset email sent'
      } catch (err: any) {
        this.error = err.message || 'Failed to send reset email'
        throw err
      } finally {
        this.loading = false
      }
    },
    
    /**
     * Reset password with token
     */
    async resetPassword({ claim, password }: { claim: string, password: string }): Promise<string> {
      this.loading = true
      this.error = null
      
      try {
        const { data, error } = await useApi('/api/v1/login/reset', {
          method: 'POST',
          body: {
            claim,
            new_password: password
          }
        })
        
        if (error.value) {
          throw new Error(error.value?.data?.detail || error.value.message || 'Password reset failed')
        }
        
        return data.value?.msg || 'Password reset successful'
      } catch (err: any) {
        this.error = err.message || 'Password reset failed'
        throw err
      } finally {
        this.loading = false
      }
    }
  }
})