<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useTranslationsStore } from '../../stores/translations';
import { Globe, Plus } from 'lucide-vue-next';
import { Skeleton } from '../../components/ui/skeleton';

const translationsStore = useTranslationsStore();
const router = useRouter();
const loading = ref(true);

// Load all available locales
onMounted(async () => {
  try {
    await translationsStore.fetchLocales();
    await translationsStore.fetchStats();
    loading.value = false;
  } catch (error) {
    console.error('Failed to load locales:', error);
    loading.value = false;
  }
});

// Navigate to specific locale
const navigateToLocale = (locale: string) => {
  const config = useRuntimeConfig().public.stufioTranslations;
  router.push(`${config.baseUrl}/${locale}`);
};

// Format locale code for display
const formatLocale = (locale: string) => {
  try {
    return new Intl.DisplayNames([locale], { type: 'language' }).of(locale);
  } catch (e) {
    return locale;
  }
};

// Calculate completion percentage
const getCompletion = (locale: string) => {
  if (!translationsStore.stats) return 0;
  const localeStats = translationsStore.stats.locales[locale];
  if (!localeStats) return 0;
  return localeStats.completion || 0;
};
</script>

<template>
  <div>
    <header class="mb-8">
      <h1 class="text-3xl font-bold">Translations</h1>
      <p class="text-muted-foreground mt-1">Manage your application translations</p>
    </header>

    <!-- Loading skeleton -->
    <div v-if="loading" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 6" :key="i" class="border rounded-lg p-4">
        <div class="flex items-center space-x-3 mb-2">
          <Skeleton class="h-8 w-8 rounded-md" />
          <Skeleton class="h-5 w-32" />
        </div>
        <Skeleton class="h-4 w-full mt-2" />
        <Skeleton class="h-4 w-3/4 mt-1" />
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="translationsStore.locales.length === 0" class="text-center py-8 border rounded-lg">
      <Globe class="h-12 w-12 mx-auto text-muted-foreground" />
      <h3 class="mt-4 text-lg font-semibold">No locales available</h3>
      <p class="text-muted-foreground">Configure locales in your application settings</p>
    </div>

    <!-- Locales grid -->
    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div 
        v-for="locale in translationsStore.locales" 
        :key="locale"
        class="border rounded-lg p-4 hover:border-primary cursor-pointer transition-colors"
        @click="navigateToLocale(locale)"
      >
        <div class="flex items-center space-x-3 mb-3">
          <div class="bg-primary/10 text-primary rounded-md p-2">
            <Globe class="h-5 w-5" />
          </div>
          <div>
            <h3 class="font-medium">{{ formatLocale(locale) }}</h3>
            <p class="text-sm text-muted-foreground">{{ locale }}</p>
          </div>
        </div>
        
        <!-- Progress bar -->
        <div class="w-full bg-secondary rounded-full h-2 mb-2">
          <div 
            class="bg-primary h-2 rounded-full" 
            :style="{ width: `${getCompletion(locale)}%` }"
          ></div>
        </div>
        
        <p class="text-sm text-muted-foreground">
          {{ getCompletion(locale) }}% complete
        </p>
      </div>

      <!-- Add new locale card -->
      <div 
        class="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary transition-colors"
        @click="$router.push('/settings/localization')"
      >
        <div class="bg-primary/10 text-primary rounded-full p-3 mb-3">
          <Plus class="h-5 w-5" />
        </div>
        <h3 class="font-medium">Add new locale</h3>
        <p class="text-sm text-muted-foreground mt-1">Configure in settings</p>
      </div>
    </div>
  </div>
</template>