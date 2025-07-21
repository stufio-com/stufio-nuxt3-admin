export interface ModuleOptions {
  /**
   * Base URL for translations pages
   * @default '/translations'
   */
  baseUrl: string;

  /**
   * API endpoint for translations
   * @default '/api/v1/i18n'
   */
  apiEndpoint: string;

  /**
   * Layout to use for translations pages
   * @default 'dashboard'
   */
  layout: string;

  /**
   * Enable debug mode
   * @default false
   */
  debug: boolean;
}

/**
 * Translation entry interface
 */
export interface TranslationEntry {
  key: string;
  value: string;
  module: string;
  locale: string;
  isNew?: boolean;
  modified?: boolean;
}

/**
 * Translation statistics interface
 */
export interface TranslationStats {
  total: number;
  missing: number;
  locales: Record<string, {
    total: number;
    missing: number;
    completion: number;
  }>;
}