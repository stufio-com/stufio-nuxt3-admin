<script setup lang="ts">
import { computed } from 'vue';
import { type Setting } from '../../../types';
import {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage
} from '../../ui/form';
import { Input } from '../../ui/input';

const props = defineProps({
  setting: {
    type: Object as () => Setting,
    required: true
  },
  modelValue: {
    type: String,
    default: '#ffffff'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  componentField: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

const inputClass = computed(() => ({
  'opacity-70': props.disabled
}));
</script>

<template>
  <FormItem>
    <FormLabel>{{ setting.label }}</FormLabel>
    <div class="flex items-center gap-2">
      <div class="h-9 w-9 rounded-md border" :style="{ backgroundColor: modelValue || '#ffffff' }"></div>
      <FormControl>
        <Input 
          type="color" 
          class="h-9 w-24" 
          v-bind="componentField" 
          :disabled="disabled"
          :class="inputClass" 
        />
      </FormControl>
    </div>
    <FormDescription v-if="setting.description">
      {{ setting.description }}
    </FormDescription>
    <FormMessage />
  </FormItem>
</template>