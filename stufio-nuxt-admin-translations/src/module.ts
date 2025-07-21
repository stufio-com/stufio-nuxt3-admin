import {
  addPlugin,
  createResolver,
  defineNuxtModule,
  addComponent,
  addImportsDir,
  extendPages,
} from "@nuxt/kit";
import { fileURLToPath } from "url";
import { defu } from "defu";
import type { ModuleOptions } from "./types";
import { defaults } from "./defaults";

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "stufio-nuxt-admin-translations",
    configKey: "stufioTranslations",
    compatibility: {
      nuxt: "^3.0.0",
    },
  },
  defaults,
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url);
    const runtimeDir = fileURLToPath(new URL("./runtime", import.meta.url));

    // Transpile runtime
    nuxt.options.build.transpile.push(runtimeDir);

    // Add plugin to expose module options
    addPlugin(resolve(runtimeDir, "plugins/translations.ts"));

    // Add event handler plugin
    addPlugin(resolve(runtimeDir, "plugins/translationsEvents.ts"));

    // Add sidebar integration plugin
    addPlugin(resolve(runtimeDir, "plugins/translationsSidebar.ts"));

    // Add components
    addComponent({
      name: "TranslationsGrid",
      filePath: resolve(runtimeDir, "components/translations/Grid.vue"),
    });
    addComponent({
      name: "TranslationsEditModal",
      filePath: resolve(runtimeDir, "components/translations/EditModal.vue"),
    });
    addComponent({
      name: "TranslationsLocaleSelector",
      filePath: resolve(runtimeDir, "components/translations/LocaleSelector.vue"),
    });
    addComponent({
      name: "TranslationsFilter",
      filePath: resolve(runtimeDir, "components/translations/TranslationsFilter.vue"),
    });
    addComponent({
      name: "TranslationsNoResults",
      filePath: resolve(runtimeDir, "components/translations/NoResults.vue"),
    });

    // Add composables
    addImportsDir(resolve(runtimeDir, "composables"));

    // Add stores
    addImportsDir(resolve(runtimeDir, "stores"));

    // Add pages using extendPages
    const prefix = options.baseUrl.startsWith("/")
      ? options.baseUrl
      : `/${options.baseUrl}`;
      
    extendPages((pages) => {
      // Add the main translations page
      pages.push({
        name: "translations",
        path: prefix,
        file: resolve(runtimeDir, "pages/translations/index.vue"),
        meta: { layout: options.layout, middleware: "auth" },
      });
      
      // Add the locale-specific page
      pages.push({
        name: 'translations-locale',
        path: `${prefix}/:locale`,
        file: resolve(runtimeDir, 'pages/translations/locale/[locale].vue'),
        meta: { layout: options.layout, middleware: "auth" }
      });
    });

    // Expose runtime config
    nuxt.options.runtimeConfig.public.stufioTranslations = defu(
      nuxt.options.runtimeConfig.public.stufioTranslations,
      {
        apiEndpoint: options.apiEndpoint,
        baseUrl: options.baseUrl,
        layout: options.layout,
        debug: options.debug,
      }
    );

    // Add types
    nuxt.hook("prepare:types", (options) => {
      options.references.push({
        path: resolve(nuxt.options.buildDir, "types/stufio-translations.d.ts"),
      });
    });
  },
});

// Export module options type for better TypeScript support
export * from "./types";