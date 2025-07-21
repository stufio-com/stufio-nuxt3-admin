# Stufio Nuxt Admin Settings

A reusable admin settings module for Nuxt applications.

## Features

- Fully configurable settings management system
- Dynamic form generation based on settings schema
- Automatic form validation with Zod and Vee-validate
- Settings grouped by categories and subcategories
- Responsive UI with proper error handling
- Reactive updates when settings change

## Installation

```bash
npm install stufio-nuxt-admin-settings
```

## Setup

Add the module to your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: [
    'stufio-nuxt-admin-settings'
  ],
  stufioSettings: {
    // Configuration options
    apiEndpoint: '/api/v1/admin/settings',
    // Additional configuration...
  }
})
```

## Usage

### Basic Usage

The module will automatically register routes under `/settings` and provide components for managing settings.

### Custom Configuration

You can customize the module's behavior through the `stufioSettings` option in your Nuxt config:

```ts
stufioSettings: {
  schemaEndpoint: '/api/v1/admin/settings/schemas', // API endpoint for settings schema
  getEndpoint: '/api/v1/admin/settings/get', // API endpoint to get settings values
  saveEndpoint: '/api/v1/admin/settings/save', // API endpoint to get settings values
  cacheEndpoint: '/api/v1/admin/settings/refresh-cache', // API endpoint to clear settings cache
  layout: 'dashboard', // Layout to use for settings pages
  baseUrl: '/admin/settings' // Base URL for settings routes
}
```

### Extending the Schema

You can extend the settings schema by using the module's API:

```ts
// In your Nuxt plugin
export default defineNuxtPlugin((nuxtApp) => {
  const settingsModule = useStufioSettings()
  
  // Register additional settings groups
  settingsModule.registerGroup({
    id: 'my-group',
    label: 'My Custom Group',
    description: 'Custom settings for my application',
    icon: 'settings',
    order: 10
  })
  
  // Register settings
  settingsModule.registerSetting({
    key: 'my-setting',
    group: 'my-group',
    label: 'My Setting',
    type: 'string',
    default: 'Default value',
    required: true
  })
})
```

## License

MIT
