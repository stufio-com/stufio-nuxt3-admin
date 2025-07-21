<script setup lang="ts">
import { computed } from 'vue';
import { type Setting } from '../../../types';
import { format } from 'date-fns';
import { cn } from '../../../lib/utils';
import {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage
} from '../../ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../ui/popover';
import { Button } from '../../ui/button';
import { Calendar } from '../../ui/calendar';
import { CalendarIcon } from 'lucide-vue-next';

const props = defineProps({
  setting: {
    type: Object as () => Setting,
    required: true
  },
  modelValue: {
    type: Date,
    default: null
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

// Format date for display
const formatDate = (date) => {
  if (!date) return '';
  return format(date, 'PPP');
};
</script>

<template>
  <FormItem class="flex flex-col">
    <FormLabel>{{ setting.label }}</FormLabel>
    <Popover>
      <PopoverTrigger as-child>
        <FormControl>
          <Button variant="outline" :class="cn(
            'w-full pl-3 text-left font-normal',
            !modelValue && 'text-muted-foreground',
          )" :disabled="disabled">
            <span v-if="modelValue">
              {{ formatDate(modelValue) }}
            </span>
            <span v-else>{{ setting.placeholder || 'Pick a date' }}</span>
            <CalendarIcon class="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent class="w-auto p-0" align="start">
        <Calendar 
          :model-value="modelValue" 
          @update:model-value="emit('update:modelValue', $event)" 
        />
      </PopoverContent>
    </Popover>
    <FormDescription v-if="setting.description">
      {{ setting.description }}
    </FormDescription>
    <FormMessage />
  </FormItem>
  <input type="hidden" v-bind="componentField">
</template>