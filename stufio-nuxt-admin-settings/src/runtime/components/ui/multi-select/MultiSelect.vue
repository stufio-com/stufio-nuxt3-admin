<script setup lang="ts">
import {
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { TagsInput, TagsInputInput } from '@/components/ui/tags-input';
import { Badge } from '@/components/ui/badge';
import {
    ComboboxAnchor,
    ComboboxContent,
    ComboboxInput,
    ComboboxPortal,
    ComboboxRoot,
} from 'reka-ui';
import { computed, ref } from 'vue';
import { ChevronDownIcon, X } from 'lucide-vue-next';

const props = defineProps({
    placeholder: {
        type: String,
        required: false,
    },
    options: {
        type: Array,
        required: false,
        default: () => [],
    },
});

const modelValue = defineModel('modelValue');
const open = ref(false);
const searchTerm = ref('');

const filteredOptions = computed(() => {
    return props.options.filter((i) => !modelValue.value.includes(i.value));
});

const findLabelById = (id) => {
    const option = props.options.find((opt) => opt.value === id);
    return option ? option.label : 'Unknown';
};

// Toggle function for the popover
const toggleOpen = () => {
    open.value = !open.value;
};

const handleRemove = (value) => {
    // console.log(label)
    modelValue.value = modelValue.value.filter((i) => i !== value);
};
</script>

<template>
    <div>
        <TagsInput class="px-0 gap-0 w-full cursor-pointer relative" :model-value="modelValue">
            <ChevronDownIcon class="cursor-pointer size-4 mr-3 absolute right-0" @click="toggleOpen" />
            <ComboboxRoot v-model="modelValue" v-model:open="open" v-model:search-term="searchTerm" class="w-full">
                <ComboboxAnchor as-child>
                    <div class="flex items-center justify-end w-full">
                        <ComboboxInput :placeholder="props.placeholder" as-child>
                            <TagsInputInput class="w-full px-3 border-0 focus:ring-0 py-0"
                                :class="modelValue.length > 0 ? '' : ''" @keydown.enter.prevent />
                        </ComboboxInput>
                    </div>
                </ComboboxAnchor>

                <ComboboxContent>
                    <CommandList position="popper"
                        class="w-[--radix-popper-anchor-width] z-[100] rounded-md mt-2 border bg-popover text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
                        <CommandEmpty />
                        <CommandGroup>
                            <CommandItem v-for="option in filteredOptions" :key="option.value" :value="option.value"
                                @select.prevent="(ev) => {
                                        if (modelValue.includes(ev.detail.value)) {
                                            return;
                                        } else {
                                            modelValue.push(ev.detail.value);
                                        }
                                        if (filteredOptions.length === 0) {
                                            open = false;
                                        }
                                    }
                                    ">
                                {{ option.label }}
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </ComboboxContent>
            </ComboboxRoot>
        </TagsInput>
        <div v-if="modelValue.length > 0" class="flex gap-2 flex-wrap items-center px-3 py-3">
            <div class="flex items-center gap-2" v-for="item in modelValue" :key="item">
                <Badge class="gap-2 py-1 px-2 bg-primary">
                    <!-- Find and display the label based on item (id) -->
                    {{ findLabelById(item) }}
                    <X class="cursor-pointer size-3" @click="handleRemove(item)" />
                </Badge>
            </div>
        </div>
    </div>
</template>
