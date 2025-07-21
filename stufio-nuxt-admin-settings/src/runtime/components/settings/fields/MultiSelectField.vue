<script setup lang="ts">
import { computed } from 'vue';
import { type Setting } from '../../../types';
import { 
  FormItem, FormLabel, FormControl, FormDescription, FormMessage 
} from '../../ui/form';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '../../ui/select';
import { MultiSelect } from '../../ui/multi-select';

const props = defineProps({
  setting: {
    type: Object as () => Setting,
    required: true
  },
  modelValue: {
    type: Array,
    default: () => []
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
</script>

<template>
  <FormItem>
    <FormLabel>{{ setting.label }}</FormLabel>
    <MultiSelect
      v-bind="componentField"
      :options="setting.options"
      :disabled="disabled"
      :placeholder="setting.placeholder || 'Select options'"
    />
    <FormDescription v-if="setting.description">
      {{ setting.description }}
    </FormDescription>
    <FormMessage />
  </FormItem>
</template>