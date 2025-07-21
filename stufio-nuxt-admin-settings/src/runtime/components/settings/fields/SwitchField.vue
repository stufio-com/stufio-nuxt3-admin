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
import { Switch } from '../../ui/switch';

const props = defineProps({
  setting: {
    type: Object as () => Setting,
    required: true
  },
  modelValue: {
    type: Boolean,
    default: false
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
</script>

<template>
  <FormItem class="flex flex-row items-center justify-between rounded-lg border p-4">
    <div class="space-y-0.5">
      <FormLabel class="text-base">{{ setting.label }}</FormLabel>
      <FormDescription v-if="setting.description">
        {{ setting.description }}
      </FormDescription>
    </div>
    <FormControl>
      <Switch 
        :model-value="modelValue" 
        @update:model-value="emit('update:modelValue', $event)" 
        :disabled="disabled"
        :class="{ 'opacity-70': disabled }" 
      />
    </FormControl>
    <FormMessage />
  </FormItem>
</template>