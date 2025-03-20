export default defineNuxtRouteMiddleware((to) => {
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/forgot-password', '/reset-password', '/magic-login'];
  
  // Skip auth check during SSR for non-public routes
  // The auth plugin will handle the check after hydration
  if (process.server && !publicRoutes.includes(to.path)) {
    return;
  }
  
  // Get auth store - only reliable on client side
  const authStore = useClientAuth();
  
  // If not authenticated and trying to access a protected route
  if (!authStore.authenticated && !publicRoutes.includes(to.path)) {
    return navigateTo('/login');
  }
  
  // If authenticated and trying to access login page
  if (authStore.authenticated && to.path === '/login') {
    return navigateTo('/dashboard');
  }
  
  // Check if user is admin for admin-only routes
  if (authStore.authenticated && to.meta.requiresAdmin && !authStore.user?.is_superuser) {
    return navigateTo('/dashboard');
  }
});