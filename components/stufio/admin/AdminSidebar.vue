<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar'
import NavMain from './NavMain.vue'
import NavFavorites from './NavFavorites.vue'
import NavUser from './NavUser.vue'
import TeamSwitcher from './ProjectSwitcher.vue'
import AdminSearch from './AdminSearch.vue'
import { useSidebarStore } from '@/stores/sidebar'
import { RefreshCw } from 'lucide-vue-next'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from '@/components/ui/sidebar'

const props = withDefaults(defineProps<SidebarProps>(), {
    collapsible: 'icon',
})

// Initialize and get data from sidebar store
const sidebarStore = useSidebarStore()

// Add retry functionality for UI
const retrying = ref(false);

// On mount, initialize the store
onMounted(() => {
  if (!sidebarStore.initialized) {
    sidebarStore.init();
  }
})

// Sample user data (replace with actual user data from auth store)
const user = {
  name: 'Administrator',
  email: 'admin@example.com',
  avatar: '/avatars/admin.jpg',
}

// Refresh sidebar data with visual feedback
const refreshSidebar = async () => {
  retrying.value = true;
  await sidebarStore.refreshSettings();
  setTimeout(() => {
    retrying.value = false;
  }, 500);
}
</script>

<template>
    <Sidebar v-bind="props">
        <SidebarHeader>
            <!-- Use v-if to ensure projects are loaded before passing to component -->
            <TeamSwitcher 
              v-if="sidebarStore.projects && sidebarStore.projects.length" 
              :teams="sidebarStore.projects" 
            />
            <TeamSwitcher v-else />
            <AdminSearch />
        </SidebarHeader>
        <SidebarContent>
            <NavMain :items="sidebarStore.navItems" />
            <NavFavorites :favorites="sidebarStore.favorites" />
            
            <!-- Loading indicator -->
            <div v-if="sidebarStore.loading" class="px-3 py-2 flex items-center text-sm text-muted-foreground">
              <div class="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent mr-2"></div>
              Loading...
            </div>
            
            <!-- Error indicator with retry -->
            <div v-if="sidebarStore.error" class="px-3 py-2">
              <p class="text-sm text-destructive mb-1">{{ sidebarStore.error }}</p>
              <button 
                @click="refreshSidebar" 
                class="text-xs flex items-center text-primary hover:underline"
                :class="{ 'opacity-50': retrying }"
                :disabled="retrying"
              >
                <RefreshCw class="h-3 w-3 mr-1" :class="{ 'animate-spin': retrying }" /> 
                {{ retrying ? 'Retrying...' : 'Retry' }}
              </button>
            </div>
        </SidebarContent>
        <SidebarFooter>
            <NavUser :user="user" />
        </SidebarFooter>
        <SidebarRail />
    </Sidebar>
</template>