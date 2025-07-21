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
  RadioGroup,
  RadioGroupItem,
} from '../../ui/radio-group';

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

const groupClass = computed(() => ({
  'opacity-70': props.disabled
}));
</script>

<template>
  <FormItem class="space-y-3">
    <FormLabel>{{ setting.label }}</FormLabel>
    <FormControl>
      <RadioGroup 
        class="flex flex-col space-y-1" 
        v-bind="componentField" 
        :disabled="disabled"
        :class="groupClass"
      >
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
</template>