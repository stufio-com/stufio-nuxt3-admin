<script setup lang="ts">
import { computed } from 'vue';
import { type Setting } from '../../types';
import * as Fields from './fields';

const props = defineProps({
  setting: {
    type: Object as () => Setting,
    required: true
  },
  modelValue: {
    type: [String, Number, Boolean, Array, Object, Date],
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

// Dynamically determine which field component to use
const fieldComponent = computed(() => {
  const type = props.setting.type;
  const componentMap = {
    string: Fields.StringField,
    number: Fields.NumberField,
    boolean: Fields.SwitchField,
    email: Fields.EmailField,
    url: Fields.UrlField,
    password: Fields.PasswordField,
    text: Fields.TextField,
    select: Fields.SelectField,
    multi_select: Fields.MultiSelectField,
    date: Fields.DateField,
    datetime: Fields.DateTimeField,
    time: Fields.TimeField,
    color: Fields.ColorField,
    file: Fields.FileField,
    switch: Fields.SwitchField,
    radio: Fields.RadioField,
    checkbox: Fields.CheckboxField,
    // html: Fields.HtmlField,
    // markdown: Fields.MarkdownField,
    slider: Fields.SliderField,
    range: Fields.RangeField,
    image: Fields.ImageField
  };
  
  return componentMap[type] || Fields.StringField;
});
</script>

<template>
  <component 
    :is="fieldComponent" 
    :setting="setting" 
    :modelValue="modelValue"
    :disabled="disabled"
    :componentField="componentField"
    @update:modelValue="value => $emit('update:modelValue', value)"
  />
</template>