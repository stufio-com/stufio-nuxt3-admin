import { defineNuxtPlugin, useRuntimeConfig, useRoute, useRouter } from '#app';
import { watch, ref, onMounted } from 'vue'; // Import watch from 'vue', not '#app'
import { 
  Settings2, Globe, Code, Database, Shield, Mail, 
  Layers, Users, Bell, FileText, BarChart2, ExternalLink 
} from "lucide-vue-next";
import { useSidebarStore } from '#imports';
import { useSettingsSidebarStore } from '../stores/settingsSidebar';
import { useAuth } from '../composables/useAuth';

export default defineNuxtPlugin(nuxtApp => {
  const config = useRuntimeConfig().public.stufioSettings;
  const route = useRoute();
  const router = useRouter();
  // Store references to cleanup functions
  const cleanupFunctions: Array<() => void> = [];
  // Track if settings are loaded
  const settingsLoaded = ref(false);

  if (config.debug) {
    console.info("🛠️ Stufio Settings Module Initialized:", config);
  }

  // Initialize settings sidebar store
  const settingsSidebarStore = useSettingsSidebarStore();
  
  // Function to check if a route is a settings route
  const isSettingsRoute = (path: string) => {
    const baseUrl = config.baseUrl.startsWith('/') ? config.baseUrl : `/${config.baseUrl}`;
    return path.startsWith(baseUrl);
  };
  
  // Function to update active states based on current route
  const updateActiveStates = () => {
    if (!process.client) return;
    
    try {
      const currentPath = route.path;
      const sidebarStore = useSidebarStore();
      
      // If we're on a settings page
      if (isSettingsRoute(currentPath)) {
        // Update settings active state
        const settingsItem = sidebarStore.navItems.find(item => item.id === "settings");
        if (settingsItem) {
          // Mark main settings as active
          settingsItem.isActive = true;
          
          // Extract group ID from path
          const groupMatch = currentPath.match(new RegExp(`^${config.baseUrl}/([^/\\?]+)`));
          const groupId = groupMatch ? groupMatch[1] : null;
          
          // Update active states of subitems
          if (settingsItem.items && groupId) {
            settingsItem.items.forEach((subItem: any) => {
              // Extract group ID from subitem URL
              const subGroupMatch = subItem.url.match(new RegExp(`^${config.baseUrl}/([^/\\?]+)`));
              const subGroupId = subGroupMatch ? subGroupMatch[1] : null;
              
              // Set active state based on matched group ID
              subItem.isActive = groupId === subGroupId;
            });
          }
          
          // Update the item in the sidebar
          sidebarStore.addNavItem(settingsItem);
        }
      }
    } catch (err) {
      console.error("[stufio-settings] Error updating active states:", err);
    }
  };
  
  // Function to load settings data
  const loadSettingsData = async () => {
    try {
      const sidebarStore = useSidebarStore();
      if (!sidebarStore) {
        console.warn("[stufio-settings] Sidebar store not found");
        return;
      }

      // Add settings item to sidebar if it doesn't exist
      const existingItem = sidebarStore.navItems.find(item => item.id === "settings");
      if (!existingItem) {
        sidebarStore.addNavItem({
          id: "settings",
          title: "Settings",
          icon: Settings2,
          url: config.baseUrl,
          isActive: isSettingsRoute(route.path),
          order: 40,
          module: "settings",
          items: []
        });
      }

      // Load schema and update sidebar
      await settingsSidebarStore.loadSettingsSchema(true); // Force refresh
      updateSidebarSettingsItems(sidebarStore, settingsSidebarStore);
      
      // Update active states based on current route
      updateActiveStates();
      
      // Mark settings as loaded
      settingsLoaded.value = true;
      
      if (config.debug) {
        console.info("[stufio-settings] Settings data loaded successfully");
      }
    } catch (err) {
      console.error("[stufio-settings] Error loading settings data:", err);
    }
  };

  // Initial setup on app mount
  nuxtApp.hook("app:mounted", async () => {
    if (config.debug) {
      console.info("[stufio-settings] App mounted");
    }
    
    try {
      const sidebarStore = useSidebarStore();
      if (!sidebarStore) {
        console.warn("[stufio-settings] Sidebar store not found");
        return;
      }

      // Add settings item to sidebar (without subitems initially)
      sidebarStore.addNavItem({
        id: "settings",
        title: "Settings",
        icon: Settings2,
        url: config.baseUrl,
        isActive: isSettingsRoute(route.path),
        order: 40,
        module: "settings",
        items: []
      });
      
      // Set up watchers when component mounts, only on client-side
      if (process.client) {
        // Watch for auth status changes
        const auth = useAuth();
        
        // Check if user is already authenticated
        if (auth.isAuthenticated) {
          await loadSettingsData();
        }

        // Watch for auth token changes
        const stopAuthWatcher = watch(
          () => localStorage.getItem('stufio-admin-token'),
          async (newToken) => {
            if (newToken && !settingsLoaded.value) {
              // Reload settings data when user logs in
              await loadSettingsData();
            } else if (!newToken && settingsLoaded.value) {
              // Reset loaded state when user logs out
              settingsLoaded.value = false;
            }
          },
          { immediate: true }
        );
        
        // Add to cleanup functions
        cleanupFunctions.push(stopAuthWatcher);
        
        // 1. Watch for schema changes
        const stopSchemaWatcher = watch(
          () => settingsSidebarStore.settingsSchema,
          (newSchema) => {
            if (newSchema) {
              try {
                updateSidebarSettingsItems(sidebarStore, settingsSidebarStore);
                updateActiveStates();
              } catch (err) {
                console.error("[stufio-settings] Error updating settings:", err);
              }
            }
          }
        );
        
        // 2. Watch for route changes
        const stopRouteWatcher = watch(
          () => route.path,
          (newPath) => {
            updateActiveStates();
          }
        );
        
        cleanupFunctions.push(stopSchemaWatcher, stopRouteWatcher);
        
        // 3. Also hook into router events for more reliable updates
        router.afterEach(() => {
          updateActiveStates();
        });
      }
      
    } catch (err) {
      console.error("[stufio-settings] Error initializing settings:", err);
    }
  });
  
  // Update settings items function remains the same
  function updateSidebarSettingsItems(sidebarStore, settingsSidebarStore) {
    if (!settingsSidebarStore.settingsSchema) {
      console.warn("[stufio-settings] No settings schema available");
      return;
    }
    
    // Get the settings item from sidebar
    const settingsItem = sidebarStore.navItems.find(item => item.id === "settings");
    if (!settingsItem) {
      console.warn("[stufio-settings] Settings item not found in sidebar");
      return;
    }
    
    // Map of icon names to components
    const iconMap = {
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
    const settingsSubitems = Object.values(settingsSidebarStore.settingsSchema.groups)
      .map(group => {
        // Get icon component or fallback to Settings2
        const iconComponent = group.icon && iconMap[group.icon] ? 
          iconMap[group.icon] : Settings2;
        
        return {
          id: group.id,
          title: group.label,
          url: `${config.baseUrl}/${group.id}`,
          isActive: false,
          icon: iconComponent
        };
      })
      .sort((a, b) => {
        const groupA = settingsSidebarStore.settingsSchema?.groups[a.id];
        const groupB = settingsSidebarStore.settingsSchema?.groups[b.id];
        return (groupA?.order || 100) - (groupB?.order || 100);
      });
    
    // Update the items in sidebar store
    sidebarStore.addNavItem({
      ...settingsItem,
      items: settingsSubitems
    });
  }

  // Clean up watchers when plugin is unmounted
  nuxtApp.hook("app:beforeUnmount", () => {
    cleanupFunctions.forEach(fn => typeof fn === 'function' && fn());
  });

  return {
    provide: {
      stufioSettings: config,
    },
  };
});
