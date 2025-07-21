<script setup lang="ts">
import { Globe } from 'lucide-vue-next';

defineProps({
  title: {
    type: String,
    default: 'No translations found'
  },
  message: {
    type: String,
    default: 'Try changing your filters or switching locale'
  },
  icon: {
    type: Object,
    default: () => Globe
  },
  showClearFilters: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['clear-filters']);

const handleClearFilters = () => {
  emit('clear-filters');
};
</script>

<template>
  <div class="text-center p-8 border rounded-lg">
    <component :is="icon" class="h-12 w-12 mx-auto text-muted-foreground" />
    <h3 class="mt-4 text-lg font-semibold">{{ title }}</h3>
    <p class="text-muted-foreground">{{ message }}</p>
    <button 
      v-if="showClearFilters"
      @click="handleClearFilters"
      class="mt-4 px-4 py-2 bg-secondary rounded-md text-sm font-medium"
    >
      Clear filters
    </button>
  </div>
</template>