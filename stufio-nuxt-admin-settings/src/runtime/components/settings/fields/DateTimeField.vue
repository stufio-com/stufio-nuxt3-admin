<script setup lang="ts">
import { computed, ref } from 'vue';
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
import { CalendarIcon, Clock } from 'lucide-vue-next';
import { Input } from '../../ui/input';

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
const selectedDate = ref(props.modelValue);
const timeInput = ref('');

// Update time input when modelValue changes
if (props.modelValue) {
  timeInput.value = format(props.modelValue, 'HH:mm');
}

// Format date for display
const formatDateTime = (date) => {
  if (!date) return '';
  return format(date, 'PPP HH:mm');
};

// Handle date selection
const handleDateSelect = (date) => {
  if (!date) return;
  
  // Preserve time if it exists
  if (props.modelValue) {
    const hours = props.modelValue.getHours();
    const minutes = props.modelValue.getMinutes();
    date.setHours(hours, minutes);
  }
  
  selectedDate.value = date;
  emit('update:modelValue', date);
};

// Handle time input
const handleTimeChange = (event) => {
  const timeValue = event.target.value;
  timeInput.value = timeValue;
  
  if (!timeValue || !selectedDate.value) return;
  
  const [hours, minutes] = timeValue.split(':').map(Number);
  const newDate = new Date(selectedDate.value);
  newDate.setHours(hours || 0, minutes || 0);
  
  emit('update:modelValue', newDate);
};
</script>

<template>
  <FormItem class="flex flex-col">
    <FormLabel>{{ setting.label }}</FormLabel>
    <div class="flex gap-2">
      <Popover class="flex-1">
        <PopoverTrigger as-child>
          <FormControl>
            <Button variant="outline" :class="cn(
              'w-full pl-3 text-left font-normal',
              !modelValue && 'text-muted-foreground',
            )" :disabled="disabled">
              <span v-if="modelValue">
                {{ format(modelValue, 'PPP') }}
              </span>
              <span v-else>{{ setting.placeholder || 'Pick a date' }}</span>
              <CalendarIcon class="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent class="w-auto p-0" align="start">
          <Calendar 
            :model-value="modelValue" 
            @update:model-value="handleDateSelect" 
          />
        </PopoverContent>
      </Popover>
      
      <div class="relative">
        <Clock class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="time"
          v-model="timeInput"
          @change="handleTimeChange"
          class="pl-9 w-[120px]"
          :disabled="disabled || !modelValue"
        />
      </div>
    </div>
    
    <div v-if="modelValue" class="text-sm mt-1 text-muted-foreground">
      Selected: {{ formatDateTime(modelValue) }}
    </div>
    
    <FormDescription v-if="setting.description">
      {{ setting.description }}
    </FormDescription>
    <FormMessage />
  </FormItem>
  <input type="hidden" v-bind="componentField">
</template>