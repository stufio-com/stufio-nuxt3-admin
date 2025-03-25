<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSidebarStore } from '@/stores/sidebar';
import { RefreshCw } from 'lucide-vue-next';
import { useSettingsStore } from '@/stores/settings';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import SettingsForm from '@/components/stufio/admin/settings/Form.vue';
import SettingsSideNav from '@/components/stufio/admin/settings/SideNav.vue';

const route = useRoute();
const router = useRouter();
const settingsStore = useSettingsStore();
const sidebarStore = useSidebarStore();

// Get the current group from the route
const groupId = computed(() => route.params.group as string);
const activeSubgroup = ref('');

// Get group information
const groupInfo = computed(() => {
  if (!sidebarStore.settingsSchema) return null;
  return sidebarStore.settingsSchema.groups[groupId.value] || null;
});

// Get subgroups for the current group
const subgroups = computed(() => {
  return sidebarStore.settingsSubgroups(groupId.value);
});

// Check if there are settings without a subgroup
const hasGeneralSettings = computed(() => {
  const generalSettings = sidebarStore.filteredSettings(groupId.value, null);
  return generalSettings.length > 0;
});

// All available nav items
const navItems = computed(() => {
  const items = [...subgroups.value];
  
  // Add "General" item if there are settings without a subgroup
  if (hasGeneralSettings.value && !items.some(t => t.id === 'general')) {
    items.unshift({
      id: 'general',
      group_id: groupId.value,
      label: 'General',
      description: 'General settings without a specific subgroup',
      icon: null,
      order: -1,
      module: 'core'
    });
  }
  
  return items.sort((a, b) => a.order - b.order);
});

// Wait for data to be loaded
const dataLoaded = computed(() => {
  return !sidebarStore.loading && sidebarStore.settingsSchema !== null;
});

// Modify the subgroup watcher to force a reload if values are empty
watch(activeSubgroup, async (newValue, oldValue) => {
  if (newValue && groupInfo.value) {
    try {
      // Update URL
      router.replace({
        query: { ...route.query, subgroup: newValue }
      });
      
      const subgroupKey = newValue === 'general' ? null : newValue;
      const isAlreadyLoaded = settingsStore.isSubgroupLoaded(groupId.value, subgroupKey);
      
      // Load settings for this subgroup
      await settingsStore.loadSubgroupSettings(
        groupId.value, 
        subgroupKey,
        groupInfo.value.module || 'core'
      );
      
      // Check if values came back empty and we need to retry
      const subgroupSettings = sidebarStore.filteredSettings(
        groupId.value, 
        subgroupKey
      );
      
      const hasEmptyValues = subgroupSettings.some(setting => {
        return settingsStore.values[setting.key] === undefined;
      });
      
      // If first load and empty values, try one more time
      if (hasEmptyValues && !isAlreadyLoaded) {
        console.log("Settings appear to be empty on first load, retrying...");
        setTimeout(async () => {
          // Reset loaded state to force a refresh
          settingsStore.loadedSubgroups[groupId.value][subgroupKey || 'general'] = false;
          
          // Try loading again
          await settingsStore.loadSubgroupSettings(
            groupId.value, 
            subgroupKey,
            groupInfo.value.module || 'core'
          );
        }, 500);
      }
    } catch (error) {
      console.error('Failed to load subgroup settings:', error);
    }
  }
});

// On mount, load initial subgroup settings
onMounted(async () => {
  if (!sidebarStore.settingsSchema) {
    await sidebarStore.loadSettingsSchema();
  }
  
  // Set initial active subgroup from URL or first available
  const querySubgroup = route.query.subgroup as string;
  
  if (querySubgroup && navItems.value.some(t => t.id === querySubgroup)) {
    activeSubgroup.value = querySubgroup;
  } else if (navItems.value.length > 0) {
    activeSubgroup.value = navItems.value[0].id;
  }
  
  // Initial subgroup loading happens via the watcher
});

// Watch for changes in the group ID
watch(groupId, () => {
  // When the group changes, reload settings
  if (groupInfo.value) {
    loadGroupSettings();
  }
});

// Watch for changes in available nav items
watch(navItems, (newItems) => {
  if (newItems.length > 0 && !activeSubgroup.value) {
    activeSubgroup.value = newItems[0].id;
  }
});

// Refresh settings data
const refreshSettings = async () => {
  try {
    // First refresh cache
    await settingsStore.refreshCache();
    
    // Reset loaded subgroups state to force reloading
    settingsStore.resetLoadedSubgroups();
    
    // Reload schema
    await sidebarStore.loadSettingsSchema(true);
    
    // Reload settings for the current subgroup if one is active
    if (groupInfo.value && activeSubgroup.value) {
      await settingsStore.loadSubgroupSettings(
        groupId.value, 
        activeSubgroup.value === 'general' ? null : activeSubgroup.value,
        groupInfo.value.module || 'core'
      );
    }
  } catch (error) {
    console.error('Failed to refresh settings:', error);
  }
};
</script>

<template>
  <!-- Header with breadcrumbs -->
  <header
    class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
    <div class="flex items-center gap-2 px-4">
      <SidebarTrigger class="-ml-1" />
      <Separator orientation="vertical" class="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{{ groupInfo?.label || groupId }}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  </header>

  <!-- Main content area -->
  <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
    <div class="rounded-[0.5rem] border bg-background shadow lg:m-4">
      <div class="space-y-6 p-6 lg:p-10 pb-16 md:block">
        <div class="flex justify-between items-center mb-4 space-y-0.5">
          <h2 class="text-2xl font-bold tracking-tight">
            {{ groupInfo?.label || 'Settings' }}
          </h2>
          <button
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            @click="refreshSettings">
            <RefreshCw class="h-4 w-4 mr-2" />
            Refresh
          </button>
          <!-- <p class="text-muted-foreground">
                Manage settings
            </p> -->
        </div>
        <Separator class="my-6" />

        <!-- Loading state -->
        <div v-if="sidebarStore.loading"
          class="bg-card rounded-lg shadow p-8 flex justify-center items-center min-h-[200px]">
          <div class="spinner h-8 w-8"></div>
        </div>

        <!-- Error state -->
        <div v-else-if="sidebarStore.error" class="bg-card rounded-lg shadow p-8 text-center min-h-[200px]">
          <p class="text-destructive mb-4">{{ sidebarStore.error }}</p>
          <button
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            @click="refreshSettings">
            <RefreshCw class="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>

        <!-- Group not found -->
        <div v-else-if="dataLoaded && !groupInfo" class="bg-card rounded-lg shadow p-8 text-center min-h-[200px]">
          <p class="text-muted-foreground mb-4">Settings group not found.</p>
          <a href="/settings"
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
            Go Back to Settings
          </a>
        </div>

        <!-- Group loading error -->
        <div v-if="groupLoadError && !sidebarStore.loading"
          class="bg-card rounded-lg shadow p-4 mb-4 text-destructive text-sm">
          <p>{{ groupLoadError }}</p>
          <button @click="loadGroupSettings" class="text-xs flex items-center text-primary hover:underline mt-2">
            <RefreshCw class="h-3 w-3 mr-1" /> Retry loading settings
          </button>
        </div>

        <div v-else-if="dataLoaded && navItems.length > 0"
          class="flex flex-col space-y-8 md:flex-row lg:space-x-12 lg:space-y-0">

          <aside class="-mx-4 md:w-64 lg:border-r md:shrink-0">
            <SettingsSideNav :items="navItems" v-model:activeItem="activeSubgroup" />
          </aside>
          <div class="flex-1 lg:max-w-2xl md:px-4 lg:px-0">
            <div class="space-y-6">
              <div v-for="item in navItems" :key="item.id" v-show="activeSubgroup === item.id">
                <!-- Add a helper button to manually reload if needed -->
                <div class="mb-4 flex justify-stretch">
                  <h2 class="text-lg flex-1 font-medium mb-4">{{ item.label }}</h2>
                  <button @click="() => {
                    const subgroupKey = item.id === 'general' && !item.group_id ? null : item.id;
                    settingsStore.loadedSubgroups[groupId][subgroupKey || 'general'] = false;
                    settingsStore.loadSubgroupSettings(
                      groupId,
                      subgroupKey,
                      groupInfo?.module || 'core'
                    );
                  }" class="text-xs flex text-align-center text-muted-foreground hover:text-foreground">
                    <RefreshCw class="h-3 w-3 mr-1" /> Reload values
                  </button>
                </div>


                <p v-if="item.description" class="text-muted-foreground text-sm mb-6">{{
                  item.description }}
                </p>

                <!-- Pass isLoaded prop to the form -->
                <SettingsForm :module="groupInfo?.module || 'core'" :group="groupId"
                  :subgroup="item.id === 'general' && !item.group_id ? null : item.id"
                  :is-loaded="settingsStore.isSubgroupLoaded(groupId, item.id === 'general' && !item.group_id ? null : item.id)" />
              </div>
            </div>
          </div>
        </div>

        <!-- No tabs available -->
        <div v-else-if="dataLoaded" class="bg-card rounded-lg shadow p-8 text-center min-h-[200px]">
          <p class="text-muted-foreground">No settings available for this group.</p>
        </div>
      </div>
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