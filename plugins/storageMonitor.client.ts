import { useEventBus, AppEvents } from "~/composables/useEventBus";

export default defineNuxtPlugin(() => {
  // Only run on client side
  if (!process.client) return;
  
  const eventBus = useEventBus();
  
  // Monitor storage events (for when storage is cleared in another tab)
  window.addEventListener('storage', (event) => {
    // Check if localStorage was cleared
    if (event.key === null) {
      eventBus.emit(AppEvents.STORAGE_CLEARED);
    }
  });
  
  // Add a method to clear storage with event emission
  const clearStorage = () => {
    localStorage.clear();
    eventBus.emit(AppEvents.STORAGE_CLEARED);
  };
  
  return {
    provide: {
      clearStorage
    }
  };
});