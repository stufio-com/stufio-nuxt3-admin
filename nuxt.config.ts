// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  debug: false,
  devtools: {
    enabled: process.env.NUXT_DEV_TOOLS === "true",
    vscode: {
      enabled: true,
    },
    timeline: {
      enabled: true,
    },
  },
  nitro: {
    logLevel: process.env.NODE_ENV === "development" ? "debug" : "info",
  },
  modules: [
    "@nuxtjs/tailwindcss",
    "@vueuse/nuxt",
    "shadcn-nuxt",
    "nuxt-open-fetch",
    "@nuxtjs/google-fonts",
    "@pinia/nuxt",
    // "stufio-nuxt-locale",
    "./stufio-nuxt-locale/src/module",
  ],
  stufioi18n: {
    // The default locale to use if none is detected
    defaultLocale: "en",

    // Available locales in your application
    locales: ["en", "pl", "ru"],

    // Your API endpoint for loading translations
    apiEndpoint: process.env.NUXT_API_INTERNAL_URL || "",

    // Module name to fetch specific translations for
    moduleName: "admin",

    // Whether to detect browser language
    detectBrowserLocale: true,

    // Cookie name for storing locale preference
    cookieName: "locale",

    // Headers to send with API requests
    apiHeaders: {
      "X-API-Secret": process.env.NUXT_API_SECRET,
      "X-API-Client": "stufio-admin",
    },
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: "./components/ui",
  },
  devServer: {
    host: "0.0.0.0",
    port: 3000,
  },
  openFetch: {
    clients: {
      api: {
        schema: process.env.NUXT_API_OPENAPI || "./openapi/openapi.json",
        baseURL: process.env.NUXT_API_URL || "/",
      },
    },
  },
  runtimeConfig: {
    // Private keys are only available on the server
    apiInternalBaseURL:
      process.env.NUXT_API_INTERNAL_URL || process.env.NUXT_API_URL || "/",
    apiSecret: process.env.NUXT_API_SECRET || "development-secret-key",
    apiClient: process.env.NUXT_API_CLIENT || "stufio-admin",
    i18nModule: process.env.NUXT_I18N_MODULE || "admin",
  },
  googleFonts: {
    families: {
      Roboto: true,
      "Lexend Deca": "200..400",
    },
  },
  app: {
    head: {
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: "/_nuxt/assets/favicon/favicon.ico",
        },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/_nuxt/assets/favicon/apple-touch-icon.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/_nuxt/assets/favicon/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/_nuxt/assets/favicon/favicon-16x16.png",
        },
        { rel: "manifest", href: "/_nuxt/assets/favicon/site.webmanifest" },
      ],
      script: [
        {
          innerHTML: `
            (function() {
              // Prevent transitions during theme setup
              document.documentElement.classList.add('no-transitions');

              // Get stored theme preference
              const theme = localStorage.getItem('stufio-color-mode') || 'system';
              
              // If theme is explicitly set to dark, apply it immediately
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
              } else if (theme === 'system') {
                // Check system preference
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (systemPrefersDark) {
                  document.documentElement.classList.add('dark');
                }
              }
    
              // Remove the no-transitions class after a short delay
              setTimeout(function() {
                document.documentElement.classList.remove('no-transitions');
              }, 100);
            })();
          `,
          type: "text/javascript",
          // This ensures the script runs before any HTML is rendered
          hid: "color-mode-script",
        },
      ],
    },
  },
});