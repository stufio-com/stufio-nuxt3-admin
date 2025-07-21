export function useAuth() {
  // Create reactive reference for token
  const token = localStorage.getItem("stufio-admin-token") || "";
  return {
    token: token,
    isAuthenticated: !!token,
  };
}