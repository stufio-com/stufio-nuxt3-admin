<script setup lang="ts">
import { useDialog } from '~/composables/useDialog'

const route = useRoute()
const router = useRouter()
const authStore = useClientAuth()
const dialog = useDialog()

// State for handling different token types
const isProcessing = ref(false)
const processingText = ref('')

onMounted(async () => {
  isProcessing.value = true

  try {
    // Check for email verification token
    const token = route.query.token as string
    if (token) {
      processingText.value = 'Validating your email...'
      await handleEmailVerificationToken(token)
      return
    }

    // Check for magic login link
    const magicToken = route.query.magic as string
    if (magicToken) {
      processingText.value = 'Logging you in...'
      await handleMagicLoginToken(magicToken)
      return
    }
  } catch (error) {
    console.error('Token processing failed:', error)
  } finally {
    isProcessing.value = false
    // Clean up URL parameters after processing
    if (route.query.token || route.query.magic) {
      router.replace({ query: {} })
    }
  }
})

/**
 * Process email verification token
 */
async function handleEmailVerificationToken(token: string) {
  try {
    const msg = await authStore.validateEmailToken({ claim: token })
    
    // Show success dialog
    dialog.message({
      title: 'Email Verified',
      message: msg || 'Your email has been successfully verified.',
      variant: 'success'
    })
  } catch (error: any) {
    // Show error dialog
    dialog.message({
      title: 'Verification Failed',
      message: error.message || 'Failed to verify your email. Please try again.',
      variant: 'error'
    })
  }
}

/**
 * Process magic login token
 */
async function handleMagicLoginToken(magicToken: string) {
  try {
    const success = await authStore.loginWithMagicToken(magicToken)
    
    if (success) {
      // Show success message briefly
      dialog.message({
        title: 'Success',
        message: 'You have been logged in successfully.',
        variant: 'success',
        autoClose: true,
        autoCloseDelay: 2000
      })
      
      // Redirect to dashboard after successful login
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    } else {
      throw new Error(authStore.error || 'Authentication failed')
    }
  } catch (error: any) {
    // Show error dialog
    dialog.message({
      title: 'Login Failed',
      message: error.message || 'Failed to log in with magic link. Please try again or use your password.',
      variant: 'error'
    })
    
    // Redirect to login page after error
    setTimeout(() => {
      router.push('/login')
    }, 2500)
  }
}
</script>

<template>
    <!-- Loading indicator while processing tokens -->
    <StufioUiLoader :active="isProcessing" :text="processingText" subtext="Please wait..." fullScreen />
</template>
