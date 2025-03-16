import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/forgot-password']
  
  // If not authenticated and trying to access a protected route
  if (!authStore.authenticated && !publicRoutes.includes(to.path)) {
    return navigateTo('/login')
  }
  
  // If authenticated and trying to access login page
  if (authStore.authenticated && to.path === '/login') {
    return navigateTo('/dashboard')
  }
  
  // Check if user is admin for admin-only routes
  if (authStore.authenticated && to.meta.requiresAdmin && !authStore.user?.is_superuser) {
    return navigateTo('/dashboard')
  }
})