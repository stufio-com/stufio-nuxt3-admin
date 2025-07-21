<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { type Setting } from '../../../types';
import {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage
} from '../../ui/form';
import { Input } from '../../ui/input';
import { Clock } from 'lucide-vue-next';

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
const timeInput = ref(props.modelValue || '');

watch(() => props.modelValue, (newValue) => {
  timeInput.value = newValue || '';
});

const handleTimeChange = (event) => {
  const value = event.target.value;
  emit('update:modelValue', value);
};

const inputClass = computed(() => ({
  'opacity-70': props.disabled
}));
</script>

<template>
  <FormItem>
    <FormLabel>{{ setting.label }}</FormLabel>
    <FormControl>
      <div class="relative">
        <Clock class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input 
          type="time"
          v-model="timeInput"
          @change="handleTimeChange"
          class="pl-9"
          :placeholder="setting.placeholder" 
          :disabled="disabled"
          :class="inputClass" 
        />
      </div>
    </FormControl>
    <FormDescription v-if="setting.description">
      {{ setting.description }}
    </FormDescription>
    <FormMessage />
  </FormItem>
</template>