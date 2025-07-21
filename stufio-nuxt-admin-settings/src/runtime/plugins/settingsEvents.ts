import { defineNuxtPlugin } from '#app';
import { useEventBus, AppEvents } from '#imports'; 
import { useSettingsStore } from '../stores/settings';
import { useSettingsSidebarStore } from '../stores/settingsSidebar';

export default defineNuxtPlugin(nuxtApp => {
  // Only set up event listeners on client-side
  if (!process.client) return;
  
  const eventBus = useEventBus();
  const cleanupFunctions: (() => void)[] = [];
  
  // Function to reload settings data
  const reloadSettings = async () => {
    const settingsStore = useSettingsStore();
    const sidebarStore = useSettingsSidebarStore();
    
    try {
      await sidebarStore.loadSettingsSchema(true);
      settingsStore.resetLoadedSubgroups();
    } catch (err) {
      console.error('[settings-events] Error reloading settings:', err);
    }
  };
  
  // Set up event listeners
  
  // On login - reload settings
  const unsubscribeLogin = eventBus.on(AppEvents.LOGIN, async () => {
    console.log('[settings-events] User logged in, reloading settings');
    await reloadSettings();
  });
  
  // On logout - clear settings
  const unsubscribeLogout = eventBus.on(AppEvents.LOGOUT, () => {
    console.log('[settings-events] User logged out, clearing settings');
    const settingsStore = useSettingsStore();
    settingsStore.clearSettings();
  });
  
  // On storage cleared - reset and reload
  const unsubscribeStorageCleared = eventBus.on(AppEvents.STORAGE_CLEARED, async () => {
    console.log('[settings-events] Storage cleared, reloading settings');
    await reloadSettings();
  });
  
  // Add to cleanup functions
  cleanupFunctions.push(unsubscribeLogin, unsubscribeLogout, unsubscribeStorageCleared);
  
  // Clean up on unmount
  nuxtApp.hook('app:beforeUnmount', () => {
    cleanupFunctions.forEach(fn => typeof fn === 'function' && fn());
  });
});