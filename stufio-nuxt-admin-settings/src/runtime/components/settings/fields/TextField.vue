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
import { Textarea } from '../../ui/textarea';

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

const textareaClass = computed(() => ({
  'opacity-70': props.disabled
}));
</script>

<template>
  <FormItem>
    <FormLabel>{{ setting.label }}</FormLabel>
    <FormControl>
      <Textarea 
        :placeholder="setting.placeholder" 
        rows="4" 
        v-bind="componentField" 
        :disabled="disabled"
        :class="textareaClass" 
      />
    </FormControl>
    <FormDescription v-if="setting.description">
      {{ setting.description }}
    </FormDescription>
    <FormMessage />
  </FormItem>
</template>