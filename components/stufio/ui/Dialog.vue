<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useDialogStore } from '~/stores/dialog'
import { useAuthStore } from '~/stores/client.auth'
import { Eye, EyeOff, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-vue-next'

const dialogStore = useDialogStore()
const authStore = useClientAuth()
const { dialog, isLoading } = storeToRefs(dialogStore)

// Login form state
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errors = ref<{ email?: string; password?: string }>({})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// Reset login form when dialog opens
watch(() => dialog.value?.open, (open) => {
  if (open && dialog.value?.type === 'login') {
    email.value = ''
    password.value = ''
    errors.value = {}
    showPassword.value = false
  }
})

// Login form submission
const handleLogin = async () => {
  errors.value = {}
  
  // Validate form
  if (!email.value) {
    errors.value.email = 'Email is required'
  }
  
  if (!password.value) {
    errors.value.password = 'Password is required'
  }
  
  if (Object.keys(errors.value).length > 0) {
    return
  }
  
  dialogStore.setLoading(true)
  
  try {
    const success = await authStore.login({
      email: email.value,
      password: password.value
    })
    
    if (success) {
      dialogStore.hide()
      if (dialog.value?.type === 'login' && dialog.value.onLogin) {
        dialog.value.onLogin(authStore.user)
      }
      
      if (dialog.value?.type === 'login' && dialog.value.redirectTo) {
        navigateTo(dialog.value.redirectTo)
      }
    } else {
      errors.value.email = authStore.error || 'Login failed'
    }
  } catch (err: any) {
    errors.value.email = err.message || 'Login failed'
  } finally {
    dialogStore.setLoading(false)
  }
}

// Handle form dialog submission
const handleFormSubmit = async () => {
  if (!dialog.value || dialog.value.type !== 'form' || !dialog.value.onSubmit) {
    return
  }
  
  dialogStore.setLoading(true)
  
  try {
    // We assume formComponent will emit an update event with form data
    const formData = {} // You may need a ref to store form data emitted from the component
    await dialog.value.onSubmit(formData)
    dialogStore.hide()
  } catch (err) {
    console.error('Form submission error:', err)
  } finally {
    dialogStore.setLoading(false)
  }
}

// Get icon for message dialog
const messageIcon = computed(() => {
  if (!dialog.value || dialog.value.type !== 'message') return null
  
  switch (dialog.value.variant) {
    case 'success': return CheckCircle
    case 'warning': return AlertTriangle
    case 'error': return AlertCircle
    case 'info':
    default: return Info
  }
})

// Get icon color for message dialog
const messageIconClass = computed(() => {
  if (!dialog.value || dialog.value.type !== 'message') return ''
  
  switch (dialog.value.variant) {
    case 'success': return 'text-green-500'
    case 'warning': return 'text-yellow-500'
    case 'error': return 'text-red-500'
    case 'info':
    default: return 'text-blue-500'
  }
})
</script>

<template>
  <!-- Alert Dialog -->
  <Dialog v-if="dialog?.type === 'alert'" :open="dialog?.open" @update:open="$event === false && dialogStore.hide()">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ dialog.title }}</DialogTitle>
      </DialogHeader>
      <p>{{ dialog.message }}</p>
      <DialogFooter>
        <Button @click="dialog.onConfirm ? dialog.onConfirm() : dialogStore.hide()">
          {{ dialog.buttonText || 'OK' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Confirmation Dialog -->
  <Dialog v-if="dialog?.type === 'confirm'" :open="dialog?.open" @update:open="$event === false && dialogStore.hide()">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ dialog.title }}</DialogTitle>
      </DialogHeader>
      <p>{{ dialog.message }}</p>
      <DialogFooter class="flex gap-2 justify-end">
        <Button variant="outline" @click="dialog.onCancel ? dialog.onCancel() : dialogStore.hide()">
          {{ dialog.cancelText || 'Cancel' }}
        </Button>
        <Button :variant="dialog.variant || 'default'" @click="dialog.onConfirm(); dialogStore.hide()">
          {{ dialog.confirmText || 'Confirm' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Login Dialog -->
  <Dialog v-if="dialog?.type === 'login'" :open="dialog?.open" @update:open="$event === false && dialogStore.hide()">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ dialog.title }}</DialogTitle>
        <DialogDescription>
          {{ dialog.description || 'Enter your credentials to continue' }}
        </DialogDescription>
      </DialogHeader>
      
      <form @submit.prevent="handleLogin" class="grid gap-4">
        <div v-if="dialog.message" class="text-amber-600 text-sm">
          {{ dialog.message }}
        </div>
        
        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input 
            id="email" 
            v-model="email" 
            type="email" 
            placeholder="admin@email.com"
            :class="{ 'border-red-500': errors.email }" 
            required 
          />
          <p v-if="errors.email" class="text-sm text-red-500">{{ errors.email }}</p>
        </div>
        
        <div class="grid gap-2">
          <Label for="password">Password</Label>
          <div class="relative">
            <Input 
              id="password" 
              v-model="password" 
              :type="showPassword ? 'text' : 'password'"
              :class="{ 'border-red-500': errors.password, 'pr-10': true }" 
              required 
            />
            <button 
              type="button" 
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
              @click="togglePasswordVisibility" 
              tabindex="-1"
            >
              <Eye v-if="showPassword" class="h-4 w-4 text-gray-500" />
              <EyeOff v-else class="h-4 w-4 text-gray-500" />
            </button>
          </div>
          <p v-if="errors.password" class="text-sm text-red-500">{{ errors.password }}</p>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            type="button" 
            @click="dialog.onCancel ? dialog.onCancel() : dialogStore.hide()"
            :disabled="isLoading"
          >
            Cancel
          </Button>
          <Button type="submit" :disabled="isLoading">
            <span v-if="isLoading" class="mr-2">
              <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
            </span>
            Login
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>

  <!-- Custom Form Dialog -->
  <Dialog v-if="dialog?.type === 'form'" :open="dialog?.open" @update:open="$event === false && dialogStore.hide()">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ dialog.title }}</DialogTitle>
        <DialogDescription v-if="dialog.description">
          {{ dialog.description }}
        </DialogDescription>
      </DialogHeader>
      
      <form :id="dialog.formId" @submit.prevent="handleFormSubmit">
        <!-- Dynamically render the form component -->
        <component 
          :is="dialog.formComponent" 
          v-bind="dialog.formProps || {}"
          @update:modelValue="(data) => formData = data"
        />
      </form>
      
      <DialogFooter>
        <Button 
          variant="outline" 
          @click="dialog.onCancel ? dialog.onCancel() : dialogStore.hide()"
          :disabled="isLoading"
        >
          {{ dialog.cancelText || 'Cancel' }}
        </Button>
        <Button 
          type="submit" 
          :form="dialog.formId"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="mr-2">
            <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
          </span>
          {{ dialog.submitText || 'Submit' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Message Dialog -->
  <Dialog v-if="dialog?.type === 'message'" :open="dialog?.open" @update:open="$event === false && dialogStore.hide()">
    <DialogContent class="sm:max-w-md">
      <div class="flex items-center gap-3">
        <component :is="messageIcon" v-if="messageIcon" :class="[messageIconClass, 'h-6 w-6']" />
        <DialogTitle>{{ dialog.title }}</DialogTitle>
      </div>
      <p>{{ dialog.message }}</p>
    </DialogContent>
  </Dialog>
</template>