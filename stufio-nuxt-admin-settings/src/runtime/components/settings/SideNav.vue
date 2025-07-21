<script setup lang="ts">
import { 
  Settings, Palette, Bell, User, Laptop, Database, Shield, 
  Code, Globe, FileText, ExternalLink 
} from 'lucide-vue-next';
import Skeleton from '../ui/skeleton/Skeleton.vue';

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  activeItem: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:activeItem']);

// Map of icon strings to Lucide components
const iconMap = {
  'settings': Settings,
  'palette': Palette,
  'bell': Bell,
  'user': User,
  'laptop': Laptop,
  'database': Database,
  'shield': Shield,
  'code': Code,
  'globe': Globe,
  'file-text': FileText,
  'external-link': ExternalLink
};

// Resolve icon component from string or use default
const getIcon = (iconName) => {
  if (!iconName) return Settings;
  return iconMap[iconName] || Settings;
};

// Handle item click
const handleItemClick = (itemId) => {
  emit('update:activeItem', itemId);
};
</script>

<template>
  <div class="p-4">
    <!-- Loading skeleton -->
    <nav v-if="loading" class="space-y-2">
      <div v-for="i in 5" :key="i" class="flex items-center gap-3 rounded-md px-3 py-2">
        <Skeleton class="h-4 w-4 rounded-full" />
        <Skeleton class="h-4 w-24" />
      </div>
    </nav>
    
    <!-- Regular navigation -->
    <nav v-else class="space-y-1">
      <button v-for="item in items" :key="item.id" @click="handleItemClick(item.id)"
        class="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors" :class="{
          'bg-primary text-primary-foreground': activeItem === item.id,
          'text-muted-foreground hover:text-foreground hover:bg-muted': activeItem !== item.id
        }">
        <component :is="getIcon(item.icon)" class="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{{ item.label }}</span>
      </button>
    </nav>
  </div>
</template>