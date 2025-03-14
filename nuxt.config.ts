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
  ],
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
      },
    },
  },
  runtimeConfig: {
    // Private keys are only available on the server
    apiSecret: process.env.NUXT_API_SECRET || "123",
    openFetch: {
      api: {
        baseURL: (process.env.NUXT_API_URL || "") + "/",
      },
    },
  },
});