<script setup>
// Use definePageMeta to specify layout (optional)
definePageMeta({
  layout: 'default',
})

// Access the auth store
const authStore = useClientAuth();
const router = useRouter();

// On mount, perform the logout
onMounted(() => {
  console.log("Logout page mounted, performing logout");
  
  try {
    // Call the logout function from the auth store
    authStore.logout();
    
    // Use direct location redirect for better reliability
    // This is handled by the auth store's logout method, but adding a backup here
    setTimeout(() => {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }, 100);
  } catch (error) {
    console.error("Error during logout:", error);
    // Fallback redirect
    window.location.href = '/login';
  }
})
</script>

<template>
  <StufioUiLoader
    active
    text="Logging out..."
    subtext="Please wait while we log you out."
    fullScreen
    size="md"
    :transparent="false"
    zIndex="50"
  />
</template>