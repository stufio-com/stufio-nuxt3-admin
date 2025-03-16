<script setup>
// Redirect to dashboard or login page
const token = useCookie('auth_token')
onMounted(() => {
  if (token.value) {
    navigateTo('/dashboard')
  } else {
    navigateTo('/login')
  }
})
</script>

<template>
  <div class="flex h-screen items-center justify-center">
    <p>Redirecting...</p>
  </div>
</template>