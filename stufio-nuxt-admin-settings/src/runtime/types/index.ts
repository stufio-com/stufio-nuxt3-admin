export interface SettingOption {
  value: string;
  label: string;
}

export interface Setting {
  key: string;
  label: string;
  description?: string;
  type: string;
  group: string;
  subgroup?: string | null;
  required?: boolean;
  default?: any;
  placeholder?: string;
  min?: number;
  max?: number;
  options?: SettingOption[];
  order?: number;
  module?: string;
}

export interface SettingGroup {
  id: string;
  label: string;
  description: string | null;
  icon: string | null;
  order: number;
  module?: string;
}

export interface SettingSubgroup {
  id: string;
  group_id: string;
  label: string;
  description: string | null;
  icon: string | null;
  order: number;
}

export interface SettingsSchema {
  settings: Record<string, SettingDefinition>;
  groups: Record<string, SettingGroup>;
  subgroups: Record<string, SettingSubgroup[]>;
}

export interface SettingDefinition {
  key: string;
  label: string;
  description?: string;
  group: string;
  subgroup?: string | null;
  type: SettingType;
  required?: boolean;
  default?: any;
  min?: number;
  max?: number;
  options?: SettingOption[];
  placeholder?: string;
  multiple?: boolean;
  module?: string;
}

export type SettingType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'email'
  | 'url'
  | 'password'
  | 'text'
  | 'select'
  | 'multi_select'
  | 'date'
  | 'datetime'
  | 'time'
  | 'color'
  | 'file'
  | 'switch'
  | 'radio'
  | 'checkbox'
  | 'html'
  | 'markdown'
  | 'slider'
  | 'range'
  | 'image';

export interface SettingValue {
  key: string;
  value: any;
  module: string;
}

export interface NavItem {
  id: string;
  label: string;
  description?: string;
  group_id?: string;
  isActive?: boolean;
}

export interface FieldUpdateEvent {
  key: string;
  value: any;
}
