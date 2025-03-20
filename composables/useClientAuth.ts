import { useAuthStore, type AuthStore } from "~/stores/client.auth";

export function useClientAuth(): AuthStore {
  // Only return the store on client-side
  if (process.client) {
    return useAuthStore();
  }

  // Return a placeholder store for server-side to avoid errors
  return {
    user: null,
    token: null,
    refreshToken: null,
    authenticated: false,
    loading: false,
    error: null,
    lastTokenCheck: 0,
    init: () => Promise.resolve(),
    login: () => Promise.resolve(false),
    logout: () => {},
    loadUser: () => Promise.resolve(),
    refreshAccessToken: () => Promise.resolve(false),
    requestPasswordReset: () => Promise.resolve(),
    resetPassword: () => Promise.resolve(),
    updateProfile: () => Promise.resolve(),
    validateEmailToken: () => Promise.resolve(),
    requestMagicLink: () => Promise.resolve(),
    loginWithMagicToken: () => Promise.resolve(),
  } as AuthStore;
}