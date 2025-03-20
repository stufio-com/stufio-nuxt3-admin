<script setup>
definePageMeta({
  layout: 'login'
})

// Redirect to dashboard or login page
const route = useRoute()
const authStore = useClientAuth()

onMounted(() => {
  // If there's a token or magic parameter in the URL, don't redirect
  // This allows the TokenValidator to process these parameters
  if (route.query.token || route.query.magic) {
    return
  }
  
  // Check auth state from store instead of cookie
  if (authStore.authenticated && authStore.token) {
    navigateTo('/dashboard')
  } else {
    navigateTo('/login')
  }
})
</script>

<template>
  <div class="flex h-screen items-center justify-center">
    <StufioLogo size="lg" />

    <!-- Auth token validator - hidden but always present -->
    <StufioAuthTokenValidator />
  </div>
</template>