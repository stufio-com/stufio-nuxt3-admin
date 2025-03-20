<script setup lang="ts">
import { useLocale } from '~/stufio-nuxt-locale/src/runtime/composables/useLocale'
import { 
  Select,
  SelectTrigger, 
  SelectValue,
  SelectContent, 
  SelectItem 
} from '@/components/ui/select'

// Enhanced component props for customization
const props = defineProps({
  /** Display mode for flag */
  showFlag: {
    type: Boolean,
    default: true
  },
  /** Display format for locale text */
  localeFormat: {
    type: String,
    default: 'name', // 'name' or 'code'
    validator: (value) => ['name', 'code'].includes(value)
  },
  /** Width of the select trigger */
  width: {
    type: String,
    default: '140px'
  }
})

// Get locale and translations from our module
const { locale, locales, setLocale, formatLocale } = useLocale()

// Flag emojis for different locales
const localeFlags = {
  en: '🇬🇧',
  pl: '🇵🇱',
  ru: '🇷🇺',
  de: '🇩🇪',
  fr: '🇫🇷',
  es: '🇪🇸',
  it: '🇮🇹',
  // Add more as needed
}

// Format locale for display
const getLocaleDisplay = (localeCode) => {
  const flag = props.showFlag ? localeFlags[localeCode] || '' : ''
  
  // Format the text part based on the localeFormat prop
  let text = ''
  if (props.localeFormat === 'name') {
    text = formatLocale(localeCode)
  } else if (props.localeFormat === 'code') {
    text = localeCode.toUpperCase()
  }
  
  // Combine flag and text with proper spacing
  if (flag && text) {
    return `${flag} ${text}`
  } else {
    return flag || text
  }
}

// Create options array
const localeOptions = computed(() => {
  return locales.value.map(code => ({
    value: code,
    label: formatLocale(code),
    display: getLocaleDisplay(code)
  }))
})

// Handle locale change
const handleChange = async (newLocale) => {
  await setLocale(newLocale)
}
</script>

<template>
  <Select :model-value="locale" @update:model-value="handleChange">
    <SelectTrigger :class="`w-[${width}]`">
      <span v-html="getLocaleDisplay(locale)"></span>
    </SelectTrigger>
    <SelectContent>
      <SelectItem 
        v-for="option in localeOptions" 
        :key="option.value" 
        :value="option.value"
      >
        <div class="flex items-center" v-html="option.display"></div>
      </SelectItem>
    </SelectContent>
  </Select>
</template>