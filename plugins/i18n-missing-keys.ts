export default defineNuxtPlugin((nuxtApp) => {
  if (process.env.NODE_ENV !== "development") return;

  const addMissingKey = (locale: string, key: string) => {
    console.log(`[i18n] Adding missing key: "${key}" for locale: "${locale}"`);
    
    // Set value based on locale
    const value = locale === 'en' ? key : '';
    
    // Save to file via API
    fetch('/api/_i18n/update-key', {
      method: 'POST',
      body: JSON.stringify({ locale, key, value }),
      headers: { 'Content-Type': 'application/json' }
    }).catch(err => console.error('Failed to save key:', err));
    
    return key;
  };

  // Method 1: Override console.warn to catch i18n warnings
  if (process.client) {
    const originalWarn = console.warn;
    console.warn = function(...args) {
      const message = args.join(' ');
      if (message.includes('[intlify] Not found') && message.includes('locale messages')) {
        const match = message.match(/Not found '([^']+)' key in '([^']+)' locale messages/);
        if (match) {
          const key = match[1];
          const locale = match[2];
          addMissingKey(locale, key);
        }
      }
      return originalWarn.apply(console, args);
    };
  }

  // Method 2: Try to patch i18n instance in components
  nuxtApp.vueApp.mixin({
    mounted() {
      if (!this.$i18n) return;
      
      const i18n = this.$i18n;
      
      // Try to add our handler to the missing option
      if (i18n.missing === undefined) {
        i18n.missing = addMissingKey;
      }
      if (i18n.missingWarn === undefined) {
        i18n.missingWarn = addMissingKey;
      }
      
      // For Intlify Vue I18n Extensions setup
      if (i18n.__intlify && !i18n.__patched) {
        i18n.__patched = true;
        
        // Try to patch the warnMissing function if it exists
        if (typeof i18n.__intlify.warnMissing === 'function') {
          const originalWarnMissing = i18n.__intlify.warnMissing;
          i18n.__intlify.warnMissing = function(key, locale) {
            addMissingKey(locale, key);
            return originalWarnMissing.apply(this, arguments);
          };
          console.log('[i18n] Successfully patched warnMissing in __intlify');
        }
      }
    }
  });

  // Method 3: Configure i18n runtime options
  // This needs to happen early to be effective
  try {
    const i18n = nuxtApp.$i18n;
    if (i18n) {
      // Set missing handler
      i18n.missing = addMissingKey;
      i18n.missingWarn = addMissingKey;
      
      // Make sure warnings are enabled
      if (i18n.__intlify && i18n.__intlify.fallbackWarn === false) {
        i18n.__intlify.fallbackWarn = true;
      }
      if (i18n.__intlify && i18n.__intlify.missingWarn === false) {
        i18n.__intlify.missingWarn = true;
      }
      
      console.log('[i18n] Missing key handler installed on global i18n instance');
    }
  } catch (err) {
    console.error('[i18n] Failed to configure global instance:', err);
  }
});