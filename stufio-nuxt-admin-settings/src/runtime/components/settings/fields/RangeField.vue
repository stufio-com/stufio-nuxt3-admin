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
import { Slider } from '../../ui/slider';

const props = defineProps({
    setting: {
        type: Object as () => Setting,
        required: true
    },
    modelValue: {
        type: Number,
        default: 0
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
const value = ref(props.modelValue || 0);

watch(() => props.modelValue, (newValue) => {
    value.value = newValue || 0;
});

const handleUpdate = (newValue) => {
    value.value = newValue[0];
    emit('update:modelValue', newValue[0]);
};

const min = computed(() => props.setting.min ?? 0);
const max = computed(() => props.setting.max ?? 100);
const step = computed(() => props.setting.step ?? 1);
</script>

<template>
    <FormItem>
        <div class="flex justify-between mb-2">
            <FormLabel>{{ setting.label }}</FormLabel>
            <span class="text-sm text-muted-foreground">{{ value }}</span>
        </div>
        <FormControl>
            <Slider v-model="value" class="w-full" :min="min" :max="max" :step="step" :disabled="disabled"
                @update:model-value="handleUpdate" />
        </FormControl>
        <div class="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{{ min }}</span>
            <span>{{ max }}</span>
        </div>
        <FormDescription v-if="setting.description">
            {{ setting.description }}
        </FormDescription>
        <FormMessage />
    </FormItem>
    <input type="hidden" v-bind="componentField">
</template>