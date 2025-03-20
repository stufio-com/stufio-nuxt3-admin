<script setup lang="ts">
import { useColorMode } from '@vueuse/core'
import { ref, onMounted, watch, computed } from 'vue'
import { Sun, Moon, MonitorSmartphone } from 'lucide-vue-next'
import { 
  Select,
  SelectTrigger, 
  SelectValue,
  SelectContent, 
  SelectItem 
} from '@/components/ui/select'

const props = defineProps({
  buttonClass: {
    type: String,
    default: 'stufio-dropdown-button'
  }
})

// Add this to track client-side mounting
const isMounted = ref(false)

// Initialize color mode with proper configuration
const colorMode = useColorMode({
  modes: {
    light: 'light',
    dark: 'dark',
    auto: 'auto',
  },
  emitAuto: true,
  storageKey: 'stufio-color-mode',
})

// Theme options
const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'auto', label: 'Auto', icon: MonitorSmartphone }
]

// Use computed property instead of function for reactivity
const currentIcon = computed(() => {
  // Only return the icon component when mounted on client
  if (!isMounted.value && process.client) return null;
  
  const option = themeOptions.find(option => option.value === colorMode.value)
  return option ? option.icon : Sun
})

// Add system preference media query watcher
let systemPrefersDarkQuery: MediaQueryList | null = null

onMounted(() => {
  // Mark as mounted to enable icon rendering
  isMounted.value = true
  
  if (window.matchMedia) {
    // Set up system theme change listener
    systemPrefersDarkQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    // Force an update if in auto mode when system preference changes
    const handleSystemPreferenceChange = () => {
      if (colorMode.value === 'auto') {
        const systemPrefersDark = systemPrefersDarkQuery?.matches
        if (systemPrefersDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    }
    
    // Add event listener using the correct method
    if (systemPrefersDarkQuery.addEventListener) {
      systemPrefersDarkQuery.addEventListener('change', handleSystemPreferenceChange)
    } else {
      // For older browsers
      systemPrefersDarkQuery.addListener(handleSystemPreferenceChange)
    }
  }
})

// Watch for color mode changes to ensure immediate updates
watch(colorMode, (newMode) => {
  if (newMode === 'dark') {
    document.documentElement.classList.add('dark')
  } else if (newMode === 'light') {
    document.documentElement.classList.remove('dark')
  } else if (newMode === 'auto') {
    const systemPrefersDark = window.matchMedia?.(
      '(prefers-color-scheme: dark)'
    ).matches
    
    if (systemPrefersDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
})
</script>

<template>
  <Select v-model="colorMode">
    <SelectTrigger class="w-[100px] flex items-center">
      <!-- Use v-if to only render the icon when mounted -->
      <component v-if="isMounted" :is="currentIcon" class="mr-2 h-4 w-4" />
      
      <!-- Show a placeholder during SSR and initial hydration -->
      <div v-else class="mr-2 h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      
      <SelectValue :placeholder="colorMode" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem 
        v-for="option in themeOptions" 
        :key="option.value" 
        :value="option.value"
      >
        <div class="flex items-center">
          <component :is="option.icon" class="mr-2 h-4 w-4" />
          <span>{{ option.label }}</span>
        </div>
      </SelectItem>
    </SelectContent>
  </Select>
</template>