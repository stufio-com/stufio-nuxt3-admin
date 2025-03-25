import { ref, onMounted, onBeforeUnmount } from "vue";

export function useActivityTracker(
  inactivityThreshold = 1 * 60 * 1000,
  immediate = true
) {
  // Added immediate flag
  const lastActivity = ref(Date.now());
  const isActive = ref(true);
  let cleanupFunctions: (() => void)[] = [];

  // Update last activity timestamp
  const updateActivity = () => {
    lastActivity.value = Date.now();
    if (!isActive.value) {
      isActive.value = true;
      console.log("User is active again");
    }
  };

  // Check if user is active
  const checkActivity = () => {
    const inactive = Date.now() - lastActivity.value > inactivityThreshold;
    if (isActive.value && inactive) {
      isActive.value = false;
      console.log("User became inactive");
    }
    return !inactive;
  };

  // Setup function that can be called immediately or in onMounted
  const setupActivityTracking = () => {
    console.log("Activity tracker setting up");

    // Only run in browser context
    if (typeof window === "undefined") {
      console.log("Activity tracker skipped (not in browser)");
      return;
    }

    const events = [
      "mousedown",
      /* 'mousemove', */ "keypress",
      /*'scroll',*/ "touchstart",
    ];

    // Add event listeners
    events.forEach((event) =>
      window.addEventListener(event, updateActivity, { passive: true })
    );

    // Store cleanup function
    cleanupFunctions.push(() => {
      events.forEach((event) =>
        window.removeEventListener(event, updateActivity)
      );
    });

    // Initial activity timestamp
    updateActivity();

    console.log("Activity tracker started successfully");
  };

  // Clean up all event listeners
  const cleanup = () => {
    cleanupFunctions.forEach((fn) => fn());
    cleanupFunctions = [];
    console.log("Activity tracker cleaned up");
  };

  // If immediate mode, set up right away (for plugins)
  if (immediate && process.client) {
    console.log("Activity tracker initializing immediately (plugin mode)");
    setupActivityTracking();
  }
  // Otherwise use component lifecycle (for components)
  else if (process.client) {
    onMounted(() => {
      console.log("Activity tracker starting on component mount");
      setupActivityTracking();
    });

    onBeforeUnmount(() => {
      cleanup();
    });
  }

  return {
    lastActivity,
    isActive,
    checkActivity,
    updateActivity,
    cleanup, // Expose cleanup for manual handling
  };
}
