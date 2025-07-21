import { defineStore } from 'pinia';
import { useRuntimeConfig, useNuxtApp } from "#app";
import { useSettingsStore } from './settings';
import type { SettingsSchema } from "../types";
import {
  Settings2, Globe, Code, Database, Shield, Mail, 
  Layers, Users, Bell, FileText, BarChart2, ExternalLink
} from 'lucide-vue-next';
import { useAuth } from '../composables/useAuth';

export const useSettingsSidebarStore = defineStore('settingsSidebar', {
  state: () => ({
    navItems: [] as any[],
    loading: false,
    error: null as string | null,
    settingsSchema: null as SettingsSchema | null,
    loadAttempts: 0,
    initialized: false,
    currentRoute: null as string | null,
  }),

  getters: {
    // Get all settings navigation items
    settingsNavItems: (state) => {
      if (!state.settingsSchema) return [];

      const config = useRuntimeConfig().public?.stufioSettings;
      
      return Object.values(state.settingsSchema.groups)
        .map((group) => ({
          id: group.id,
          title: group.label,
          description: group.description,
          url: `${config.baseUrl}/${group.id}`,
          icon: group.icon || "settings",
          module: group.module || "core",
        }))
        .sort((a, b) => {
          const groupA = state.settingsSchema?.groups[a.id];
          const groupB = state.settingsSchema?.groups[b.id];
          return (groupA?.order || 100) - (groupB?.order || 100);
        });
    },
    
    // Get subgroups for a specific group
    settingsSubgroups: (state) => (groupId: string) => {
      if (!state.settingsSchema) return [];
      
      return Object.values(state.settingsSchema.settings || {})
        .filter(setting => setting.group === groupId && setting.subgroup)
        .reduce((acc, setting) => {
          if (!acc.some(sg => sg.id === setting.subgroup)) {
            // Check if subgroups exists and handle both array and object structures
            if (state.settingsSchema?.subgroups) {
              let subgroupObj = state.settingsSchema.subgroups[setting.group];
              if (subgroupObj) {
                if (typeof subgroupObj.find === "function") {
                  subgroupObj = subgroupObj.find(
                    (sg) => sg.id === setting.subgroup
                  );
                }

                acc.push({
                  id: setting.subgroup,
                  group_id: groupId,
                  label: subgroupObj.label || setting.subgroup,
                  description: subgroupObj.description || null,
                  icon: subgroupObj.icon || null,
                  order: subgroupObj.order || 100,
                });
              }
            }
            
            // If no matching subgroup was found or subgroups isn't in the expected format
            if (!acc.some(sg => sg.id === setting.subgroup)) {
              acc.push({
                id: setting.subgroup,
                group_id: groupId,
                label: setting.subgroup,
                description: null,
                icon: null,
                order: 100,
              });
            }
          }
          return acc;
        }, [] as any[])
        .sort((a, b) => a.order - b.order);
    },
    
    // Get filtered settings by group and subgroup
    filteredSettings: (state) => (group: string, subgroup: string | null = null) => {
      if (!state.settingsSchema) return [];
      
      return Object.values(state.settingsSchema.settings || {})
        .filter(setting => {
          // Match by group
          if (setting.group !== group) return false;
          
          // Match by subgroup if specified
          if (subgroup !== null && subgroup !== 'general') {
            return setting.subgroup === subgroup;
          }
          
          // If no subgroup specified, get settings with null subgroup
          return !setting.subgroup || setting.subgroup === 'general';
        })
        .sort((a, b) => {
          // Sort by order if available, otherwise by key
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
          }
          return a.key.localeCompare(b.key);
        });
    },
    
    // Check if on settings page
    isSettingsActive: (state) => {
      if (!state.currentRoute) return false;
      const config = useRuntimeConfig().public?.stufioSettings;
      return state.currentRoute.startsWith(config.baseUrl);
    },
    
    // Get active settings group from URL
    activeSettingsGroup: (state) => {
      if (!state.currentRoute) return null;
      const config = useRuntimeConfig().public?.stufioSettings;
      const match = state.currentRoute.match(new RegExp(`^${config.baseUrl}/([^/\\?]+)`));
      return match ? match[1] : null;
    }
  },

  actions: {
    // Load settings schema
    async loadSettingsSchema(forceRefresh = false) {
      if (this.settingsSchema && !forceRefresh) {
        return this.settingsSchema;
      }
      
      this.loading = true;
      this.error = null;
      
      try {
        // Get config from stufioSettings
        const config = useRuntimeConfig().public?.stufioSettings;
        const apiEndpoint = config?.schemaEndpoint || "/api/v1/admin/settings/schemas";
        
        // Increment load attempts
        this.loadAttempts++;
        
        // Get API client from nuxt app
        const { $api } = useNuxtApp();
        const auth = useAuth();
        
        if (!$api) {
          throw new Error('API client not available');
        }
        
        // Use OpenFetch API client
        const response = await $api(apiEndpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        
        // OpenFetch likely returns data directly without the .value property
        if (!response || !response.settings) {
          throw new Error('No data returned from schema endpoint');
        }
        
        this.settingsSchema = response;
        
        // Reference the schema in settings store too
        const settingsStore = useSettingsStore();
        settingsStore.schema = this.settingsSchema;
        
        return this.settingsSchema;
      } catch (err: any) {
        console.error('Failed to load settings schema:', err);
        this.error = err.message || 'Failed to load settings schema';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    // Update active items based on current route
    updateActiveItems(routePath: string) {
      if (typeof window === 'undefined') return;
      
      // Store current route
      this.currentRoute = routePath;
      
      // Generate settings navigation items if we have a schema
      if (this.settingsSchema) {
        this.generateSettingsNavItems();
      }
    },
    
    // Generate settings navigation items
    generateSettingsNavItems() {
      if (!this.settingsSchema) return;
      
      // Map of icon names to components
      const iconMap: Record<string, any> = {
        'settings': Settings2,
        'globe': Globe,
        'code': Code,
        'database': Database,
        'shield': Shield,
        'mail': Mail,
        'layers': Layers,
        'users': Users,
        'bell': Bell,
        'file-text': FileText,
        'bar-chart-2': BarChart2,
        'external-link': ExternalLink
      };
      
      // Generate settings subitems from groups
      const settingsSubitems = Object.values(this.settingsSchema.groups)
        .map(group => {
          // Get icon component or fallback to Settings2
          const iconComponent = group.icon && iconMap[group.icon] ? 
            iconMap[group.icon] : Settings2;
          
          // Check if this group is the active one
          const isActive = this.activeSettingsGroup === group.id;
          const config = useRuntimeConfig().public?.stufioSettings;
          
          return {
            id: group.id,
            title: group.label,
            url: `${config.baseUrl}/${group.id}`,
            isActive: isActive,
            icon: iconComponent
          };
        })
        .sort((a, b) => {
          const groupA = this.settingsSchema?.groups[a.id];
          const groupB = this.settingsSchema?.groups[b.id];
          return (groupA?.order || 100) - (groupB?.order || 100);
        });
      
      // Create the main nav items array if it doesn't exist
      if (!this.navItems) {
        this.navItems = [];
      }
      
      // Find or create settings main nav item
      let settingsItem = this.navItems.find(item => item.id === 'settings');
      const config = useRuntimeConfig().public?.stufioSettings;
      
      if (!settingsItem) {
        settingsItem = {
          id: 'settings',
          title: 'Settings',
          icon: Settings2,
          url: config.baseUrl,
          order: 100,
          items: [],
          isActive: this.isSettingsActive
        };
        this.navItems.push(settingsItem);
      } else {
        // Update active state
        settingsItem.isActive = this.isSettingsActive;
      }
      
      // Update settings subitems
      settingsItem.items = settingsSubitems;
      
      // Sort nav items by order
      this.navItems.sort((a, b) => a.order - b.order);
    },
    
    // Initialize the store
    init() {
      // Set initialization flag
      this.initialized = true;
      
      // Load schema if we have access to the client
      if (typeof window !== 'undefined') {
        this.loadSettingsSchema();
      }
    }
  }
});