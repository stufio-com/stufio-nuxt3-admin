# STUFIO.com Admin Panel with Nuxt3 Vue.js

A modular, extensible admin interface built with Nuxt 3 and Vue.js for the Stufio framework.

## Overview

This admin panel provides a unified interface for managing Stufio core modules and application-specific extensions. Built with Nuxt 3 and Vue.js, it offers a modern, responsive UI with authentication, modular architecture, and comprehensive dashboard features.

## Features

- **🔐 Authentication & Authorization** - Secure login with role-based access control
- **📊 Analytics Dashboard** - Visual data representation and key metrics
- **🧩 Modular Architecture** - Extensible plugin system for application modules
- **🔌 Core Module Management** - Built-in interfaces for all Stufio core modules
- **📱 Responsive Design** - Works on desktop, tablet, and mobile
- **🌙 Dark/Light Mode** - Customizable UI theme
- **🔍 Advanced Search** - Global search across all modules and content
- **🌐 Internationalization** - Multi-language support

## Getting Started

### Prerequisites

- Node.js 18.x or later
- Yarn or npm
- Stufio backend API running

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/stufio-nuxt3-admin.git
cd stufio-nuxt3-admin

# Install dependencies
yarn install

# Configure environment variables
cp .env.example .env
# Edit .env with your settings

# Start development server
yarn dev
```

## Project Structure

```
stufio-nuxt3-admin/
├── assets/               # Static assets
├── components/           # Vue components
│   ├── core/             # Core UI components
│   ├── modules/          # Module-specific components
│   └── layouts/          # Layout components
├── composables/          # Vue composables
├── layouts/              # Page layouts
├── middleware/           # Nuxt middleware
├── modules/              # Admin modules
│   ├── activity/         # Activity monitoring module
│   ├── users/            # User management module
│   └── ...
├── pages/                # Application pages
├── plugins/              # Vue plugins
├── public/               # Public static files
├── stores/               # Pinia stores
│   ├── core/             # Core state management
│   └── modules/          # Module-specific stores
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## Extending with Modules

The admin panel is designed to be extended with new modules. Each module follows a standard structure:

```
modules/
└── your-module/
    ├── components/       # Module-specific components
    ├── pages/            # Module pages
    ├── stores/           # Module state management
    ├── types/            # Module type definitions
    ├── api.ts            # API integration
    └── index.ts          # Module entry point
```

### Creating a New Module

1. Create a new folder in `modules/` with your module name
2. Create an `index.ts` file that exports your module definition:

```typescript
// modules/your-module/index.ts
import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  name: 'your-module',
  configKey: 'yourModule',
  setup(options, nuxt) {
    // Register components, routes, etc.
  }
})
```

3. Add your module to the Nuxt config:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    // ...other modules
    '~/modules/your-module'
  ]
})
```

## API Integration

The admin panel connects to Stufio backend APIs using the built-in HTTP client:

```typescript
// Example API call
const { data } = await useFetch('/api/v1/users', {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
```

## Development

```bash
# Start development server with hot-reload
yarn dev

# Lint code
yarn lint

# Run tests
yarn test

# Build for production
yarn build

# Preview production build
yarn preview
```

## Deployment

```bash
# Build the application
yarn build

# Deploy using your preferred hosting solution
# For example, with Docker:
docker build -t stufio-admin .
docker run -p 3000:3000 stufio-admin
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

MIT

## About Stufio

Stufio is a modular framework for building scalable web applications. The admin panel provides a unified interface for managing all aspects of your Stufio-powered application.