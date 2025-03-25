export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useClientAuth();
  const router = useRouter();

  // Add token expiry validation
  const isTokenExpired = () => {
    if (!authStore.token) return true;
    
    // If token check was too long ago, consider it potentially expired
    return Date.now() - authStore.lastTokenCheck > 5 * 60 * 1000; // 5 minutes
  };

  const redirector = function (url: string) {
    window.location.href = url;
    nuxtApp.hook("app:mounted", () => {
      console.log("App mounted, now redirecting to", url);
      window.location.href = url;
    });
  }
  
  // On server side, set a flag to check auth on client
  if (process.server) {
    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/forgot-password', '/reset-password', '/magic-login'];
    const route = useRoute();
    
    // Only set flag for protected routes
    if (!publicRoutes.includes(route.path)) {
      // Set a cookie flag to indicate we need to check auth on client
      const pendingAuthCheck = useCookie('pending-auth-check', {
        path: '/',
        maxAge: 10 // Short-lived cookie
      });
      pendingAuthCheck.value = 'true';
    }
    
    // Skip initialization on server side
    return;
  }
  
  // Client-side initialization
  const pendingAuthCheck = useCookie('pending-auth-check');
  
  try {
    // Initialize auth on app startup
    await authStore.init();
    // Get current route
    const currentRoute = router.currentRoute.value;
    const publicRoutes = [
      "/login",
      "/forgot-password",
      "/reset-password",
      "/magic-login",
    ];

    // Check if we need to verify auth post-SSR
    if (pendingAuthCheck.value === "true") {
      // Clear the flag
      pendingAuthCheck.value = null;
      // Redirect if needed based on auth state
      if (
        !authStore.authenticated &&
        !publicRoutes.includes(currentRoute.path)
      ) {
        redirector("/login");
      }
    }

    if (authStore.authenticated && publicRoutes.includes(currentRoute.path)) {
      console.log("Scheduling redirect to dashboard...");
      redirector("/dashboard");
    }
  } catch (error) {
    console.error('Auth initialization error:', error);
    
    // If initialization fails on a protected route, redirect to login
    if (pendingAuthCheck.value === 'true') {
      pendingAuthCheck.value = null;
      redirector('/login');
    }
  }
  
  // Add global error handler for auth errors
  nuxtApp.hook('app:error', (error: any) => {
    // Handle auth errors globally
    if (error?.statusCode === 401 || error?.statusCode === 403) {
      console.warn('Authentication error detected:', error.statusCode);
      
      // Try refresh token before logout on 401
      if (error?.statusCode === 401 && authStore.refreshToken) {
        console.log('Attempting token refresh after 401 error');
        authStore.refreshAccessToken().catch(() => {
          authStore.logout();
        });
      } else {
        authStore.logout();
      }
    }
  });
  
  // Enhanced page navigation handling with token check
  nuxtApp.hook('page:start', async () => {
    if (authStore.token) {
      // If token might be expired, try to refresh it
      if (isTokenExpired() && authStore.refreshToken) {
        try {
          console.log('Token check: attempting refresh');
          const success = await authStore.refreshAccessToken();
          if (!success) {
            console.warn('Token check: refresh failed');
            const publicRoutes = ["/login", "/forgot-password", "/reset-password", "/magic-login"];
            if (!publicRoutes.includes(router.currentRoute.value.path)) {
              authStore.logout();
            }
          }
        } catch (error) {
          console.error('Token check: refresh error', error);
        }
      }
    }
  });
});