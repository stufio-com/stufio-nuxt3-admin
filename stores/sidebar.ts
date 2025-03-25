// stores/sidebar.ts
import { defineStore } from 'pinia';
import { useState } from 'nuxt/app';
import { useSettingsStore, type SettingsSchema } from './settings';
import {
  Settings2, Globe, Code, Database, Shield, Mail, 
  Layers, Users, Bell, FileText, BarChart2, ExternalLink
} from 'lucide-vue-next';

// Type definitions
export interface SidebarItem {
  id: string;
  title: string;
  icon: any;
  url: string;
  isActive?: boolean;
  items?: SubItem[];
  order: number;
  module?: string;
}

export interface SubItem {
  id: string;
  title: string;
  url: string;
  isActive?: boolean;
}

export interface FavoriteItem {
  id: string;
  name: string;
  url: string;
  icon: any;
}

export interface Project {
  id: string;
  name: string;
  logo?: any;  // Make logo optional
  plan?: string; // Make plan optional
}

// Settings schema interfaces
interface SettingGroup {
  id: string;
  label: string;
  description: string | null;
  icon: string | null;
  order: number;
  module?: string;
}

interface SettingSubgroup {
  id: string;
  group_id: string;
  label: string;
  description: string | null;
  icon: string | null;
  order: number;
  module: string;
}

interface SettingItem {
  key: string;
  label: string;
  description: string | null;
  group: string;
  subgroup: string | null;
  type: string;
  // Other properties omitted for brevity
}

export const useSidebarStore = defineStore('sidebar', {
  state: () => ({
    navItems: [] as SidebarItem[],
    favorites: [] as FavoriteItem[],
    projects: [] as Project[],
    loading: false,
    error: null as string | null,
    settingsSchema: null as SettingsSchema | null,
    loadAttempts: 0,
    initialized: false,
  }),

  getters: {
    settingsGroups: (state) => {
      if (!state.settingsSchema) return [];
      return Object.values(state.settingsSchema.groups)
        .sort((a, b) => a.order - b.order);
    },
    
    settingsSubgroups: (state) => (groupId: string) => {
      if (!state.settingsSchema) return [];
      return state.settingsSchema.subgroups[groupId] || [];
    },
    
    filteredSettings: (state) => (group: string, subgroup: string | null = null) => {
      if (!state.settingsSchema) return [];
      
      return Object.values(state.settingsSchema.settings).filter(setting => {
        if (setting.group !== group) return false;
        
        if (subgroup !== null) {
          return setting.subgroup === subgroup || (setting.subgroup === null && subgroup === 'general');
        }
        
        return setting.subgroup === null;
      }).sort((a, b) => (a.order || 0) - (b.order || 0));
    }
  },

  actions: {
    async loadSettingsSchema(forceReload = false) {
      // Don't reload if already loaded unless forced
      if (this.settingsSchema && !forceReload) {
        return;
      }
      
      this.loading = true;
      this.error = null;
      this.loadAttempts++;
      
      try {
        // Get auth token from store
        const auth = useClientAuth();
        
        // If not authenticated, defer loading with progressive backoff
        if (!auth.authenticated || !auth.token) {
          // Prepare retry with exponential backoff (max 10 seconds)
          const retryDelay = Math.min(
            10000,
            Math.pow(2, this.loadAttempts) * 500
          );
          console.log(`Auth not ready, retrying in ${retryDelay}ms`);

          setTimeout(() => this.loadSettingsSchema(), retryDelay);
          return;
        }
        
        // Use settings store instead of direct API call
        const settingsStore = useSettingsStore();
        
        try {
          // Load schema from settings store
          await settingsStore.loadSettingsSchema(forceReload);
          
          // Check for errors
          if (settingsStore.schemaError) {
            throw new Error(settingsStore.schemaError);
          }
          
          // Copy schema from settings store
          this.settingsSchema = settingsStore.schema;
          
          // Generate nav items if schema loaded successfully
          if (this.settingsSchema) {
            this.generateSettingsNavItems();
            this.loadAttempts = 0; // Reset attempts on success
          } else if (this.loadAttempts < 3) {
            // Retry a few times if we get null data
            setTimeout(() => this.loadSettingsSchema(), 1000);
            return;
          } else {
            throw new Error('Received empty response from settings API');
          }
        } catch (error) {
          throw error;
        }
      } catch (err: any) {
        console.error('Failed to load settings schema:', err);
        this.error = err.message || 'Failed to load settings schema';
        
        // Retry on error with backoff
        if (this.loadAttempts < 3) {
          const retryDelay = Math.min(10000, Math.pow(2, this.loadAttempts) * 500);
          setTimeout(() => this.loadSettingsSchema(), retryDelay);
        }
      } finally {
        this.loading = false;
        this.updateActiveItems();
      }
    },

    updateActiveItems() {
      if (!process.client) return;

      // Use provided route path instead of useRoute()
      const route = useRoute();

      if (!route) return;
      const routePath = route.path;
      
      this.navItems.forEach(item => {
        item.isActive = routePath === item.url || routePath.startsWith(`${item.url}/`);
        
        // Also check subitems
        if (item.items) {
          item.items.forEach(subItem => {
            subItem.isActive = routePath === subItem.url || routePath.startsWith(`${subItem.url}/`);
          });
        }
      });
    },
    
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
          
          return {
            id: group.id,
            title: group.label,
            url: `/settings/${group.id}`, // Consistent path format
            isActive: false,
            icon: iconComponent
          };
        })
        .sort((a, b) => {
          const groupA = this.settingsSchema?.groups[a.id];
          const groupB = this.settingsSchema?.groups[b.id];
          return (groupA?.order || 100) - (groupB?.order || 100);
        });
      
      // Find or create settings main nav item
      let settingsItem = this.navItems.find(item => item.id === 'settings');
      
      if (!settingsItem) {
        settingsItem = {
          id: "settings",
          title: "Settings",
          icon: Settings2,
          url: "/settings",
          order: 100,
          items: [],
          isActive: false
        };
        this.navItems.push(settingsItem);
      }
      
      // Update settings subitems
      settingsItem.items = settingsSubitems;
      
      // Sort nav items by order
      this.navItems.sort((a, b) => a.order - b.order);
    },
    
    addNavItem(item: SidebarItem) {
      const existingIndex = this.navItems.findIndex(i => i.id === item.id);
      if (existingIndex !== -1) {
        this.navItems[existingIndex] = { ...this.navItems[existingIndex], ...item };
      } else {
        this.navItems.push(item);
        this.navItems.sort((a, b) => a.order - b.order);
      }
    },
    
    removeNavItem(id: string) {
      const index = this.navItems.findIndex(item => item.id === id);
      if (index !== -1) {
        this.navItems.splice(index, 1);
      }
    },
    
    addFavorite(favorite: FavoriteItem) {
      const existingIndex = this.favorites.findIndex(f => f.id === favorite.id);
      if (existingIndex === -1) {
        this.favorites.push(favorite);
      }
    },
    
    removeFavorite(id: string) {
      const index = this.favorites.findIndex(fav => fav.id === id);
      if (index !== -1) {
        this.favorites.splice(index, 1);
      }
    },
    
    setProjects(projects: Project[]) {
      this.projects = projects;
    },
    
    init() {
      // Default nav items (non-settings)
      this.navItems = [
        {
          id: "dashboard",
          title: "Dashboard",
          icon: BarChart2,
          url: "/dashboard",
          isActive: false,
          order: 10,
        },
        {
          id: "content",
          title: "Content",
          icon: FileText,
          url: "#",
          order: 20,
          isActive: false,
          items: [
            { id: "pages", title: "Pages", url: "#" },
            { id: "posts", title: "Posts", url: "#" },
          ],
        },
        {
          id: "users",
          title: "Users",
          icon: Users,
          url: "/users",
          isActive: false,
          order: 30,
        },
      ];
      
      // Default favorites
      this.favorites = [
        { id: 'dashboard', name: 'Dashboard', url: '/dashboard', icon: BarChart2 },
        { id: 'content', name: 'Content', url: '#', icon: FileText }
      ];
      
      // Default projects with properly imported Layers component
      this.projects = [
        { 
          id: 'main', 
          name: 'Main Project', 
          logo: Layers,  // Make sure Layers is imported from lucide-vue-next
          plan: 'Pro' 
        }
      ];
      
      // Set up auth change listener if on client
      if (process.client) {
        const auth = useClientAuth();
        
        // Watch for auth changes to load settings
        watch(
          () => auth.authenticated,
          (authenticated) => {
            if (authenticated && !this.settingsSchema) {
              console.log(
                "Auth state changed to authenticated, loading settings schema"
              );
              this.loadSettingsSchema();
            }
          }
        );
        
        // Don't load settings immediately, defer to ensure auth is ready
        setTimeout(() => {
          if (!this.settingsSchema) {
            this.loadSettingsSchema();
          }
        }, 1000);
      }
      
      this.initialized = true;
    },
    
    // Manually refresh settings (for user-triggered refreshes)
    refreshSettings() {
      return this.loadSettingsSchema(true);
    }
  }
});