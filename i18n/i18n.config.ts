// i18n.config.ts
export default {
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  missingWarn: process.env.NODE_ENV === 'development',
  fallbackWarn: process.env.NODE_ENV === 'development',
  escapeParameter: true,
  
  // This handler runs when a translation key is missing
  missing: async (locale: string, key: string) => {
    // Return the key for English, empty string for other locales
    const value = locale === 'en' ? key : '';
    
    // Only in development, save the key to locale files
    if (process.env.NODE_ENV === 'development') {
      console.log(`[i18n] Saving missing key: "${key}" for locale: "${locale}"`);
      console.log(`[i18n] Value: "${value}"`);
      if (process.client) {
        console.log(`[i18n] calling API to save key: "${key}" for locale: "${locale}"`);
        // Call the API to save the key
        fetch("/api/_i18n/update-key", {
          method: "POST",
          body: JSON.stringify({ locale, key, value }),
          headers: { "Content-Type": "application/json" },
        }).catch((err) => console.error("Failed to save key:", err));
      } else {
        console.log(`[i18n] saving key at server: "${key}" for locale: "${locale}"`);
        // Server-side rendering, save directly
        const fs = require("fs").promises;
        const { resolve } = require("path");
        
        const localesDir = resolve(process.cwd(), "locales");
        const filePath = resolve(localesDir, `${locale}.json`);
        
        // Read existing translations
        let translations: Record<string, string> = {};
        try {
          const content = await fs.readFile(filePath, "utf8");
          translations = JSON.parse(content);
        } catch (err) {
          console.log(`Creating new locale file for ${locale}`);
        }

        console.log(`[i18n] Adding key: "${key}" to ${locale}.json`);
        
        // Add new key if it doesn't exist
        if (!translations[key]) {
          translations[key] =
            value !== undefined ? value : locale === "en" ? key : "";

          // Sort keys alphabetically for consistency
          const sortedTranslations = Object.fromEntries(
            Object.entries(translations).sort(([a], [b]) => a.localeCompare(b))
          );

          // Write back to file with pretty formatting
          await fs.writeFile(
            filePath,
            JSON.stringify(sortedTranslations, null, 2) + "\n",
            "utf8"
          );

          console.log(`Added key "${key}" to ${locale}.json`);
        }
      }
    }
    
    return value;
  }
}