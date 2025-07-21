import { defineStore } from 'pinia';
import type { TranslationEntry, TranslationStats } from '../../types';

export const useTranslationsStore = defineStore('translations', {
  state: () => ({
    entries: [] as TranslationEntry[],
    locales: [] as string[],
    activeLocale: '',
    defaultLocale: 'en',
    loading: false,
    error: null as string | null,
    stats: null as TranslationStats | null,
    filters: {
      search: '',
      module: 'all',
      onlyMissing: false,
      onlyModified: false
    },
    editingEntry: null as TranslationEntry | null,
    showEditModal: false,
    modules: [] as string[],
  }),

  getters: {
    filteredEntries: (state) => {
      return state.entries.filter(entry => {
        if (state.filters.search && !entry.key.toLowerCase().includes(state.filters.search.toLowerCase()) && 
            !entry.value.toLowerCase().includes(state.filters.search.toLowerCase())) {
          return false;
        }
        
        if (state.filters.module !== 'all' && entry.module !== state.filters.module) {
          return false;
        }
        
        if (state.filters.onlyMissing && entry.value) {
          return false;
        }
        
        if (state.filters.onlyModified && !entry.modified) {
          return false;
        }
        
        return true;
      });
    },
    
    hasFilters: (state) => {
      return !!(state.filters.search || state.filters.module || 
                state.filters.onlyMissing || state.filters.onlyModified);
    },

    missingCount: (state) => {
      return state.entries.filter(entry => !entry.value).length;
    },
    
    modifiedCount: (state) => {
      return state.entries.filter(entry => entry.modified).length;
    },
    
    progress: (state) => {
      const total = state.entries.length;
      const missing = state.entries.filter(entry => !entry.value).length;
      if (total === 0) return 100;
      return Math.round(((total - missing) / total) * 100);
    },

    modules: (state) => {
      return [...new Set(state.entries.map(entry => entry.module))];
    }
  },

  actions: {
    async fetchTranslations(locale: string) {
      this.loading = true;
      this.error = null;
      
      try {
        const config = useRuntimeConfig().public.stufioTranslations;
        const { $api } = useNuxtApp();

        // Fetch from the configured endpoint
        const response = await $api(`${config.apiEndpoint}/translations/locale/${locale}`);
        
        if (!response || !response.data) {
          throw new Error('No data returned from translations endpoint');
        }
        
        // Transform the response into entries
        this.entries = Object.entries(response.data).map(([key, value]) => ({
          key,
          value: value as string,
          locale,
          module: 'core', // Default module, can be overridden if API provides it
          isNew: false,
          modified: false
        }));
        
        this.activeLocale = locale;
        
        return this.entries;
      } catch (err: any) {
        console.error('Failed to load translations:', err);
        this.error = err.message || 'Failed to load translations';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchLocales() {
      try {
        const config = useRuntimeConfig().public.stufioTranslations;
        const { $api } = useNuxtApp();
        
        const response = await $api(`${config.apiEndpoint}/locales`);
        
        if (!response || !response.data) {
          throw new Error('No data returned from locales endpoint');
        }
        
        this.locales = response.data;
        
        // Set default locale if available, otherwise use first locale
        if (this.locales.includes('en')) {
          this.defaultLocale = 'en';
        } else if (this.locales.length > 0) {
          this.defaultLocale = this.locales[0];
        }
        
        return this.locales;
      } catch (err: any) {
        console.error('Failed to load locales:', err);
        throw err;
      }
    },
    
    async fetchStats() {
      try {
        const config = useRuntimeConfig().public.stufioTranslations;
        const { $api } = useNuxtApp();
        
        const response = await $api(`${config.apiEndpoint}/stats`);
        
        if (!response || !response.data) {
          throw new Error('No data returned from stats endpoint');
        }
        
        this.stats = response.data;
        return this.stats;
      } catch (err: any) {
        console.error('Failed to load translation stats:', err);
        throw err;
      }
    },
    
    async saveTranslation(entry: TranslationEntry) {
      try {
        const config = useRuntimeConfig().public.stufioTranslations;
        const { $api } = useNuxtApp();
        
        const response = await $api(`${config.apiEndpoint}/translations/save`, {
          method: 'POST',
          body: {
            key: entry.key,
            value: entry.value,
            locale: entry.locale,
            module: entry.module
          }
        });
        
        if (!response || response.error) {
          throw new Error(response?.error?.message || 'Failed to save translation');
        }
        
        // Update entry in the store
        const index = this.entries.findIndex(e => e.key === entry.key && e.locale === entry.locale);
        if (index !== -1) {
          this.entries[index] = {
            ...entry,
            modified: false,
            isNew: false
          };
        }
        
        return true;
      } catch (err: any) {
        console.error('Failed to save translation:', err);
        throw err;
      }
    },
    
    async addTranslation(entry: TranslationEntry) {
      try {
        const config = useRuntimeConfig().public.stufioTranslations;
        const { $api } = useNuxtApp();
        
        const response = await $api(`${config.apiEndpoint}/translations/add`, {
          method: 'POST',
          body: {
            key: entry.key,
            value: entry.value,
            locale: entry.locale,
            module: entry.module
          }
        });
        
        if (!response || response.error) {
          throw new Error(response?.error?.message || 'Failed to add translation');
        }
        
        // Add entry to the store
        this.entries.push({
          ...entry,
          isNew: false,
          modified: false
        });
        
        return true;
      } catch (err: any) {
        console.error('Failed to add translation:', err);
        throw err;
      }
    },
    
    setFilter(filter: string, value: any) {
      if (filter in this.filters) {
        this.filters[filter] = value;
      }
    },
    
    editTranslation(entry: TranslationEntry) {
      this.editingEntry = { ...entry };
      this.showEditModal = true;
    },
    
    clearFilters() {
      this.filters = {
        search: '',
        module: 'all',
        onlyMissing: false,
        onlyModified: false
      };
    }
  }
});