<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldUser, Mail, Eye, EyeOff } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errors = ref<{ email?: string; password?: string }>({})
const isSubmitting = ref(false)

// Get auth store
const authStore = useAuthStore()

// Toggle password visibility
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// Validate form
const validateForm = () => {
  errors.value = {}
  
  if (!email.value) {
    errors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = 'Please enter a valid email address'
  }
  
  if (!password.value) {
    errors.value.password = 'Password is required'
  }
  
  return Object.keys(errors.value).length === 0
}

// Submit form
const handleSubmit = async () => {
  if (!validateForm()) return
  
  isSubmitting.value = true
  
  try {
    const success = await authStore.login({
      email: email.value,
      password: password.value
    })
    
    if (success) {
      navigateTo('/dashboard')
    } else if (authStore.error) {
      errors.value.email = authStore.error
    }
  } catch (err: any) {
    errors.value.email = err.message || 'Login failed'
  } finally {
    isSubmitting.value = false
  }
}

// Handle magic link login
const handleMagicLink = async () => {
  if (!email.value) {
    errors.value.email = $t('Email is required')
    return
  }
  
  isSubmitting.value = true
  
  try {
    const { data, error } = await useApi(`/api/v1/login/magic/${encodeURIComponent(email.value)}`, {
      method: 'POST'
    })
    
    if (error.value) {
      errors.value.email = error.value.message || 'Failed to send magic link'
    } else {
      // Show success message
      alert('Magic link sent to your email!')
    }
  } catch (err: any) {
    errors.value.email = err.message || 'Failed to send magic link'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <!-- Login card -->
  <Card class="mx-auto max-w-sm w-full min-w-[350px]">
    <CardHeader>
      <CardTitle>
        {{ $t('Admin Dashboard') }}
      </CardTitle>
      <CardDescription class="font-lexend text-sm text-gray-500">
        {{ $t('Enter your administrator credentials to login') }}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="handleSubmit" class="grid gap-4">
        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input id="email" v-model="email" type="email" placeholder="admin@email.com"
            :class="{ 'border-red-500': errors.email }" required />
          <p v-if="errors.email" class="text-sm text-red-500">{{ errors.email }}</p>
        </div>
        <div class="grid gap-2">
          <div class="flex items-center justify-between">
            <Label for="password">Password</Label>
            <NuxtLink to="/forgot-password" class="text-sm underline">
              Forgot password?
            </NuxtLink>
          </div>
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
        <Button type="submit" class="w-full" :disabled="isSubmitting">
          <ShieldUser class="mr-2 h-4 w-4" />
          {{ isSubmitting ? $t('Logging in...') : $t('Login') }}
        </Button>
        <Button type="button" variant="outline" class="w-full" @click="handleMagicLink" :disabled="isSubmitting">
          <Mail class="mr-2 h-4 w-4" /> {{ $t('Login with Email Link') }}
        </Button>
      </form>
    </CardContent>
  </Card>
</template>
