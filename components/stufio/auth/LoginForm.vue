<script setup lang="ts">
import { ShieldUser, Mail, Eye, EyeOff } from 'lucide-vue-next'
import { useDialog } from '~/composables/useDialog'
import { useTranslations } from '~/stufio-nuxt-locale/src/runtime/composables/useTranslations'

// Get i18n composable
const { t } = useTranslations()
const emit = defineEmits(['login:success', 'login:error', 'login:cancel'])

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errors = ref<{ email?: string; password?: string }>({})
const isSubmitting = ref(false)

// Get auth store
const authStore = useClientAuth()
const dialog = useDialog()

// Toggle password visibility
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// Validate form
const validateForm = () => {
  errors.value = {}
  
  if (!email.value) {
    errors.value.email = t('Email is required')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = t('Please enter a valid email address')
  }
  
  if (!password.value) {
    errors.value.password = t('Password is required')
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
      emit('login:success', authStore.user)
      await navigateTo('/dashboard')
    } else if (authStore.error) {
      errors.value.email = authStore.error
      emit('login:error', authStore.error)
    }
  } catch (err: any) {
    const errorMsg = err.message || t('Login failed')
    errors.value.email = errorMsg
    emit('login:error', errorMsg)
  } finally {
    isSubmitting.value = false
  }
}

// Handle magic link login
const handleMagicLink = async () => {
  if (!email.value) {
    errors.value.email = t('Email is required')
    return
  }
  
  isSubmitting.value = true
  
  try {
    // Use the refactored method from auth store
    const message = await authStore.requestMagicLink({ email: email.value })
    
    // Show success message using dialog system
    dialog.message({
      title: t('Success'),
      message: message || t('Login link sent to your email!'),
      variant: 'success'
    })
  } catch (err: any) {
    const errorMsg = err.message || t('Failed to send magic link')
    errors.value.email = errorMsg
    emit('login:error', errorMsg)
  } finally {
    isSubmitting.value = false
  }
}

// Reset form when mounted
onMounted(() => {
  email.value = ''
  password.value = ''
  errors.value = {}
  showPassword.value = false
})
</script>

<template>
  <!-- Login card -->
  <Card class="mx-auto max-w-sm w-full">
    <CardHeader>
      <CardTitle>
        {{ t('Admin Dashboard') }}
      </CardTitle>
      <CardDescription class="font-lexend text-sm text-gray-500">
        {{ t('Enter your administrator credentials to login') }}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="handleSubmit" class="grid gap-4">
        <div class="grid gap-2">
          <Label for="email">{{ t('Email') }}</Label>
          <Input id="email" v-model="email" type="email" placeholder="admin@email.com"
            :class="{ 'border-red-500': errors.email }" required />
          <p v-if="errors.email" class="text-sm text-red-500">{{ errors.email }}</p>
        </div>
        <div class="grid gap-2">
          <div class="flex items-center justify-between">
            <Label for="password">{{ t('Password') }}</Label>
            <NuxtLink to="/forgot-password" class="text-sm underline">
              {{ t('Forgot password?') }}
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
          {{ isSubmitting ? t('Logging in...') : t('Login') }}
        </Button>
        <Button type="button" variant="outline" class="w-full" @click="handleMagicLink" :disabled="isSubmitting">
          <Mail class="mr-2 h-4 w-4" /> {{ t('Login with Email Link') }}
        </Button>
      </form>
    </CardContent>
  </Card>
</template>
