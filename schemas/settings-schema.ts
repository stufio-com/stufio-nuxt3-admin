// schemas/settings-schema.ts
import { z } from 'zod';

export interface SettingFieldDefinition {
  key: string;
  label: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'enum' | 'date' | 'array';
  component?: 'input' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'switch' | 'datepicker' | 'file';
  defaultValue?: any;
  validation: z.ZodType<any>;
  options?: {value: string | number, label: string}[];
  uiProps?: Record<string, any>;
  group?: string;
  order?: number;
  isSecret?: boolean;
  isReadOnly?: boolean;
}

export interface SettingGroupDefinition {
  key: string;
  label: string;
  description?: string;
  icon?: string;
  order?: number;
  fields: SettingFieldDefinition[];
}

export interface ModuleSettingsDefinition {
  module: string;
  label: string;
  description?: string;
  icon?: string;
  order?: number;
  groups: SettingGroupDefinition[];
}