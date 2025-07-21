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
    name: "stufio-nuxt-admin-settings",
    configKey: "stufioSettings",
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
    addPlugin(resolve(runtimeDir, "plugins/settings.ts"));

    // Add event handler plugin
    addPlugin(resolve(runtimeDir, "plugins/settingsEvents.ts"));

    // Add components
    addComponent({
      name: "SettingsForm",
      filePath: resolve(runtimeDir, "components/settings/Form.vue"),
    });
    addComponent({
      name: "SettingsSideNav",
      filePath: resolve(runtimeDir, "components/settings/SideNav.vue"),
    });
    addComponent({
      name: "FieldRenderer",
      filePath: resolve(runtimeDir, "components/settings/FieldRenderer.vue"),
    });

    // Add field components
    const fieldComponents = [
      'StringField', 'NumberField', 'EmailField', 'UrlField', 'PasswordField', 
      'TextField', 'SelectField', 'MultiSelectField', 'DateField', 'DateTimeField',
      'TimeField', 'ColorField', 'FileField', 'SwitchField', 'RadioField',
      'CheckboxField', 'HtmlField', 'MarkdownField', 'SliderField', 'RangeField',
      'ImageField'
    ];

    fieldComponents.forEach(component => {
      addComponent({
        name: component,
        filePath: resolve(runtimeDir, `components/settings/fields/${component}.vue`),
      });
    });

    // Add composables
    addImportsDir(resolve(runtimeDir, "composables"));

    // Add stores
    addImportsDir(resolve(runtimeDir, "stores"));

    // Add pages using extendPages instead of addPagesDir
    const prefix = options.baseUrl.startsWith("/")
      ? options.baseUrl
      : `/${options.baseUrl}`;
      
    extendPages((pages) => {
      // Add the main settings page
      pages.push({
        name: "settings",
        path: prefix,
        file: resolve(runtimeDir, "pages/settings/index.vue"),
        meta: { layout: options.layout, middleware: "auth" },
      });
      
      // Add the group settings page
      pages.push({
        name: 'settings-group',
        path: `${prefix}/:group`,
        file: resolve(runtimeDir, 'pages/settings/[group].vue'),
        meta: { layout: options.layout, middleware: "auth" }
      });
    });

    // Expose runtime config
    nuxt.options.runtimeConfig.public.stufioSettings = defu(
      nuxt.options.runtimeConfig.public.stufioSettings,
      {
        schemaEndpoint: options.schemaEndpoint,
        getEndpoint: options.getEndpoint,
        saveEndpoint: options.saveEndpoint,
        cacheEndpoint: options.cacheEndpoint,
        baseUrl: options.baseUrl,
        layout: options.layout,
        refreshInterval: options.refreshInterval,
        debug: options.debug,
      }
    );

    // Add types
    nuxt.hook("prepare:types", (options) => {
      options.references.push({
        path: resolve(nuxt.options.buildDir, "types/stufio-settings.d.ts"),
      });
    });
  },
});

// Export module options type for better TypeScript support
export * from "./types";
