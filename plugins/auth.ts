export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useClientAuth();
  const router = useRouter();

  const redirector = function (url: string) {
    window.location.href = url;
    nuxtApp.hook("app:mounted", () => {
      console.log("App mounted, now redirecting to dashboard");
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
      authStore.logout();
    }
  });
  
  // Check auth state on page navigation
  nuxtApp.hook('page:start', () => {
    if (authStore.token) {
      // Verify token periodically
      const now = Date.now();
      if (now - authStore.lastTokenCheck > 60000) { // Check once per minute
        authStore.init().catch(() => {}); // Catch errors to avoid breaking navigation
      }
    }
  });

  // Add auth interceptor for $api if it exists
  try {
    const { $api } = useNuxtApp();
    
    if ($api && $api.interceptors) {
      $api.interceptors.response.use(
        (response) => response,
        async (error) => {
          console.log("API Error:", error);
          // Handle token refresh for 401 errors
          // Safely access response property with optional chaining
          if (error?.response?.status === 401 && authStore.refreshToken) {
            // Only try refresh if we have config to retry
            if (error.config) {
              const originalRequest = error.config;
              
              // Only try once to prevent infinite loops
              if (!originalRequest._retry) {
                originalRequest._retry = true;
                
                try {
                  // Try to refresh the token
                  const refreshSuccess = await authStore.refreshAccessToken();
                  
                  if (refreshSuccess) {
                    // Retry the original request with new token
                    originalRequest.headers = originalRequest.headers || {};
                    originalRequest.headers.Authorization = `Bearer ${authStore.token}`;
                    return $api(originalRequest);
                  }
                } catch (refreshError) {
                  console.error("Error refreshing token:", refreshError);
                  authStore.logout();
                }
              }
            }
          }
          
          // For all other errors, just pass them through
          return Promise.reject(error);
        }
      );
    }
  } catch (err) {
    console.warn("Could not setup API interceptors:", err);
  }
});