import { defineStore } from "pinia";
import type { SettingsSchema, SettingValue } from "../types";
import { useAuth } from "../composables/useAuth";
import { useRuntimeConfig, useNuxtApp } from "#app";

export const useSettingsStore = defineStore("stufioSettings", {
  state: () => ({
    values: {} as Record<string, any>,
    loading: false,
    error: null as string | null,
    submitting: false,
    submitError: null as string | null,
    schema: null as SettingsSchema | null,
    schemaLoading: false,
    schemaError: null as string | null,
    loadedSubgroups: {} as Record<string, Record<string, boolean>>,
    lastRefresh: 0,
  }),

  getters: {
    isStale(): boolean {
      const config = useRuntimeConfig().public?.stufioSettings;
      const now = Date.now();
      return now - this.lastRefresh > (config?.refreshInterval || 300000);
    },
  },

  actions: {
    /**
     * Check if a specific subgroup's settings are loaded
     */
    isSubgroupLoaded(groupId: string, subgroupId: string | null) {
      return this.loadedSubgroups[groupId]?.[subgroupId || "general"] || false;
    },

    /**
     * Load settings for a specific subgroup
     */
    async loadSubgroupSettings(
      groupId: string,
      subgroupId: string | null,
      module = "core"
    ) {
      const subgroupKey = subgroupId || "general";

      // Initialize group tracking object if not exists
      if (!this.loadedSubgroups[groupId]) {
        this.loadedSubgroups[groupId] = {};
      }

      // Don't reload if already loaded unless stale
      if (this.loadedSubgroups[groupId][subgroupKey] && !this.isStale) {
        return this.values;
      } else {
        this.loadedSubgroups[groupId][subgroupKey] = false
      }

      this.loading = true;
      this.error = null;

      try {
        // Get all setting keys for this subgroup from the schema
        const subgroupSettings = Object.values(
          this.schema?.settings || {}
        ).filter((setting) => {
          if (setting.group !== groupId) return false;

          if (subgroupId === null || subgroupId === "general") {
            return setting.subgroup === null || setting.subgroup === "general";
          }

          return setting.subgroup === subgroupId;
        });

        const keys = subgroupSettings.map((setting) => setting.key);

        if (keys.length === 0) {
          // No settings found for this subgroup
          this.loadedSubgroups[groupId][subgroupKey] = true;
          return this.values;
        }

        const config = useRuntimeConfig().public.stufioSettings;
        const { debug } = config;
        const apiEndpoint = config?.getEndpoint || "/api/v1/admin/settings/get";
        const auth = useAuth();
        const { $api } = useNuxtApp();

        // Use OpenFetch API client
        const response = await $api(apiEndpoint, {
          method: "POST",
          body: { keys },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
        });

        if (debug) {
          console.log(`Loaded settings for ${apiEndpoint}:`, response);
        }

        // Merge new values with existing ones
        this.values = { ...this.values, ...response };

        // Mark this subgroup as loaded
        this.loadedSubgroups[groupId][subgroupKey] = true;

        // Update last refresh time
        this.lastRefresh = Date.now();

        return this.values;
      } catch (err: any) {
        console.error(
          `Failed to load settings for subgroup ${subgroupKey}:`,
          err
        );
        this.error = err.message || "Failed to load settings";
        throw err;
      } finally {
        // Small delay before setting loading to false
        setTimeout(() => {
          this.loading = false;
        }, 100);
      }
    },

    /**
     * Save settings
     */
    async saveSettings(settings: SettingValue[]) {
      if (!settings.length) return;

      this.submitting = true;
      this.submitError = null;

      try {
        const { $api } = useNuxtApp();
        const config = useRuntimeConfig().public.stufioSettings;
        const { debug } = config;
        const apiEndpoint = config?.saveEndpoint || "/api/v1/admin/settings/save";

        const response = await $api(apiEndpoint.replace("{module}", settings), {
          method: "POST",
          body: settings,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${useAuth().token}`,
          },
        });

        if (debug) {
          console.log("Settings saved:", response);
        }

        // Update values in store
        settings.forEach((setting) => {
          this.values[setting.key] = setting.value;
        });

        // Update last refresh time
        this.lastRefresh = Date.now();

        return response;
      } catch (err: any) {
        console.error("Failed to save settings:", err);
        this.submitError = err.message || "Failed to save settings";
        throw err;
      } finally {
        this.submitting = false;
      }
    },

    /**
     * Reset loaded subgroups to force reloading
     */
    resetLoadedSubgroups() {
      this.loadedSubgroups = {};
      this.lastRefresh = 0;
    },

    /**
     * Clear all settings data
     */
    clearSettings() {
      this.values = {};
      this.loadedSubgroups = {};
      this.lastRefresh = 0;
    },

    /**
     * Refresh the settings cache
     */
    async refreshCache() {
      try {
        const { $api } = useNuxtApp();
        const config = useRuntimeConfig().public.stufioSettings;
        const { debug } = config;
        const apiEndpoint = config?.cacheEndpoint || "/api/v1/admin/settings/refresh-cache";
        await $api(apiEndpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${useAuth().token}`,
            "Content-Type": "application/json",
          },
        });

        if (debug) {
          console.log("Settings cache refreshed");
        }

        return true;
      } catch (err: any) {
        console.error("Failed to refresh cache:", err);
        throw err;
      }
    },
  },
});
