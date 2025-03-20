import { useDialog } from "~/composables/useDialog";

// Track ongoing refresh to prevent multiple simultaneous refresh calls
let refreshingPromise: Promise<boolean | void> | null = null;

/**
 * Enhanced API fetch with authentication, token refresh and re-auth handling
 * @param url The API endpoint to call
 * @param options Request options
 * @returns Promise with API response
 */
export const useApiWithAuth = async (url: string, options: any = {}) => {
  const authStore = useClientAuth();
  const dialog = useDialog();
  
  // Add auth header if not already present
  if (authStore.authenticated && authStore.token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${authStore.token}`
    };
  }
  
  try {
    const {data, error} = await useApi(url, options);

    if (
      error?.value &&
      (error.value?.statusCode === 401 || error.value?.statusCode === 403)
    ) {
      throw error?.value;
    }

    return {data, error};
  } catch (error: any) {
    // Handle 401/403 errors
    if (error?.statusCode === 401 || error?.statusCode === 403) {
      console.log(`Auth error ${error.statusCode} detected for ${url}`);

      // Try to refresh the token if refresh_token exists
      const refreshToken = useCookie("refresh_token");
      if (refreshToken.value) {
        // Use existing refresh operation or start a new one
        refreshingPromise = refreshingPromise || authStore.refreshAccessToken();

        const refreshSuccessful = await refreshingPromise;
        refreshingPromise = null;

        if (refreshSuccessful) {
          // Retry original request with new token
          if (authStore.token) {
            options.headers = {
              ...options.headers,
              Authorization: `Bearer ${authStore.token}`,
            };
            return await useApi(url, options);
          }
        } else {
          // Show login dialog if refresh failed
          return new Promise((resolve, reject) => {
            dialog.login({
              title: "Session Expired",
              message: "Your session has expired. Please log in to continue.",
              onLogin: async (userData) => {
                // After successful login, retry the request
                if (authStore.authenticated && authStore.token) {
                  options.headers = {
                    ...options.headers,
                    Authorization: `Bearer ${authStore.token}`,
                  };
                  try {
                    const result = await useApi(url, options);
                    resolve(result);
                  } catch (err) {
                    reject(err);
                  }
                } else {
                  reject(new Error("Authentication failed"));
                }
              },
              onCancel: () => {
                reject(new Error("Authentication canceled"));
              }
            });
          });
        }
      } else {
        // No refresh token, show login directly
        return new Promise((resolve, reject) => {
          dialog.login({
            title: "Authentication Required",
            message: "Please log in to continue.",
            onLogin: async (userData) => {
              if (authStore.authenticated && authStore.token) {
                options.headers = {
                  ...options.headers,
                  Authorization: `Bearer ${authStore.token}`,
                };
                try {
                  const result = await useApi(url, options);
                  resolve(result);
                } catch (err) {
                  reject(err);
                }
              } else {
                reject(new Error("Authentication failed"));
              }
            },
            onCancel: () => {
              reject(new Error("Authentication canceled"));
            }
          });
        });
      }
    }
    
    // Re-throw other errors
    throw error;
  }
};