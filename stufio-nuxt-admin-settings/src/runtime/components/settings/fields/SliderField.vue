<script setup lang="ts">
import { ref, watch } from 'vue';
import { type Setting } from '../../../types';
import {
    FormItem, FormLabel, FormControl, FormDescription, FormMessage
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
const sliderValue = ref(props.modelValue || 0);

// Get min, max, and step from setting.options
const min = computed(() => props.setting.options?.min || 0);
const max = computed(() => props.setting.options?.max || 100);
const step = computed(() => props.setting.options?.step || 1);

// Sync with parent
watch(() => props.modelValue, (newValue) => {
    if (newValue !== sliderValue.value) {
        sliderValue.value = newValue || 0;
    }
});

// Update parent when content changes
watch(sliderValue, (newValue) => {
    emit('update:modelValue', newValue);
});
</script>

<template>
    <FormItem>
        <FormLabel>{{ setting.label }} <span class="text-muted-foreground ml-2">({{ sliderValue }})</span></FormLabel>
        <FormControl>
            <div class="pt-4 px-2">
                <input type="range" v-model="sliderValue" :min="min" :max="max" :step="step" :disabled="disabled"
                    class="w-full" :class="{ 'opacity-70': disabled }" />
            </div>
        </FormControl>
        <FormDescription v-if="setting.description">
            {{ setting.description }}
        </FormDescription>
        <FormMessage />
    </FormItem>
</template>