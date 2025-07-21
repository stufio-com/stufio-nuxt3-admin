<script setup lang="ts">
import { computed, ref } from 'vue';
import { type Setting } from '../../../types';
import {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage
} from '../../ui/form';
import { Input } from '../../ui/input';
import { Eye, EyeOff } from 'lucide-vue-next';
import { Button } from '../../ui/button';

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
const showPassword = ref(false);

const togglePassword = () => {
  showPassword.value = !showPassword.value;
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
        <Input 
          :type="showPassword ? 'text' : 'password'" 
          :placeholder="setting.placeholder || '••••••••'" 
          v-bind="componentField" 
          :disabled="disabled"
          :class="inputClass"
        />
        <Button 
          type="button"
          variant="ghost" 
          size="sm" 
          class="absolute right-0 top-0 h-full px-3 py-1"
          :disabled="disabled"
          @click="togglePassword"
        >
          <Eye v-if="!showPassword" class="h-4 w-4" />
          <EyeOff v-else class="h-4 w-4" />
        </Button>
      </div>
    </FormControl>
    <FormDescription v-if="setting.description">
      {{ setting.description }}
    </FormDescription>
    <FormMessage />
  </FormItem>
</template>