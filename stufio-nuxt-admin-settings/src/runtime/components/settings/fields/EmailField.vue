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
    default: ''
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
    <FormControl>
      <Input 
        type="email" 
        :placeholder="setting.placeholder || 'Email address'" 
        v-bind="componentField" 
        :disabled="disabled"
        :class="inputClass" 
      />
    </FormControl>
    <FormDescription v-if="setting.description">
      {{ setting.description }}
    </FormDescription>
    <FormMessage />
  </FormItem>
</template>