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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../ui/select';

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
</script>

<template>
  <FormItem>
    <FormLabel>{{ setting.label }}</FormLabel>
    <Select v-bind="componentField" :disabled="disabled">
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
</template>