<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useSettingsStore } from '../../stores/settings';
import { useSettingsSidebarStore } from '../../stores/settingsSidebar';
import * as z from 'zod';
import { toast } from '../ui/toast';
import { toTypedSchema } from '@vee-validate/zod';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import Skeleton from '../ui/skeleton/Skeleton.vue';
import FieldRenderer from './FieldRenderer.vue';
import { Loader2 } from 'lucide-vue-next';

// Form components
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '../ui/form';

// Props for the component
const props = defineProps({
  module: {
    type: String,
    default: 'core'
  },
  group: {
    type: String,
    required: true
  },
  subgroup: {
    type: String,
    default: null
  },
  isLoaded: {
    type: Boolean,
    default: false
  }
});

// Add a form reference
const formInstance = ref(null);
const formKey = ref(0); // For forcing re-rendering

// State and refs
const loading = ref(true);
const saving = ref(false);
const formSchema = ref(null);
const initialValues = ref({});

// Get the stores
const settingsStore = useSettingsStore();
const sidebarStore = useSettingsSidebarStore();

// Get filtered settings based on group and subgroup
const filteredSettings = computed(() => {
  console.log("Filtering settings for", props.group, props.subgroup);
  console.log("Sidebar store:", sidebarStore.filteredSettings(props.group, props.subgroup));
  return sidebarStore.filteredSettings(props.group, props.subgroup);
});

// Get the keys for the filtered settings
const settingKeys = computed(() => {
  return filteredSettings.value.map(setting => setting.key);
});

// Create Zod schema for form validation
const buildZodSchema = () => {
  const schemaObj = {};

  filteredSettings.value.forEach((setting) => {
    let fieldSchema;

    // Build field schema based on type
    switch (setting.type) {
      case 'boolean':
      case 'switch':
        fieldSchema = z.boolean();
        break;
      case 'number':
        fieldSchema = z.number();
        if (setting.min !== undefined) fieldSchema = fieldSchema.min(setting.min);
        if (setting.max !== undefined) fieldSchema = fieldSchema.max(setting.max);
        break;
      case 'email':
        fieldSchema = z.string().email();
        break;
      case 'url':
        fieldSchema = z.string().url();
        break;
      case 'select':
        if (setting.options) {
          fieldSchema = z.enum(setting.options.map(o => o.value));
        } else {
          fieldSchema = z.string();
        }
        break;
      case 'radio':
        if (setting.options) {
          fieldSchema = z.enum(setting.options.map(o => o.value));
        } else {
          fieldSchema = z.string();
        }
        break;
      case 'multi_select':
        fieldSchema = z.array(z.string());
        break;
      case 'date':
        fieldSchema = z.date().optional();
        break;
      case 'color':
        fieldSchema = z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);
        break;
      case 'file':
        fieldSchema = z.any(); // File handling requires special logic
        break;
      default:
        fieldSchema = z.string();
        if (setting.min !== undefined) fieldSchema = fieldSchema.min(setting.min);
        if (setting.max !== undefined) fieldSchema = fieldSchema.max(setting.max);
    }

    // Add description if available
    if (setting.description) {
      fieldSchema = fieldSchema.describe(setting.description);
    }

    // Make optional if not required
    if (!setting.required) {
      fieldSchema = fieldSchema.optional();
    }

    schemaObj[setting.key] = fieldSchema;
  });

  return Object.keys(schemaObj).length > 0 ? toTypedSchema(z.object(schemaObj)) : null;
};

// Add disabled state
const fieldsDisabled = computed(() => {
  return loading.value || !props.isLoaded || settingsStore.loading;
});

// Add a check for whether we have values
const hasValues = computed(() => {
  return Object.keys(initialValues.value).length > 0;
});

// Modify loadSettings function
const loadSettings = async () => {
  loading.value = true;

  try {
    // Wait for settings to be loaded in the store
    if (settingsStore.loading) {
      console.log("Store is still loading, waiting...");
      // We'll rely on the watcher to pick up changes when loading completes
      return;
    }

    console.log("Preparing form values from store...");
    // Prepare the form with the pre-loaded values
    const formValues = {};

    // Map store values to form values
    settingKeys.value.forEach(key => {
      if (settingsStore.values[key] !== undefined) {
        // Convert date strings to Date objects if needed
        const setting = filteredSettings.value.find(s => s.key === key);
        if (setting && setting.type === 'date' && typeof settingsStore.values[key] === 'string') {
          formValues[key] = new Date(settingsStore.values[key]);
        } else {
          formValues[key] = settingsStore.values[key];
        }
        console.log(`Setting form value for ${key}:`, formValues[key]);
      } else {
        console.log(`No value found for key ${key}`);
      }
    });

    // Only update initialValues if we have values to avoid empty forms
    if (Object.keys(formValues).length > 0) {
      initialValues.value = formValues;

      // Increment key to force re-render the form with new initial values
      formKey.value++;

      // Build schema
      formSchema.value = buildZodSchema();
    } else {
      console.warn("No values found in store for current settings keys.");
    }
  } catch (error) {
    console.error("Failed to prepare settings form:", error);
    toast({
      title: "Error",
      description: "Failed to prepare settings form. Please try again.",
      variant: "destructive"
    });
  } finally {
    loading.value = false;
  }
};

// Save settings to API
const onSubmit = async (values) => {
  saving.value = true;

  try {
    // Find changed values
    const changedSettings = [];

    for (const [key, value] of Object.entries(values)) {
      // Skip if value hasn't changed
      const originalVal = initialValues.value[key];
      let hasChanged = false;

      // Handle date comparisons specially
      if (value instanceof Date && originalVal instanceof Date) {
        hasChanged = value.getTime() !== originalVal.getTime();
      } else {
        hasChanged = JSON.stringify(value) !== JSON.stringify(originalVal);
      }

      if (hasChanged) {
        changedSettings.push({
          key,
          value,
          module: props.module
        });
      }
    }

    if (changedSettings.length > 0) {
      // Save changes using the settings store
      await settingsStore.saveSettings(changedSettings);

      // Update initial values to reflect saved state
      initialValues.value = { ...values };

      toast({
        title: "Success",
        description: "Settings saved successfully.",
      });
    } else {
      toast({
        title: "Info",
        description: "No changes to save.",
      });
    }
  } catch (error) {
    console.error("Failed to save settings:", error);
    toast({
      title: "Error",
      description: "Failed to save settings. Please try again.",
      variant: "destructive"
    });
  } finally {
    saving.value = false;
  }
};

// Format date for display
const formatDate = (date) => {
  if (!date) return '';
  return format(date, 'PPP');
};

// Modify the watch to respond to changes in store loading state as well
watch(
  [
    () => props.group,
    () => props.subgroup,
    () => props.module,
    () => sidebarStore.settingsSchema,
    () => props.isLoaded,
    () => settingsStore.loading // Also watch loading state changes
  ],
  ([group, subgroup, module, schema, isLoaded, storeLoading]) => {
    console.log(`Form watch triggered: isLoaded=${isLoaded}, storeLoading=${storeLoading}`);
    if (schema && isLoaded && !storeLoading) {
      console.log("Reloading form settings...", group, subgroup, module);
      loadSettings();
    }
  }
);

// Add a direct watch specifically for changes in values
watch(
  () => settingsStore.values,
  (newValues, oldValues) => {
    if (props.isLoaded && !settingsStore.loading && Object.keys(newValues).length > 0) {
      // Check if the values we care about changed
      const relevantKeysChanged = settingKeys.value.some(key =>
        newValues[key] !== oldValues[key]
      );

      if (relevantKeysChanged) {
        console.log("Settings values changed, forcing form reload...");
        forceReloadForm();
      }
    }
  },
  { deep: true } // Important for deep object changes
);

// Add an additional check on isLoaded change
watch(
  () => props.isLoaded,
  (isLoaded) => {
    if (isLoaded && !loading.value && !settingsStore.loading) {
      // When tab becomes loaded, force a reload
      console.log("Tab became active, forcing reload...");
      forceReloadForm();
    }
  }
);

// Load settings on mount
onMounted(() => {
  if (sidebarStore.settingsSchema) {
    console.log("Loading settings...", props.group, props.subgroup, props.module);
    loadSettings();
  }
});

// Add this method to force reload when needed
const forceReloadForm = async () => {
  console.log("Forcing form reload with current values");
  formKey.value++;
  await nextTick();
  loadSettings();
};
</script>

<template>
  <div class="settings-form">
    <!-- No settings available -->
    <div v-if="!filteredSettings.length" class="text-center py-8">
      <p class="text-muted-foreground">No settings available for this section.</p>
    </div>

    <!-- Settings form -->
    <div v-else-if="formSchema">
      <!-- Add loading overlay when fields should be disabled -->
      <div v-if="fieldsDisabled || settingsStore.loading" class="relative">
        <div
          class="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-md">
          <div v-if="settingsStore.loading" class="flex items-center bg-white/80 px-4 py-2 rounded-full shadow">
            <Loader2 class="h-4 w-4 mr-2 animate-spin" />
            <span class="text-sm">Loading settings...</span>
          </div>
        </div>
      </div>

      <!-- Use key to force re-creation on value changes -->
      <Form ref="formInstance" :key="formKey" :validation-schema="formSchema" :initial-values="initialValues"
        @submit="onSubmit" v-slot="{ setFieldValue, values }" class="space-y-6">
        <!-- Debug panel -->
        <div v-if="Object.keys(values).length === 0" class="p-4 bg-amber-50 text-amber-800 rounded-md mb-4">
          <p class="text-sm font-medium">No values loaded</p>
          <p class="text-xs mt-1">Try refreshing the page or reloading values</p>
          <button @click="forceReloadForm" class="text-xs bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded mt-2">
            Reload values
          </button>
        </div>

        <!-- Use FieldRenderer for all fields -->
        <template v-for="setting in filteredSettings" :key="setting.key">
          <FormField v-slot="{ componentField, value }" :name="setting.key">
            <FieldRenderer 
              :setting="setting"
              :modelValue="value"
              :disabled="fieldsDisabled"
              :componentField="componentField"
            />
          </FormField>
        </template>

        <!-- Submit buttons -->
        <div class="flex justify-end space-x-3 mt-8">
          <button
            type="button"
            class="px-4 py-2 border rounded-md text-sm"
            @click="forceReloadForm"
            :disabled="loading || saving || fieldsDisabled"
          >
            Reset
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm flex items-center"
            :disabled="saving || fieldsDisabled || Object.keys(values).length === 0"
          >
            <span v-if="saving" class="mr-2">
              <Loader2 class="h-4 w-4 animate-spin" />
            </span>
            <span>{{ saving ? 'Saving...' : 'Save changes' }}</span>
          </button>
        </div>
      </Form>
    </div>
  </div>
</template>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>