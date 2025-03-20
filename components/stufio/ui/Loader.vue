<script setup lang="ts">
const props = defineProps({
  /**
   * Whether the loader is active
   */
  active: {
    type: Boolean,
    default: true
  },
  /**
   * Primary text displayed under the spinner
   */
  text: {
    type: String,
    default: 'Loading...'
  },
  /**
   * Secondary text displayed under the primary text
   */
  subtext: {
    type: String,
    default: 'Please wait...'
  },
  /**
   * Controls whether the loader covers the entire screen
   */
  fullScreen: {
    type: Boolean,
    default: false
  },
  /**
   * Size of the spinner (xs, sm, md, lg, xl)
   */
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  /**
   * Optional classes to apply to the container
   */
  containerClass: {
    type: String,
    default: ''
  },
  /**
   * Optional classes to apply to the spinner
   */
  spinnerClass: {
    type: String,
    default: ''
  },
  /**
   * Whether to show the text and subtext
   */
  showText: {
    type: Boolean,
    default: true
  },
  /**
   * Set to true to hide the backdrop
   */
  transparent: {
    type: Boolean,
    default: false
  },
  /**
   * Z-index value for the loader
   */
  zIndex: {
    type: [Number, String],
    default: 50
  }
})

// Compute the spinner size based on the size prop
const spinnerSize = computed(() => {
  switch (props.size) {
    case 'xs': return 'w-6 h-6 border-2';
    case 'sm': return 'w-8 h-8 border-2';
    case 'md': return 'w-12 h-12 border-4';
    case 'lg': return 'w-16 h-16 border-4';
    case 'xl': return 'w-20 h-20 border-6';
    default: return 'w-12 h-12 border-4';
  }
})

// Compute the text size based on the size prop
const textSize = computed(() => {
  switch (props.size) {
    case 'xs': return 'text-sm';
    case 'sm': return 'text-base';
    case 'md': return 'text-lg';
    case 'lg': return 'text-xl';
    case 'xl': return 'text-2xl';
    default: return 'text-lg';
  }
})

// Compute the subtext size based on the size prop
const subtextSize = computed(() => {
  switch (props.size) {
    case 'xs': return 'text-xs';
    case 'sm': return 'text-xs';
    case 'md': return 'text-sm';
    case 'lg': return 'text-base';
    case 'xl': return 'text-lg';
    default: return 'text-sm';
  }
})
</script>

<template>
  <div v-if="active" 
       :class="[
         'flex items-center justify-center',
         fullScreen ? 'fixed inset-0' : 'relative w-full h-full min-h-[100px]',
         !transparent ? 'bg-white/80 dark:bg-gray-900/80' : '',
         containerClass
       ]"
       :style="`z-index: ${zIndex};`">
    <div class="flex flex-col items-center text-center p-4">
      <div :class="[
             'rounded-full border-primary border-t-transparent animate-spin mb-4',
             spinnerSize,
             spinnerClass
           ]">
      </div>
      <template v-if="showText">
        <p :class="['font-medium text-gray-900 dark:text-gray-100', textSize]">
          {{ text }}
        </p>
        <p v-if="subtext" :class="['text-gray-500 dark:text-gray-400', subtextSize]">
          {{ subtext }}
        </p>
      </template>
    </div>
  </div>
</template>