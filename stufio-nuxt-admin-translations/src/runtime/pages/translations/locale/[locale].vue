<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTranslationsStore } from '../../../stores/translations';
import { ChevronLeft, Globe } from 'lucide-vue-next';
import TranslationsGrid from '../../../components/translations/Grid.vue';

const route = useRoute();
const router = useRouter();
const translationsStore = useTranslationsStore();

// Get locale from route params
const locale = computed(() => route.params.locale as string);

// Format locale for display
const formattedLocale = computed(() => {
  try {
    return new Intl.DisplayNames([locale.value], { type: 'language' }).of(locale.value);
  } catch (e) {
    return locale.value;
  }
});

// Check if locale is valid
onMounted(async () => {
  // Load locales if not already loaded
  if (translationsStore.locales.length === 0) {
    await translationsStore.fetchLocales();
  }
  
  // Redirect to main page if locale is invalid
  if (!translationsStore.locales.includes(locale.value)) {
    const config = useRuntimeConfig().public.stufioTranslations;
    router.replace(config.baseUrl);
  }
});

// Go back to translations list
const goBack = () => {
  const config = useRuntimeConfig().public.stufioTranslations;
  router.push(config.baseUrl);
};
</script>

<template>
  <div>
    <header class="mb-8">
      <button @click="goBack" class="mb-2 flex items-center text-muted-foreground hover:text-foreground">
        <ChevronLeft class="h-4 w-4 mr-1" />
        Back to locales
      </button>
      
      <div class="flex items-center">
        <div class="bg-primary/10 text-primary rounded-md p-2 mr-3">
          <Globe class="h-6 w-6" />
        </div>
        <div>
          <h1 class="text-3xl font-bold">{{ formattedLocale }}</h1>
          <p class="text-muted-foreground">Locale: {{ locale }}</p>
        </div>
      </div>
    </header>

    <!-- Translations grid -->
    <TranslationsGrid :locale="locale" />
  </div>
</template>