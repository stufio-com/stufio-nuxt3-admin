<script setup lang="ts">
// Define props for the logo component
interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string; // Predefined sizes or custom
  showText?: boolean;
  showVersion?: boolean; // New prop to control version text visibility
  versionText?: string; // Custom version text
  iconClass?: string;
  textClass?: string;
  versionClass?: string; // Class for version text
  containerClass?: string;
  alt?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showText: true,
  showVersion: true, // Default to hidden
  versionText: 'ADMIN PANEL v0.1.0',
  iconClass: '',
  textClass: '',
  versionClass: '',
  containerClass: '',
  alt: 'Stufio Logo'
});

// Calculate icon size based on the predefined size
const iconSize = computed(() => {
  switch (props.size) {
    case 'xs': return 'h-8';
    case 'sm': return 'h-12';
    case 'md': return 'h-16 pb-1';
    case 'lg': return 'h-20';
    case 'xl': return 'h-24';
    default: return props.size.startsWith('h-') ? props.size : 'h-16'; // Custom size or default
  }
});

// Calculate text logo size based on the predefined size
const textSize = computed(() => {
  switch (props.size) {
    case 'xs': return 'w-20';
    case 'sm': return 'w-32';
    case 'md': return 'w-40';
    case 'lg': return 'w-48';
    case 'xl': return 'w-56';
    default: return props.size.startsWith('w-') ? props.size : 'w-40'; // Custom size or default
  }
});

// Calculate version text size based on logo size
const versionTextSize = computed(() => {
  switch (props.size) {
    case 'xs': return 'text-xs';
    case 'sm': return 'text-xs';
    case 'md': return 'text-sm';
    case 'lg': return 'text-base';
    case 'xl': return 'text-lg';
    default: return 'text-sm';
  }
});
</script>

<template>
  <div :class="['flex flex-col items-center justify-center', containerClass]">
    <div class="flex items-center">
      <img 
        src="~/assets/img/s2.png" 
        :alt="alt" 
        :class="[iconSize, 'mx-auto', props.showText ? 'me-3' : '', iconClass]" 
      />
      <div v-if="showText" class="flex flex-col">
        <img 
          src="~/assets/img/stufio_light.png" 
          :alt="alt" 
          :class="[textSize, 'mx-auto', textClass]" 
        />
        <div 
          v-if="showVersion" 
          :class="[
            'text-left text-gray-500 mt-1', 
            versionTextSize, 
            versionClass
          ]"
        >
          {{ versionText }}
        </div>
      </div>
    </div>
  </div>
</template>