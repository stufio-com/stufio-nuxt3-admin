import type { ModuleOptions } from "./types";

export const defaults: ModuleOptions = {
  schemaEndpoint: "/api/v1/admin/settings/schemas", // API endpoint for settings schema
  getEndpoint: "/api/v1/admin/settings/get", // API endpoint to get settings values
  saveEndpoint: "/api/v1/admin/settings/save", // API endpoint to get settings values
  cacheEndpoint: "/api/v1/admin/settings/refresh-cache", // API endpoint to clear settings cache
  layout: "dashboard",
  baseUrl: '/settings',
  refreshInterval: 60000, // 1 minute
  debug: false,
};
