<script setup lang="ts">
import { ref, computed } from 'vue';
import { type Setting } from '../../../types';
import {
    FormItem, FormLabel, FormControl, FormDescription, FormMessage
} from '../../ui/form';
import { Button } from '../../ui/button';
import { Upload, File, X } from 'lucide-vue-next';

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
    }
};

const clearFile = () => {
    emit('update:modelValue', null);
    if (fileInput.value) {
        fileInput.value.value = '';
    }
};
</script>

<template>
    <FormItem>
        <FormLabel>{{ setting.label }}</FormLabel>
        <FormControl>
            <div class="flex items-center gap-2">
                <input ref="fileInput" type="file" class="hidden" @change="handleFileChange" :disabled="disabled" />
                <Button type="button" variant="outline" @click="triggerFileInput" :disabled="disabled"
                    class="flex items-center">
                    <Upload class="w-4 h-4 mr-2" />
                    {{ fileName ? 'Change File' : 'Upload File' }}
                </Button>
                <div v-if="fileName" class="flex items-center gap-2 bg-muted px-3 py-1 rounded-md">
                    <File class="w-4 h-4" />
                    <span class="text-sm truncate max-w-[200px]">{{ fileName }}</span>
                    <button type="button" @click="clearFile" class="text-muted-foreground hover:text-foreground"
                        :disabled="disabled">
                        <X class="w-4 h-4" />
                    </button>
                </div>
            </div>
        </FormControl>
        <FormDescription v-if="setting.description">
            {{ setting.description }}
        </FormDescription>
        <FormMessage />
    </FormItem>
</template>