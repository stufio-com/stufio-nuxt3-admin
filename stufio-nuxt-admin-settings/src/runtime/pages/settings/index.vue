<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useSettingsSidebarStore } from '../../stores/settingsSidebar';
import Skeleton from '../../components/ui/skeleton/Skeleton.vue';

const router = useRouter();
const sidebarStore = useSettingsSidebarStore();

// Groups from the settings schema
const settingsGroups = computed(() => {
  if (!sidebarStore.settingsSchema) return [];
  
  return Object.values(sidebarStore.settingsSchema.groups)
    .sort((a, b) => a.order - b.order);
});

// Loading state
const isLoading = computed(() => sidebarStore.loading);

// Navigate to a group
const navigateToGroup = (groupId) => {
  router.push(`/settings/${groupId}`);
};

onMounted(async () => {
  // Ensure settings schema is loaded
  if (!sidebarStore.settingsSchema) {
    await sidebarStore.loadSettingsSchema();
  }
  
  // Auto-redirect to first group if available
  if (settingsGroups.value.length > 0 && !isLoading.value) {
    router.push(`/settings/${settingsGroups.value[0].id}`);
  }
});
</script>

<template>
    <div>
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

        <!-- Main content area -->
        <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div class="rounded-[0.5rem] border bg-background shadow lg:m-4">
                <div class="space-y-6 p-6 lg:p-10 pb-16 md:block">
                    <div class="flex justify-between items-center mb-4 space-y-0.5">
                        <h2 class="text-2xl font-bold tracking-tight">
                            {{ 'Settings' }}
                        </h2>
                    </div>
                    <Separator class="my-6" />

                    <!-- Loading state -->
                    <div v-if="isLoading || !sidebarStore.settingsSchema"
                        class="flex flex-col space-y-8 md:flex-row lg:space-x-12 lg:space-y-0">
                        <!-- SideNav skeleton -->
                        <aside class="-mx-4 md:w-64 lg:border-r md:shrink-0">
                            <div class="p-4">
                                <nav class="space-y-2">
                                    <div v-for="i in 3" :key="i" class="flex items-center gap-3 rounded-md px-3 py-2">
                                        <Skeleton class="h-4 w-4 rounded-full" />
                                        <Skeleton class="h-4 w-24" />
                                    </div>
                                </nav>
                            </div>
                        </aside>

                        <!-- Form skeleton -->
                        <div class="flex-1 lg:max-w-2xl md:px-4 lg:px-0">
                            <div class="space-y-8">
                                <div>
                                    <Skeleton class="h-8 w-48 mb-6" />
                                    <Skeleton class="h-4 w-full max-w-md mb-8" />

                                    <div class="space-y-6">
                                        <div v-for="i in 2" :key="i" class="space-y-2">
                                            <Skeleton class="h-4 w-24" />
                                            <Skeleton class="h-10 w-full" />
                                            <Skeleton class="h-3 w-3/4" />
                                        </div>

                                        <div class="flex justify-end space-x-3 mt-8">
                                            <Skeleton class="h-9 w-20" />
                                            <Skeleton class="h-9 w-32" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>