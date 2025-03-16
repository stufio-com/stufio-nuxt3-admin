// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: {
    enabled: process.env.NUXT_DEV_TOOLS === "true",
    vscode: {
      enabled: true,
    },
    timeline: {
      enabled: true,
    },
  },
  modules: [
    "@nuxtjs/tailwindcss",
    "@vueuse/nuxt",
    "shadcn-nuxt",
    "nuxt-open-fetch",
    "@nuxtjs/google-fonts",
    "@pinia/nuxt",
    "@nuxtjs/i18n",
  ],
  i18n: {
    locales: [
      { code: "en", name: "English", file: "en.json" },
      { code: "ru", name: "Russian", file: "ru.json" },
    ],
    lazy: true,
    langDir: "locales/", // Make sure this directory exists!
    strategy: "prefix_except_default",
    defaultLocale: "en",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      alwaysRedirect: false,
      redirectOn: "root",
    },
    vueI18n: "./i18n.config.ts", // Use an external config file for vueI18n settings
    debug: process.env.NODE_ENV === "development",
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
        schemaValidation: false, // Add this during development
      },
    },
  },
  runtimeConfig: {
    // Private keys are only available on the server
    apiSecret: process.env.NUXT_API_SECRET || "123",
    public: {
      apiBase: process.env.NUXT_API_URL || "",
    },
  },
  googleFonts: {
    families: {
      Roboto: true,
      "Lexend Deca": "200..400",
    },
  },
});