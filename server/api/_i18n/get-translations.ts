import { defineEventHandler, getQuery } from "h3";
import { useRuntimeConfig } from "#imports";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const config = useRuntimeConfig();
    
    const locale = query.locale?.toString();
    const defaultModule = config.i18nModule;
    const module_name = query.module_name?.toString() || defaultModule;
    
    // Get API credentials
    const apiSecret = config.apiSecret;
    const apiClient = config.apiClient;
    const apiBaseURL = config.apiInternalBaseURL || config.public.apiBase;
    
    if (!locale) {
      console.warn("[Server] Missing locale parameter");
      return { error: "Missing locale parameter" };
    }
    
    if (!apiSecret) {
      console.error("[Server] API secret is not configured");
      return { error: "API configuration missing" };
    }

    console.log(`[Server] Fetching translations for locale: ${locale}, module: ${module_name}`);
    
    try {
      // Use standard $fetch for API call
      const url = `${apiBaseURL}/api/v1/i18n/translations/locale/${locale}`;
      console.log(`[Server] Requesting from: ${url}`);
      
      const result = await $fetch(url, {
        method: "GET",
        params: { module: module_name },
        headers: {
          "X-API-Secret": apiSecret,
          "X-API-Client": apiClient,
        }
      });
      
      console.log(`[Server] Retrieved ${Object.keys(result || {}).length} translations`);
      return result;
    } catch (apiError: any) {
      // Handle API errors with consistent format
      const errorMessage = 
        apiError.data?.detail || 
        apiError.message || 
        `API error: ${apiError.status || 'unknown'}`;
      
      console.error(`[Server] ${errorMessage}`);
      return { error: errorMessage };
    }
  } catch (err: any) {
    console.error("[Server] Unexpected error:", err);
    return { error: err.message };
  }
});