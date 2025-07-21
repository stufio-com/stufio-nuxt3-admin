export interface ModuleOptions {
  /**
   * API endpoint for settings
   * @default '/api/v1/admin/settings/schemas'
   */
  schemaEndpoint: string;

  /**
   * API endpoint to get settings values
   * @default '/api/v1/admin/settings/get'
   */
  getEndpoint: string;

  /**
   * API endpoint to save settings values
   * @default '/api/v1/admin/settings/save'
   */
  saveEndpoint: string;

  /**
   * API endpoint to clear settings cache
   * @default '/api/v1/admin/settings/refresh-cache'
   */
  cacheEndpoint: string;

  /**
   * Base URL for settings pages
   * @default '/settings'
   */
  baseUrl: string;

  /**
   * Layout to use for settings pages
   * @default 'dashboard'
   */
  layout: string;

  /**
   * Interval in milliseconds to refresh settings cache
   * @default 60000 (1 minute)
   */
  refreshInterval: number;

  /**
   * Enable debug mode
   * @default false
   */
  debug: boolean;
}