<script setup lang="ts">
import { ref, watch } from 'vue';
import { useTranslationsStore } from '../../stores/translations';
import { X, Save, AlertTriangle } from 'lucide-vue-next';

const translationsStore = useTranslationsStore();
const editedValue = ref('');
const saving = ref(false);
const error = ref('');

// Watch for changes in the editing entry
watch(() => translationsStore.editingEntry, (newEntry) => {
  if (newEntry) {
    editedValue.value = newEntry.value || '';
  }
}, { immediate: true });

// Close the modal
const closeModal = () => {
  translationsStore.showEditModal = false;
  translationsStore.editingEntry = null;
};

// Save the translation
const saveTranslation = async () => {
  if (!translationsStore.editingEntry) return;
  
  saving.value = true;
  error.value = '';
  
  try {
    const entry = {
      ...translationsStore.editingEntry,
      value: editedValue.value,
      modified: true
    };
    
    await translationsStore.saveTranslation(entry);
    closeModal();
  } catch (err: any) {
    error.value = err.message || 'Failed to save translation';
  } finally {
    saving.value = false;
  }
};

// Check if modal should be shown
const isVisible = computed(() => 
  translationsStore.showEditModal && translationsStore.editingEntry !== null
);
</script>

<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-background rounded-lg w-full max-w-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-semibold">Edit Translation</h3>
        <button @click="closeModal" class="text-muted-foreground hover:text-foreground">
          <X class="h-5 w-5" />
        </button>
      </div>
      
      <div v-if="translationsStore.editingEntry" class="space-y-4">
        <div>
          <label class="text-sm font-medium block mb-1">Key</label>
          <div class="font-mono text-sm border p-2 rounded-md bg-secondary/30">
            {{ translationsStore.editingEntry.key }}
          </div>
        </div>
        
        <div>
          <label class="text-sm font-medium block mb-1">Value</label>
          <textarea 
            v-model="editedValue" 
            class="w-full p-2 h-24 border rounded-md bg-background"
            :placeholder="`Enter translation for ${translationsStore.editingEntry.locale}`"
          ></textarea>
        </div>
        
        <div class="text-xs text-muted-foreground">
          <span class="font-medium">Module:</span> {{ translationsStore.editingEntry.module }}
          <span class="mx-2">•</span>
          <span class="font-medium">Locale:</span> {{ translationsStore.editingEntry.locale }}
        </div>
        
        <div v-if="error" class="bg-destructive/10 text-destructive p-3 rounded-md flex items-start">
          <AlertTriangle class="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{{ error }}</span>
        </div>
      </div>
      
      <div class="flex justify-end gap-3 mt-6">
        <button 
          @click="closeModal"
          class="px-4 py-2 border rounded-md text-sm"
        >
          Cancel
        </button>
        <button 
          @click="saveTranslation"
          class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm flex items-center"
          :disabled="saving"
        >
          <Save class="h-4 w-4 mr-2" v-if="!saving" />
          <span v-if="saving">Saving...</span>
          <span v-else>Save Changes</span>
        </button>
      </div>
    </div>
  // filepath: /Users/iharfinchuk/Projects/nameniac_com/stufio-nuxt3-admin/stufio-nuxt-admin-translations/src/runtime/components/translations/EditModal.vue
<script setup lang="ts">
import { ref, watch } from 'vue';
import { useTranslationsStore } from '../../stores/translations';
import { X, Save, AlertTriangle } from 'lucide-vue-next';

const translationsStore = useTranslationsStore();
const editedValue = ref('');
const saving = ref(false);
const error = ref('');

// Watch for changes in the editing entry
watch(() => translationsStore.editingEntry, (newEntry) => {
  if (newEntry) {
    editedValue.value = newEntry.value || '';
  }
}, { immediate: true });

// Close the modal
const closeModal = () => {
  translationsStore.showEditModal = false;
  translationsStore.editingEntry = null;
};

// Save the translation
const saveTranslation = async () => {
  if (!translationsStore.editingEntry) return;
  
  saving.value = true;
  error.value = '';
  
  try {
    const entry = {
      ...translationsStore.editingEntry,
      value: editedValue.value,
      modified: true
    };
    
    await translationsStore.saveTranslation(entry);
    closeModal();
  } catch (err: any) {
    error.value = err.message || 'Failed to save translation';
  } finally {
    saving.value = false;
  }
};

// Check if modal should be shown
const isVisible = computed(() => 
  translationsStore.showEditModal && translationsStore.editingEntry !== null
);
</script>

<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-background rounded-lg w-full max-w-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-semibold">Edit Translation</h3>
        <button @click="closeModal" class="text-muted-foreground hover:text-foreground">
          <X class="h-5 w-5" />
        </button>
      </div>
      
      <div v-if="translationsStore.editingEntry" class="space-y-4">
        <div>
          <label class="text-sm font-medium block mb-1">Key</label>
          <div class="font-mono text-sm border p-2 rounded-md bg-secondary/30">
            {{ translationsStore.editingEntry.key }}
          </div>
        </div>
        
        <div>
          <label class="text-sm font-medium block mb-1">Value</label>
          <textarea 
            v-model="editedValue" 
            class="w-full p-2 h-24 border rounded-md bg-background"
            :placeholder="`Enter translation for ${translationsStore.editingEntry.locale}`"
          ></textarea>
        </div>
        
        <div class="text-xs text-muted-foreground">
          <span class="font-medium">Module:</span> {{ translationsStore.editingEntry.module }}
          <span class="mx-2">•</span>
          <span class="font-medium">Locale:</span> {{ translationsStore.editingEntry.locale }}
        </div>
        
        <div v-if="error" class="bg-destructive/10 text-destructive p-3 rounded-md flex items-start">
          <AlertTriangle class="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{{ error }}</span>
        </div>
      </div>
      
      <div class="flex justify-end gap-3 mt-6">
        <button 
          @click="closeModal"
          class="px-4 py-2 border rounded-md text-sm"
        >
          Cancel
        </button>
        <button 
          @click="saveTranslation"
          class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm flex items-center"
          :disabled="saving"
        >
          <Save class="h-4 w-4 mr-2" v-if="!saving" />
          <span v-if="saving">Saving...</span>
          <span v-else>Save Changes</span>
        </button>
      </div>
    </div>
  </div>
</template>