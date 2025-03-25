import { defineStore } from 'pinia';

export interface SettingValue {
  key: string;
  value: any;
  module: string;
}

export interface SettingsSchema {
  settings: Record<string, any>;
  groups: Record<string, any>;
  subgroups: Record<string, any[]>;
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    values: {} as Record<string, any>,
    loading: false,
    error: null as string | null,
    submitting: false,
    submitError: null as string | null,
    schema: null as SettingsSchema | null,
    schemaLoading: false,
    schemaError: null as string | null,
    // Track which subgroups have been loaded (by group and subgroup)
    loadedSubgroups: {} as Record<string, Record<string, boolean>>,
  }),

  actions: {
    /**
     * Load settings schema (metadata)
     */
    async loadSettingsSchema(forceReload = false) {
      // Don't reload if already loaded unless forced
      if (this.schema && !forceReload) {
        return this.schema;
      }
      
      this.schemaLoading = true;
      this.schemaError = null;
      
      try {
        const auth = useClientAuth();
        if (!auth.authenticated || !auth.token) {
          throw new Error('Authentication required');
        }

        const { data, error } = await useApi('/api/v1/admin/settings/schemas', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          params: { _t: Date.now() }
        });

        if (error.value) {
          throw new Error(error.value?.data?.detail || 'Failed to load settings schema');
        }

        this.schema = data.value;
        return this.schema;
      } catch (err: any) {
        console.error('Failed to load settings schema:', err);
        this.schemaError = err.message || 'Failed to load settings schema';
        throw err;
      } finally {
        this.schemaLoading = false;
      }
    },

    /**
     * Load settings for an entire group at once
     */
    async loadGroupSettings(groupId: string, module: string = 'core') {
      // Don't reload if already loaded
      if (this.loadedGroups[groupId]) {
        return this.values;
      }
      
      this.loading = true;
      this.error = null;
      
      try {
        const auth = useClientAuth();
        if (!auth.authenticated || !auth.token) {
          throw new Error('Authentication required');
        }

        // Get all setting keys for this group from the schema
        const allGroupKeys = Object.values(this.schema?.settings || {})
          .filter(setting => setting.group === groupId)
          .map(setting => setting.key);

        if (allGroupKeys.length === 0) {
          // No settings found for this group
          return this.values;
        }

        const { data, error } = await useApi('/api/v1/admin/settings/get', {
          method: 'POST',
          body: {
            keys: allGroupKeys
          },
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          }
        });

        if (error.value) {
          throw new Error(error.value?.data?.detail || 'Failed to load settings');
        }

        // Merge new values with existing ones
        this.values = { ...this.values, ...data.value };
        
        // Mark this group as loaded
        this.loadedGroups[groupId] = true;
        
        return this.values;
      } catch (err: any) {
        console.error('Failed to load group settings:', err);
        this.error = err.message || 'Failed to load settings';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Check if a specific subgroup's settings are loaded
     */
    isSubgroupLoaded(groupId: string, subgroupId: string | null) {
      return this.loadedSubgroups[groupId]?.[subgroupId || 'general'] || false;
    },

    /**
     * Load settings for a specific subgroup
     */
    async loadSubgroupSettings(groupId: string, subgroupId: string | null, module: string = 'core') {
      const subgroupKey = subgroupId || 'general';
      
      // Initialize group tracking object if not exists
      if (!this.loadedSubgroups[groupId]) {
        this.loadedSubgroups[groupId] = {};
      }
      
      // Don't reload if already loaded and not forced
      if (this.loadedSubgroups[groupId][subgroupKey]) {
        console.log(`Using cached settings for ${groupId}/${subgroupKey}`);
        return this.values;
      }
      
      this.loading = true;
      this.error = null;
      
      try {
        const auth = useClientAuth();
        if (!auth.authenticated || !auth.token) {
          throw new Error('Authentication required');
        }
        
        // Get all setting keys for this subgroup from the schema
        const subgroupSettings = Object.values(this.schema?.settings || {})
          .filter(setting => {
            if (setting.group !== groupId) return false;
            
            if (subgroupId === null || subgroupId === 'general') {
              return setting.subgroup === null || setting.subgroup === 'general';
            }
            
            return setting.subgroup === subgroupId;
          });
          
        const keys = subgroupSettings.map(setting => setting.key);
        console.log(`Loading settings for ${groupId}/${subgroupKey}, keys:`, keys);

        if (keys.length === 0) {
          // No settings found for this subgroup
          console.log(`No settings found for ${groupId}/${subgroupKey}`);
          this.loadedSubgroups[groupId][subgroupKey] = true;
          return this.values;
        }

        const { data, error } = await useApi('/api/v1/admin/settings/get', {
          method: 'POST',
          body: {
            keys
          },
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          }
        });

        if (error.value) {
          throw new Error(error.value?.data?.detail || 'Failed to load settings');
        }

        console.log(`Received settings for ${groupId}/${subgroupKey}:`, data.value);
        
        // Merge new values with existing ones
        this.values = { ...this.values, ...data.value };
        
        // Mark this subgroup as loaded
        this.loadedSubgroups[groupId][subgroupKey] = true;
        
        return this.values;
      } catch (err: any) {
        console.error(`Failed to load settings for subgroup ${subgroupKey}:`, err);
        this.error = err.message || 'Failed to load settings';
        throw err;
      } finally {
        // Add a small delay before marking as not loading
        // This helps components stabilize before re-rendering
        setTimeout(() => {
          this.loading = false;
        }, 100);
      }
    },

    /**
     * Load specific settings by keys
     */
    async loadSettings(keys?: string[]) {
      if (!keys || keys.length === 0) {
        return this.values;
      }
      
      this.loading = true;
      this.error = null;
      
      try {
        const auth = useClientAuth();
        if (!auth.authenticated || !auth.token) {
          throw new Error('Authentication required');
        }

        const { data, error } = await useApi('/api/v1/admin/settings/get', {
          method: 'POST',
          body: {
            keys
          },
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          }
        });

        if (error.value) {
          throw new Error(error.value?.data?.detail || 'Failed to load settings');
        }

        // Merge new values with existing ones
        this.values = { ...this.values, ...data.value };
        return this.values;
      } catch (err: any) {
        console.error('Failed to load settings:', err);
        this.error = err.message || 'Failed to load settings';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Update a single setting
     */
    async updateSetting(key: string, value: any, module: string) {
      this.submitting = true;
      this.submitError = null;
      
      try {
        const auth = useClientAuth();
        if (!auth.authenticated || !auth.token) {
          throw new Error('Authentication required');
        }

        const { data, error } = await useApi(`/api/v1/admin/settings/${module}/${key}`, {
          method: 'PUT',
          body: {
            value
          },
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          }
        });

        if (error.value) {
          throw new Error(error.value?.data?.detail || 'Failed to update setting');
        }

        // Update local state
        this.values[key] = value;
        return data.value;
      } catch (err: any) {
        console.error('Failed to update setting:', err);
        this.submitError = err.message || 'Failed to update setting';
        throw err;
      } finally {
        this.submitting = false;
      }
    },

    /**
     * Delete (reset) a setting
     */
    async deleteSetting(key: string, module: string = 'core') {
      this.submitting = true;
      this.submitError = null;
      
      try {
        const auth = useClientAuth();
        if (!auth.authenticated || !auth.token) {
          throw new Error('Authentication required');
        }

        const { data, error } = await useApi(`/api/v1/admin/settings/${key}`, {
          method: 'DELETE',
          body: { module },
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          }
        });

        if (error.value) {
          throw new Error(error.value?.data?.detail || 'Failed to delete setting');
        }

        // Remove from local state
        if (key in this.values) {
          delete this.values[key];
        }
        
        return data.value;
      } catch (err: any) {
        console.error('Failed to delete setting:', err);
        this.submitError = err.message || 'Failed to delete setting';
        throw err;
      } finally {
        this.submitting = false;
      }
    },

    /**
     * Save multiple settings at once
     */
    async saveSettings(settings: SettingValue[]) {
      this.submitting = true;
      this.submitError = null;
      
      try {
        const auth = useClientAuth();
        if (!auth.authenticated || !auth.token) {
          throw new Error('Authentication required');
        }

        // Execute updates in parallel
        const promises = settings.map(setting => 
          this.updateSetting(setting.key, setting.value, setting.module)
        );
        
        const results = await Promise.all(promises);
        
        // Refresh cache
        await this.refreshCache();
        
        return results;
      } catch (err: any) {
        console.error('Failed to save settings:', err);
        this.submitError = err.message || 'Failed to save settings';
        throw err;
      } finally {
        this.submitting = false;
      }
    },

    /**
     * Refresh the settings cache
     */
    async refreshCache() {
      try {
        const auth = useClientAuth();
        if (!auth.authenticated || !auth.token) {
          throw new Error('Authentication required');
        }

        const { error } = await useApi('/api/v1/admin/settings/refresh-cache', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          }
        });

        if (error.value) {
          throw new Error(error.value?.data?.detail || 'Failed to refresh cache');
        }

        return true;
      } catch (err: any) {
        console.error('Failed to refresh cache:', err);
        throw err;
      }
    },

    /**
     * Reset loaded groups to force reloading
     */
    resetLoadedGroups() {
      this.loadedGroups = {};
    },

    /**
     * Reset loaded subgroups to force reloading
     */
    resetLoadedSubgroups() {
      this.loadedSubgroups = {};
    }
  }
});