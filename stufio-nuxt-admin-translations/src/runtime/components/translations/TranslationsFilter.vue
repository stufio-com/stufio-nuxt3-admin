<script setup lang="ts">
import { ref, watch, defineEmits } from 'vue';
import { useTranslationsStore } from '../../stores/translations';
import { Search, X } from 'lucide-vue-next';

const props = defineProps({
  searchValue: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:searchValue', 'filter-changed', 'clear-filters']);

const translationsStore = useTranslationsStore();
const searchQuery = ref(props.searchValue);

// Sync searchQuery with parent
watch(() => props.searchValue, (newValue) => {
  searchQuery.value = newValue;
});

// Emit search value changes
watch(() => searchQuery.value, (newValue) => {
  emit('update:searchValue', newValue);
});

// Filter handlers
const handleSearch = (e) => {
  translationsStore.setFilter('search', e.target.value);
  emit('filter-changed', { type: 'search', value: e.target.value });
};

const handleModuleChange = (e) => {
  translationsStore.setFilter('module', e.target.value);
  emit('filter-changed', { type: 'module', value: e.target.value });
};

const handleMissingToggle = (e) => {
  translationsStore.setFilter('onlyMissing', e.target.checked);
  emit('filter-changed', { type: 'onlyMissing', value: e.target.checked });
};

const handleModifiedToggle = (e) => {
  translationsStore.setFilter('onlyModified', e.target.checked);
  emit('filter-changed', { type: 'onlyModified', value: e.target.checked });
};

const clearFilters = () => {
  searchQuery.value = '';
  translationsStore.clearFilters();
  emit('clear-filters');
};
</script>

<template>
  <div class="translations-filter">
    <!-- Search and filters -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="Search translations..."
          class="pl-9 h-10 w-full rounded-md border bg-background px-3 py-2"
        />
        <button 
          v-if="searchQuery"
          @click="clearFilters"
          class="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
      
      <div class="flex gap-4">
        <select 
          @change="handleModuleChange" 
          class="h-10 rounded-md border bg-background px-3"
        >
          <option value="all">All modules</option>
          <option v-for="module in translationsStore.modules" :key="module" :value="module">
            {{ module }}
          </option>
        </select>
        
        <div class="flex items-center gap-2">
          <input 
            id="missing" 
            type="checkbox" 
            @change="handleMissingToggle" 
            class="h-4 w-4"
          />
          <label for="missing" class="text-sm">Missing only</label>
        </div>
        
        <div class="flex items-center gap-2">
          <input 
            id="modified" 
            type="checkbox" 
            @change="handleModifiedToggle" 
            class="h-4 w-4"
          />
          <label for="modified" class="text-sm">Modified only</label>
        </div>
      </div>
    </div>
    
    <!-- Stats badges -->
    <div class="flex flex-wrap gap-2 mb-4">
      <div class="bg-primary/10 text-primary text-sm py-1 px-3 rounded-full">
        {{ translationsStore.filteredEntries.length }} translations
      </div>
      <div class="bg-warning/10 text-warning text-sm py-1 px-3 rounded-full">
        {{ translationsStore.missingCount }} missing
      </div>
      <div v-if="translationsStore.modifiedCount > 0" class="bg-info/10 text-info text-sm py-1 px-3 rounded-full">
        {{ translationsStore.modifiedCount }} modified
      </div>
      <div class="ml-auto bg-success/10 text-success text-sm py-1 px-3 rounded-full">
        {{ translationsStore.progress }}% complete
      </div>
    </div>
  </div>
</template>