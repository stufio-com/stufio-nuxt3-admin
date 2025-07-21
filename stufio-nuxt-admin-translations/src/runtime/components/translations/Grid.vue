<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTranslationsStore } from '../../stores/translations';
import { Pencil } from 'lucide-vue-next';
import { Skeleton } from '../ui/skeleton';
import TranslationsFilter from './TranslationsFilter.vue';
import NoResults from './NoResults.vue';
import TranslationsEditModal from './EditModal.vue';

const props = defineProps({
  locale: {
    type: String,
    required: true
  }
});

const translationsStore = useTranslationsStore();
const searchQuery = ref('');

const filteredEntries = computed(() => {
  return translationsStore.filteredEntries;
});

const loading = computed(() => translationsStore.loading);

// Load translations when component mounts
onMounted(async () => {
  await translationsStore.fetchTranslations(props.locale);
});

// Filter handlers
const handleFilterChanged = (filter) => {
  // This is handled by the TranslationsFilter component internally
  // but we can add additional logic here if needed
};

const clearFilters = () => {
  searchQuery.value = '';
  translationsStore.clearFilters();
};

// Edit translation
const editTranslation = (entry) => {
  translationsStore.editTranslation(entry);
};
</script>

<template>
  <div class="translations-grid">
    <!-- Search and filters -->
    <TranslationsFilter 
      v-model:searchValue="searchQuery"
      @filter-changed="handleFilterChanged"
      @clear-filters="clearFilters"
    />
    
    <!-- Loading state -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 10" :key="i" class="flex items-center justify-between p-4 border rounded-lg">
        <div class="flex flex-col gap-2 flex-1">
          <Skeleton class="h-5 w-1/3" />
          <Skeleton class="h-4 w-2/3" />
        </div>
        <Skeleton class="h-8 w-8 rounded-md" />
      </div>
    </div>
    
    <!-- Empty state -->
    <NoResults 
      v-else-if="filteredEntries.length === 0"
      :showClearFilters="translationsStore.hasFilters"
      @clear-filters="clearFilters"
    />
    
    <!-- Translations grid -->
    <div v-else class="grid grid-cols-1 gap-4">
      <div 
        v-for="entry in filteredEntries" 
        :key="`${entry.locale}-${entry.key}`"
        class="p-4 border rounded-lg flex justify-between items-start"
        :class="{
          'border-warning/50 bg-warning/5': !entry.value,
          'border-info/50 bg-info/5': entry.modified
        }"
      >
        <div>
          <div class="text-sm font-mono text-muted-foreground mb-1">{{ entry.key }}</div>
          <div v-if="entry.value" class="text-foreground">{{ entry.value }}</div>
          <div v-else class="text-warning italic">Missing translation</div>
          <div class="text-xs text-muted-foreground mt-2">Module: {{ entry.module }}</div>
        </div>
        <button 
          @click="editTranslation(entry)"
          class="p-2 rounded-md hover:bg-secondary text-muted-foreground"
        >
          <Pencil class="h-4 w-4" />
        </button>
      </div>
    </div>
    
    <!-- Edit Modal (will be shown when translationsStore.showEditModal is true) -->
    <TranslationsEditModal />
  </div>
</template>