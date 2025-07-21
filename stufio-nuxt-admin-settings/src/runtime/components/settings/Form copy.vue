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
// Form components
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { Calendar } from '../ui/calendar';
import {
  RadioGroup,
  RadioGroupItem,
} from '../ui/radio-group';
import { CalendarIcon, Loader2 } from 'lucide-vue-next';

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
    <!-- Loading state -->
    <!-- <div v-if="loading || !isLoaded" class="space-y-6 relative">
      <div
        class="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-md">
        <div v-if="settingsStore.loading" class="flex items-center bg-white/80 px-4 py-2 rounded-full shadow">
          <Loader2 class="h-4 w-4 mr-2 animate-spin" />
          <span class="text-sm">Loading settings...</span>
        </div>
      </div>
      <div v-for="i in 3" :key="i" class="space-y-2">
        <Skeleton class="h-4 w-24" />
        <Skeleton class="h-10 w-full" />
        <Skeleton class="h-3 w-3/4" />
      </div>

      <div class="flex justify-end space-x-3 mt-8">
        <Skeleton class="h-9 w-20" />
        <Skeleton class="h-9 w-32" />
      </div>
    </div> -->

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

        <!-- String Input -->
        <template v-for="setting in filteredSettings" :key="setting.key">
          <FormField v-if="setting.type === 'string'" v-slot="{ componentField }" :name="setting.key">
            <FormItem>
              <FormLabel>{{ setting.label }}</FormLabel>
              <FormControl>
                <Input type="text" :placeholder="setting.placeholder" v-bind="componentField" :disabled="fieldsDisabled"
                  :class="{ 'opacity-70': fieldsDisabled }" />
              </FormControl>
              <FormDescription v-if="setting.description">
                {{ setting.description }}
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Number Input -->
          <FormField v-else-if="setting.type === 'number'" v-slot="{ componentField }" :name="setting.key">
            <FormItem>
              <FormLabel>{{ setting.label }}</FormLabel>
              <FormControl>
                <Input type="number" :placeholder="setting.placeholder" :min="setting.min" :max="setting.max"
                  v-bind="componentField" :disabled="fieldsDisabled" :class="{ 'opacity-70': fieldsDisabled }" />
              </FormControl>
              <FormDescription v-if="setting.description">
                {{ setting.description }}
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Email Input -->
          <FormField v-else-if="setting.type === 'email'" v-slot="{ componentField }" :name="setting.key">
            <FormItem>
              <FormLabel>{{ setting.label }}</FormLabel>
              <FormControl>
                <Input type="email" :placeholder="setting.placeholder || 'Email address'" v-bind="componentField"
                  :disabled="fieldsDisabled" :class="{ 'opacity-70': fieldsDisabled }" />
              </FormControl>
              <FormDescription v-if="setting.description">
                {{ setting.description }}
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- URL Input -->
          <FormField v-else-if="setting.type === 'url'" v-slot="{ componentField }" :name="setting.key">
            <FormItem>
              <FormLabel>{{ setting.label }}</FormLabel>
              <FormControl>
                <Input type="url" :placeholder="setting.placeholder || 'https://example.com'" v-bind="componentField"
                  :disabled="fieldsDisabled" :class="{ 'opacity-70': fieldsDisabled }" />
              </FormControl>
              <FormDescription v-if="setting.description">
                {{ setting.description }}
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Password Input -->
          <FormField v-else-if="setting.type === 'password'" v-slot="{ componentField }" :name="setting.key">
            <FormItem>
              <FormLabel>{{ setting.label }}</FormLabel>
              <FormControl>
                <Input type="password" :placeholder="setting.placeholder || '••••••••'" v-bind="componentField"
                  :disabled="fieldsDisabled" :class="{ 'opacity-70': fieldsDisabled }" />
              </FormControl>
              <FormDescription v-if="setting.description">
                {{ setting.description }}
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Text Area -->
          <FormField v-else-if="setting.type === 'text'" v-slot="{ componentField }" :name="setting.key">
            <FormItem>
              <FormLabel>{{ setting.label }}</FormLabel>
              <FormControl>
                <Textarea :placeholder="setting.placeholder" rows="4" v-bind="componentField" :disabled="fieldsDisabled"
                  :class="{ 'opacity-70': fieldsDisabled }" />
              </FormControl>
              <FormDescription v-if="setting.description">
                {{ setting.description }}
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Select / Dropdown -->
          <FormField v-else-if="setting.type === 'select'" v-slot="{ componentField }" :name="setting.key">
            <FormItem>
              <FormLabel>{{ setting.label }}</FormLabel>
              <Select v-bind="componentField" :disabled="fieldsDisabled">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue :placeholder="setting.placeholder || 'Select an option'" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem v-for="option in setting.options" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription v-if="setting.description">
                {{ setting.description }}
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Date Picker -->
          <FormField v-else-if="setting.type === 'date'" v-slot="{ field, value }" :name="setting.key">
            <FormItem class="flex flex-col">
              <FormLabel>{{ setting.label }}</FormLabel>
              <Popover>
                <PopoverTrigger as-child>
                  <FormControl>
                    <Button variant="outline" :class="cn(
                      'w-full pl-3 text-left font-normal',
                      !value && 'text-muted-foreground',
                    )" :disabled="fieldsDisabled">
                      <span v-if="value">
                        {{ formatDate(value) }}
                      </span>
                      <span v-else>{{ setting.placeholder || 'Pick a date' }}</span>
                      <CalendarIcon class="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent class="w-auto p-0" align="start">
                  <Calendar :model-value="value" @update:model-value="(date) => {
                    if (date) {
                      setFieldValue(setting.key, date)
                    }
                  }" />
                </PopoverContent>
              </Popover>
              <FormDescription v-if="setting.description">
                {{ setting.description }}
              </FormDescription>
              <FormMessage />
            </FormItem>
            <input type="hidden" v-bind="field">
          </FormField>

          <!-- Color Picker -->
          <FormField v-else-if="setting.type === 'color'" v-slot="{ componentField, value }" :name="setting.key">
            <FormItem>
              <FormLabel>{{ setting.label }}</FormLabel>
              <div class="flex items-center gap-2">
                <div class="h-9 w-9 rounded-md border" :style="{ backgroundColor: value || '#ffffff' }"></div>
                <FormControl>
                  <Input type="color" class="h-9 w-24" v-bind="componentField" :disabled="fieldsDisabled"
                    :class="{ 'opacity-70': fieldsDisabled }" />
                </FormControl>
              </div>
              <FormDescription v-if="setting.description">
                {{ setting.description }}
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Switch -->
          <FormField v-else-if="setting.type === 'switch' || setting.type === 'boolean'"
            v-slot="{ handleChange, value }" type="checkbox" :name="setting.key">
            <FormItem class="flex flex-row items-center justify-between rounded-lg border p-4">
              <div class="space-y-0.5">
                <FormLabel class="text-base">{{ setting.label }}</FormLabel>
                <FormDescription v-if="setting.description">
                  {{ setting.description }}
                </FormDescription>
              </div>
              <FormControl>
                <Switch :model-value="value" @update:model-value="handleChange" :disabled="fieldsDisabled"
                  :class="{ 'opacity-70': fieldsDisabled }" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Radio Group -->
          <FormField v-else-if="setting.type === 'radio'" v-slot="{ componentField }" type="radio" :name="setting.key">
            <FormItem class="space-y-3">
              <FormLabel>{{ setting.label }}</FormLabel>
              <FormControl>
                <RadioGroup class="flex flex-col space-y-1" v-bind="componentField" :disabled="fieldsDisabled"
                  :class="{ 'opacity-70': fieldsDisabled }">
                  <FormItem v-for="option in setting.options" :key="option.value"
                    class="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem :value="option.value" />
                    </FormControl>
                    <FormLabel class="font-normal">
                      {{ option.label }}
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormDescription v-if="setting.description">
                {{ setting.description }}
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Checkbox -->
          <FormField v-else-if="setting.type === 'checkbox'" v-slot="{ handleChange, value }" type="checkbox"
            :name="setting.key">
            <FormItem class="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox :model-value="value" @update:model-value="handleChange" :disabled="fieldsDisabled"
                  :class="{ 'opacity-70': fieldsDisabled }" />
              </FormControl>
              <div class="space-y-1 leading-none">
                <FormLabel>
                  {{ setting.label }}
                </FormLabel>
                <FormDescription v-if="setting.description">
                  {{ setting.description }}
                </FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Default to String Input -->
          <FormField v-else v-slot="{ componentField }" :name="setting.key">
            <FormItem>
              <FormLabel>{{ setting.label }}</FormLabel>
              <FormControl>
                <Input type="text" :placeholder="setting.placeholder" v-bind="componentField" :disabled="fieldsDisabled"
                  :class="{ 'opacity-70': fieldsDisabled }" />
              </FormControl>
              <FormDescription v-if="setting.description">
                {{ setting.description }}
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>
        </template>

        <div class="flex justify-end space-x-3 mt-8">
          <Button type="button" variant="outline" @click="forceReloadForm"
            :disabled="loading || saving || fieldsDisabled">
            Reset
          </Button>
          <Button type="submit" :disabled="saving || fieldsDisabled || Object.keys(values).length === 0">
            <Loader2 v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </Button>
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