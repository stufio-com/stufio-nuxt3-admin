import { defineNuxtPlugin } from '#app';
import { Globe } from 'lucide-vue-next';

export default defineNuxtPlugin(nuxtApp => {
  // Only run on client side
  if (!process.client) return;
  
  const config = useRuntimeConfig().public.stufioTranslations;
  
  // Wait for app to be mounted
  nuxtApp.hook('app:mounted', () => {
    try {
      // Import the sidebar store
      const { useSidebarStore } = nuxtApp.$pinia.state.value;
      const sidebarStore = useSidebarStore();
      
      if (!sidebarStore) {
        console.warn('[stufio-translations] Sidebar store not found');
        return;
      }
      
      // Add translations item to sidebar
      sidebarStore.addNavItem({
        id: 'translations',
        title: 'Translations',
        icon: Globe,
        url: config.baseUrl,
        isActive: false,
        order: 35, // Position between Users (30) and Settings (40)
        module: 'translations'
      });
      
      if (config.debug) {
        console.info('[stufio-translations] Added translations to sidebar');
      }
    } catch (err) {
      console.error('[stufio-translations] Error adding translations to sidebar:', err);
    }
  });
});