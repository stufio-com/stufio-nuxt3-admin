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
import { Checkbox } from '../../ui/checkbox';

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
  <FormItem class="flex flex-row items-start space-x-3 space-y-0">
    <FormControl>
      <Checkbox 
        :model-value="modelValue" 
        @update:model-value="emit('update:modelValue', $event)" 
        :disabled="disabled"
        :class="{ 'opacity-70': disabled }" 
      />
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
</template>