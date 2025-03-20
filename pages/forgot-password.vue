<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Eye, EyeOff } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/client.auth'

definePageMeta({
  layout: 'login'
})

// Form state
const email = ref('')
const errors = ref<{ email?: string; password?: string; confirmPassword?: string }>({})
const success = ref(false)
const isSubmitting = ref(false)
const showResetForm = ref(false)
const resetToken = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)

const authStore = useClientAuth()

// Check for token in URL
onMounted(() => {
  const route = useRoute()
  if (route.query.token) {
    resetToken.value = route.query.token as string
    showResetForm.value = true
  }
})

// Toggle password visibility
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// Validate request form
const validateRequestForm = () => {
  errors.value = {}
  
  if (!email.value) {
    errors.value.email = $t('Email is required')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = $t('Enter a valid email address')
  }
  
  return Object.keys(errors.value).length === 0
}

// Validate reset form
const validateResetForm = () => {
  errors.value = {}
  
  if (!password.value) {
    errors.value.password = $t('Enter your password')
  } else if (password.value.length < 8) {
    errors.value.password = $t('Password must be at least 8 characters long')
  }
  
  if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = $t('Passwords do not match')
  }
  
  return Object.keys(errors.value).length === 0
}

// Submit request form
const handleRequestSubmit = async () => {
  if (!validateRequestForm()) return
  
  isSubmitting.value = true
  
  try {
    await authStore.requestPasswordReset(email.value)
    success.value = true
  } catch (err) {
    // Error is already set in the store
  } finally {
    isSubmitting.value = false
  }
}

// Submit reset form
const handleResetSubmit = async () => {
  if (!validateResetForm()) return
  
  isSubmitting.value = true
  
  try {
    await authStore.resetPassword({
      claim: resetToken.value,
      password: password.value
    })
    
    success.value = true
    
    // Redirect to login after 2 seconds
    setTimeout(() => {
      navigateTo('/login')
    }, 2000)
  } catch (err) {
    // Error is already set in the store
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col items-center">
    <!-- Logo placed above card -->
    <StufioLogo size="md" showText containerClass="mb-4 text-center" />

    <!-- Request form -->
    <Card v-if="!showResetForm && !success" class="mx-auto max-w-sm w-full">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">{{ $t('Reset Password') }}</CardTitle>
        <CardDescription>
          {{ $t('Enter your email to receive a reset link') }}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleRequestSubmit" class="grid gap-4">
          <div class="grid gap-2">
            <Label for="email">{{ $t('Email') }}</Label>
            <Input id="email" v-model="email" type="email" placeholder="admin@email.com"
              :class="{ 'border-red-500': errors.email }" required />
            <p v-if="errors.email" class="text-sm text-red-500">{{ errors.email }}</p>
            <p v-if="authStore.error" class="text-sm text-red-500">{{ authStore.error }}</p>
          </div>
          <Button type="submit" class="w-full" :disabled="isSubmitting">
            <Mail class="mr-2 h-4 w-4" />
            {{ isSubmitting ? $t('Sending...') : $t('Send Reset Link') }}
          </Button>
        </form>
      </CardContent>
      <CardFooter class="flex justify-center">
        <NuxtLink to="/login"
          class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 underline">
          {{ $t('Return to Login') }}
        </NuxtLink>
      </CardFooter>
    </Card>

    <!-- Password reset form -->
    <Card v-if="showResetForm && !success" class="mx-auto max-w-sm w-full">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">{{ $t('Create New Password') }}</CardTitle>
        <CardDescription>
          {{ $t('Enter your new password below') }}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleResetSubmit" class="grid gap-4">
          <div class="grid gap-2">
            <Label for="password">{{ $t('New Password') }}</Label>
            <div class="relative">
              <Input id="password" v-model="password" :type="showPassword ? 'text' : 'password'"
                :class="{ 'border-red-500': errors.password, 'pr-10': true }" required />
              <button type="button" class="absolute inset-y-0 right-0 pr-3 flex items-center"
                @click="togglePasswordVisibility" tabindex="-1">
                <Eye v-if="showPassword" class="h-4 w-4 text-gray-500" />
                <EyeOff v-else class="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <p v-if="errors.password" class="text-sm text-red-500">{{ errors.password }}</p>
          </div>
          <div class="grid gap-2">
            <Label for="confirmPassword">{{ $t('Confirm Password') }}</Label>
            <div class="relative">
              <Input id="confirmPassword" v-model="confirmPassword" :type="showPassword ? 'text' : 'password'"
                :class="{ 'border-red-500': errors.confirmPassword, 'pr-10': true }" required />
            </div>
            <p v-if="errors.confirmPassword" class="text-sm text-red-500">{{ errors.confirmPassword }}</p>
            <p v-if="authStore.error" class="text-sm text-red-500">{{ authStore.error }}</p>
          </div>
          <Button type="submit" class="w-full" :disabled="isSubmitting">
            {{ isSubmitting ? $t('Setting New Password...') : $t('Set New Password') }}
          </Button>
        </form>
      </CardContent>
    </Card>

    <!-- Success message -->
    <Card v-if="success" class="mx-auto max-w-sm w-full">
      <CardHeader>
        <CardTitle class="text-xl text-center rainbow-text font-semibold">{{ $t('Success!') }}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-col items-center space-y-4">
          <div class="rounded-full bg-green-100 p-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="text-center">
            {{ showResetForm
            ? $t('Your password has been reset successfully. Redirecting to login...')
            : $t('Password reset link has been sent to your email')
            }}
          </p>
        </div>
      </CardContent>
      <CardFooter class="flex justify-center">
        <NuxtLink to="/login" class="text-sm text-cyan-600 hover:underline">
          {{ $t('Return to Login') }}
        </NuxtLink>
      </CardFooter>
    </Card>
  </div>
</template>