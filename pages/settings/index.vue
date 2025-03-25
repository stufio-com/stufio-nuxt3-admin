<script setup>
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

import { useRouter } from 'vue-router';
import { useSidebarStore } from '@/stores/sidebar';
import { ref, onMounted, watch } from 'vue';

const router = useRouter();
const sidebarStore = useSidebarStore();
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    // Load settings schema if not already loaded
    if (!sidebarStore.settingsSchema) {
      await sidebarStore.loadSettingsSchema();
    }
    
    // Wait for settings to load if they're currently loading
    if (sidebarStore.loading) {
      await new Promise((resolve) => {
        const unwatch = watch(
          () => sidebarStore.loading,
          (isLoading) => {
            if (!isLoading) {
              unwatch();
              resolve();
            }
          }
        );
      });
    }
    
    // Handle error
    if (sidebarStore.error) {
      error.value = sidebarStore.error;
      loading.value = false;
      return;
    }
    
    // Redirect to first available group
    if (sidebarStore.settingsGroups.length > 0) {
      router.replace(`/settings/${sidebarStore.settingsGroups[0].id}`);
    } else {
      error.value = "No settings groups available.";
      loading.value = false;
    }
  } catch (err) {
    error.value = err.message || "Failed to load settings";
    loading.value = false;
  }
});

const retryLoading = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    await sidebarStore.loadSettingsSchema(true);
    
    // Redirect to first available group
    if (sidebarStore.settingsGroups.length > 0) {
      router.replace(`/settings/${sidebarStore.settingsGroups[0].id}`);
    } else {
      error.value = "No settings groups available.";
      loading.value = false;
    }
  } catch (err) {
    error.value = err.message || "Failed to load settings";
    loading.value = false;
  }
};
</script>

<template>
  <header
    class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
    <div class="flex items-center gap-2 px-4">
      <SidebarTrigger class="-ml-1" />
      <Separator orientation="vertical" class="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  </header>
  
  <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
    <div v-if="loading" class="flex justify-center items-center min-h-[300px]">
      <div class="spinner h-10 w-10"></div>
    </div>
    
    <div v-else-if="error" class="bg-card rounded-lg shadow p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
      <p class="text-destructive mb-6">{{ error }}</p>
      <button
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
        @click="retryLoading"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 mr-2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 21h5v-5"></path></svg>
        Try Again
      </button>
    </div>
  </div>
</template>

<style scoped>
.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-left-color: #3b82f6;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>