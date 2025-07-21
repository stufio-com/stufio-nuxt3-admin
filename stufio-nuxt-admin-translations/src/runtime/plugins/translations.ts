import { defineNuxtPlugin, useRuntimeConfig } from "#app";

export default defineNuxtPlugin(nuxtApp => {
  const config = useRuntimeConfig().public.stufioTranslations;
  
  if (config.debug) {
    console.info("🌐 Stufio Translations Module Initialized:", config);
  }
  
  // Set up global utilities if needed
  return {
    provide: {
      stufioTranslations: config,
    },
  };
});