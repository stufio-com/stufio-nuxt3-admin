<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { type Setting } from '../../../types';
import {
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage
} from '../../ui/form';
import { Button } from '../../ui/button';
import { Upload, Image, X } from 'lucide-vue-next';

const props = defineProps({
    setting: {
        type: Object as () => Setting,
        required: true
    },
    modelValue: {
        type: [String, Object],
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
const fileInput = ref(null);
const previewUrl = ref('');

// Handle file preview
const updatePreview = () => {
    if (!props.modelValue) {
        previewUrl.value = '';
        return;
    }

    if (typeof props.modelValue === 'string') {
        previewUrl.value = props.modelValue;
    } else if (props.modelValue instanceof File) {
        previewUrl.value = URL.createObjectURL(props.modelValue);
    }
};

// Watch for model value changes
watch(() => props.modelValue, updatePreview, { immediate: true });

const fileName = computed(() => {
    if (!props.modelValue) return '';
    return typeof props.modelValue === 'string'
        ? props.modelValue.split('/').pop()
        : props.modelValue.name;
});

const triggerFileInput = () => {
    fileInput.value.click();
};

const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        emit('update:modelValue', file);

        // Create preview URL
        previewUrl.value = URL.createObjectURL(file);
    }
};

const clearFile = () => {
    emit('update:modelValue', null);
    previewUrl.value = '';
    if (fileInput.value) {
        fileInput.value.value = '';
    }
};
</script>

<template>
    <FormItem>
        <FormLabel>{{ setting.label }}</FormLabel>
        <FormControl>
            <div class="space-y-4">
                <!-- Image preview -->
                <div v-if="previewUrl" class="relative w-full max-w-md h-48 border rounded-md overflow-hidden">
                    <img :src="previewUrl" class="object-contain w-full h-full" alt="Image preview" />
                    <button type="button" @click="clearFile"
                        class="absolute top-2 right-2 bg-background/80 p-1 rounded-full text-muted-foreground hover:text-foreground"
                        :disabled="disabled">
                        <X class="w-4 h-4" />
                    </button>
                </div>

                <!-- Upload control -->
                <div class="flex items-center gap-2">
                    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange"
                        :disabled="disabled" />
                    <Button type="button" variant="outline" @click="triggerFileInput" :disabled="disabled"
                        class="flex items-center">
                        <Upload class="w-4 h-4 mr-2" />
                        {{ previewUrl ? 'Change Image' : 'Upload Image' }}
                    </Button>
                    <div v-if="fileName && !previewUrl" class="flex items-center gap-2 bg-muted px-3 py-1 rounded-md">
                        <Image class="w-4 h-4" />
                        <span class="text-sm truncate max-w-[200px]">{{ fileName }}</span>
                    </div>
                </div>
            </div>
        </FormControl>
        <FormDescription v-if="setting.description">
            {{ setting.description }}
        </FormDescription>
        <FormMessage />
    </FormItem>
</template>