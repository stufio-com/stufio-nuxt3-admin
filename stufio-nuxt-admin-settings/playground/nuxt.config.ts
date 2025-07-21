import { defineNuxtConfig } from "nuxt/config";
import stufioAdminSettings from "../src/module";

export default defineNuxtConfig({
  modules: [stufioAdminSettings],
  stufioSettings: {
    apiEndpoint: "/api/v1/admin/settings",
    layout: "default",
    baseUrl: "/settings",
  },
  devtools: { enabled: true },
});
