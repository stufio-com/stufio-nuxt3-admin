interface EventMap {
  [key: string]: Array<(...args: any[]) => void>;
}

// Creating a single instance that persists across imports
const events = ref<EventMap>({});

/**
 * A simple type-safe event bus implementation
 */
export function useEventBus() {
  /**
   * Register a listener for a specific event
   * 
   * @param event Event name to listen for
   * @param callback Function to call when event is emitted
   * @returns Unsubscribe function to remove the listener
   */
  const on = <T = any>(event: string, callback: (payload?: T) => void) => {
    if (!events.value[event]) {
      events.value[event] = [];
    }
    
    events.value[event].push(callback);
    
    // Return unsubscribe function
    return () => {
      if (!events.value[event]) return;
      
      const index = events.value[event].indexOf(callback);
      if (index !== -1) {
        events.value[event].splice(index, 1);
        
        // Clean up empty event arrays
        if (events.value[event].length === 0) {
          delete events.value[event];
        }
      }
    };
  };
  
  /**
   * Emit an event with optional payload
   * 
   * @param event Event name to emit
   * @param payload Optional data to pass to listeners
   */
  const emit = <T = any>(event: string, payload?: T) => {
    if (events.value[event]) {
      events.value[event].forEach((callback: (...args: any[]) => void) => {
        callback(payload);
      });
    }
  };
  
  /**
   * Check if an event has listeners
   * 
   * @param event Event name to check
   * @returns True if event has listeners
   */
  const hasListeners = (event: string): boolean => {
    return Boolean(events.value[event]?.length);
  };
  
  /**
   * Get the count of listeners for an event
   * 
   * @param event Event name
   * @returns Number of listeners
   */
  const listenerCount = (event: string): number => {
    return events.value[event]?.length || 0;
  };
  
  /**
   * Remove all listeners for a specific event
   * 
   * @param event Event name to clear
   */
  const clear = (event: string) => {
    if (events.value[event]) {
      delete events.value[event];
    }
  };
  
  /**
   * Reset the entire event bus (remove all listeners)
   */
  const reset = () => {
    events.value = {};
  };
  
  return {
    on,
    emit,
    hasListeners,
    listenerCount,
    clear,
    reset,
    // For debugging
    events: readonly(events)
  };
}

/**
 * Define common event types for type safety
 */
export const AppEvents = {
  LOGOUT: 'auth:logout',
  LOGIN: 'auth:login',
  TOKEN_REFRESH: 'auth:token-refresh',
  STORAGE_CLEARED: 'storage:cleared',
  // Add other events as needed
};