import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";

// Interface definitions for type safety
interface User {
  id?: string | null;
  email?: string | null;
  full_name: string | null;
  email_validated: boolean | null;
  is_superuser: boolean | null;
  is_active: boolean | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  authenticated: boolean;
  loading: boolean;
  error?: string | null;
  lastTokenCheck: number;
}

interface AuthActions {
  init: () => Promise<void>;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  loadUser: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean | void>;
  logout: () => void;
  requestPasswordReset: (data: { email: string }) => Promise<string | void>;
  resetPassword: (data: { claim: string; password: string }) => Promise<string | void>;
  validateEmailToken: (data: { claim: string }) => Promise<string | void>;
  requestMagicLink: (data: { email: string }) => Promise<string | void>;
  loginWithMagicToken: (data: { magicToken: string }) => Promise<boolean | void>;
}

export interface AuthStore extends AuthState, AuthActions {}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    // Use custom serializer for user data
    user: useStorage("stufio-admin-user", null as User | null, localStorage, {
      serializer: {
        read: (v: any) => {
          try {
            return v ? JSON.parse(v) : null;
          } catch (e) {
            console.error('Failed to parse user data from storage', e);
            return null;
          }
        },
        write: (v: any) => JSON.stringify(v),
      },
    }),
    
    // These work fine as is
    token: useStorage("stufio-admin-token", null as string | null),
    refreshToken: useStorage("stufio-admin-refresh-token", null as string | null),
    
    // Add these to storage
    authenticated: useStorage("stufio-admin-authenticated", false),
    lastTokenCheck: useStorage("stufio-admin-last-check", 0),
    
    // These don't need persistence
    loading: false,
    error: null,
  }),

  actions: {
    /**
     * Initialize auth state by checking token validity
     */
    async init(this: AuthStore) {
      // If token exists and we haven't checked recently, validate it
      if (this.token && Date.now() - this.lastTokenCheck > 5000) {
        try {
          await this.loadUser();
          this.lastTokenCheck = Date.now(); // Now this will persist
        } catch (err: any) {
          // If loading fails due to auth errors, clear token
          if (err?.status === 401 || err?.status === 403) {
            this.logout();
          }
        }
      }
    },

    /**
     * Authenticate user with email and password
     */
    async login(
      this: AuthStore,
      { email, password }: { email: string; password: string }
    ) {
      this.loading = true;
      this.error = null;

      try {
        // Use the open-fetch client to call the OAuth endpoint
        const { data, error }: any = await useApi("/api/v1/login/oauth", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "password",
            username: email,
            password,
            scope: "",
          }),
        });
        
        if (error.value) {
          throw new Error(
            String(error.value?.data?.detail) ||
              error.value.message ||
              "Authentication failed"
          );
        }

        if (data.value) {
          this.token = data.value.access_token;
          this.refreshToken = data.value.refresh_token || null;
          this.authenticated = true;

          // Load user data
          await this.loadUser();
        }

        return this.authenticated;
      } catch (err: any) {
        this.error = err.message || "Authentication failed";
        return false;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Load user data from API
     */
    async loadUser(this: AuthStore) {
      if (!this.token) {
        this.authenticated = false;
        return;
      }

      try {
        const { data, error }: any = await useApi("/api/v1/users/", {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });

        if (error.value) {
          throw new Error(
            error.value?.data?.detail ||
              error.value.message ||
              "Failed to load user data"
          );
        }

        if (data.value) {
          // Check if user has admin privileges
          if (!data.value.is_superuser) {
            throw new Error("Insufficient permissions for admin access");
          }

          this.user = data.value;
          this.authenticated = true;
        }
      } catch (err: any) {
        this.error = err.message;
        this.authenticated = false;
        this.token = null;
        this.refreshToken = null;
        this.user = null;
      }
    },

    /**
     * Refresh the access token using refresh token
     */
    async refreshAccessToken(this: AuthStore): Promise<boolean | void> {
      if (!this.refreshToken) return false;

      try {
        const { data, error } = await useApi("/api/v1/login/refresh", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.refreshToken}`,
          },
        });

        if (error.value) {
          throw new Error(
            error.value?.data?.detail ||
              error.value.message ||
              "Token refresh failed"
          );
        }

        if (data.value?.access_token) {
          this.token = data.value.access_token;
          this.refreshToken = data.value.refresh_token || this.refreshToken;
          this.authenticated = true;
          return true;
        }

        return false;
      } catch (err) {
        this.logout();
      }
    },

    /**
     * Log out the current user
     */
    logout(this: AuthStore) {
      // Optionally call an API endpoint to invalidate the token
      if (this.token) {
        // Fire and forget - don't wait for response
        useApi("/api/v1/login/revoke", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }).catch(() => {});
      }

      // Reset state
      this.token = null;
      this.refreshToken = null;
      this.user = null;
      this.authenticated = false;
      this.error = null;

      // Navigate to login page
      navigateTo("/login");
    },

    /**
     * Request password reset email
     */
    async requestPasswordReset(
      this: AuthStore,
      { email }: { email: string }
    ): Promise<string | void> {
      this.loading = true;
      this.error = null;

      try {
        const { data, error } = await useApi(
          `/api/v1/login/recover/${encodeURIComponent(email)}`,
          {
            method: "POST",
          }
        );

        if (error.value) {
          throw new Error(
            error.value?.data?.detail ||
              error.value.message ||
              "Failed to send reset email"
          );
        }

        return data.value?.msg || "Password reset email sent";
      } catch (err: any) {
        this.error = err.message || "Failed to send reset email";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Reset password with token
     */
    async resetPassword(
      this: AuthStore,
      {
        claim,
        password,
      }: {
        claim: string;
        password: string;
      }
    ): Promise<string | void> {
      this.loading = true;
      this.error = null;

      try {
        const { data, error } = await useApi("/api/v1/login/reset", {
          method: "POST",
          body: {
            claim,
            new_password: password,
          },
        });

        if (error.value) {
          throw new Error(
            error.value?.data?.detail ||
              error.value.message ||
              "Password reset failed"
          );
        }

        return data.value?.msg || "Password reset successful";
      } catch (err: any) {
        this.error = err.message || "Password reset failed";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Validate email token
     *
     * @param claim The validation token received via email
     * @returns Promise with success message
     */
    async validateEmailToken(
      this: AuthStore,
      { claim }: { claim: string }
    ): Promise<string | void> {
      this.loading = true;
      this.error = null;

      try {
        const { data, error } = await useApi("/api/v1/login/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: { claim },
        });

        if (error.value) {
          throw new Error(
            error.value?.data?.detail ||
              error.value.message ||
              "Failed to validate email token"
          );
        }

        if (data.value?.msg) {
          return data.value.msg;
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (err: any) {
        this.error = err.message || "Failed to validate email token";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Request magic link for passwordless login
     *
     * @param email User's email address
     * @returns Promise with success message
     */
    async requestMagicLink(
      this: AuthStore,
      { email }: { email: string }
    ): Promise<string | void> {
      this.loading = true;
      this.error = null;

      try {
        const { data, error } = await useApi(
          `/api/v1/login/magic/${encodeURIComponent(email)}`,
          {
            method: "POST",
          }
        );

        if (error.value) {
          throw new Error(
            error.value?.data?.detail ||
              error.value.message ||
              "Failed to send magic link"
          );
        }

        // Store the claim for later use - the claim is in the response
        if (data.value?.claim) {
          // Save claim in a cookie with 30-minute expiration
          const magicClaimCookie = useCookie("stufio-magic-claim", {
            maxAge: 30 * 60, // 30 minutes
            secure: true,
            sameSite: "strict",
          });
          magicClaimCookie.value = data.value.claim;
        }

        return data.value?.msg || "Magic link email sent";
      } catch (err: any) {
        this.error = err.message || "Failed to send magic link";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Authenticate using magic link token
     *
     * @param magicToken The magic link token from URL
     * @returns Promise<boolean> indicating success
     */
    async loginWithMagicToken(
      this: AuthStore,
      { magicToken }: { magicToken: string }
    ): Promise<boolean | void> {
      console.log(
        "Starting loginWithMagicToken with token:",
        magicToken.substring(0, 10) + "..."
      );
      this.loading = true;
      this.error = null;

      try {
        // Get the stored claim if available
        const magicClaimCookie = useCookie("stufio-magic-claim");
        const storedClaim = magicClaimCookie.value;
        const claim = magicToken;
        console.log(
          "Retrieved stored claim:",
          storedClaim ? "Present" : "Not found"
        );

        // Prepare headers with Authorization if we have a stored claim
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (storedClaim) {
          headers.Authorization = `Bearer ${storedClaim}`;
        }

        console.log("About to call /api/v1/login/claim endpoint");

        // Make the request with optional Bearer token
        const { data, pending }: any = await useApi("/api/v1/login/claim", {
          method: "POST",
          headers,
          body: { claim },
        });

        this.loading = pending;

        console.log("Response from /api/v1/login/claim:", data.value);

        // Clear the stored claim regardless of outcome
        // magicClaimCookie.value = null

        if (data.value?.access_token) {
          // Store the tokens
          this.token = data.value.access_token;
          this.refreshToken = data.value.refresh_token || null;
          this.authenticated = true;

          // Load user data
          await this.loadUser();

          return true;
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (err: any) {
        console.error("Error in loginWithMagicToken:", err);
        this.error = err.message || "Magic link authentication failed";
        return false;
      } finally {
        this.loading = false;
        console.log("loginWithMagicToken completed, loading set to false");
      }
    },
  },
});
