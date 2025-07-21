import { defineNuxtPlugin } from '#app';
import { useEventBus } from '~/composables/useEventBus';

export default defineNuxtPlugin(nuxtApp => {
  const eventBus = useEventBus();
  
  return {
    provide: {
      eventBus
    }
  };
});