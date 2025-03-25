<script setup lang="ts">
import { Label } from '@/components/ui/label'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from '@/components/ui/sidebar'
import { useSidebar } from "@/components/ui/sidebar";
const { open } = useSidebar()
import { Search } from 'lucide-vue-next'
import { Dialog, DialogContent } from '@/components/ui/dialog'

// Control search dialog visibility
const showSearchDialog = ref(false)

// Function to handle search icon click when collapsed
const handleSearchIconClick = () => {
  showSearchDialog.value = true
}
</script>

<template>
  <form>
    <!-- When sidebar is expanded, show full search input -->
    <template v-if="open">
      <SidebarGroup class="py-0">
        <SidebarGroupContent class="relative">
            <Label for="search" class="sr-only">
              Search
            </Label>
            <SidebarInput
              id="search"
              placeholder="Search the admin..."
              class="pl-8"
            />
            <Search class="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
          
        </SidebarGroupContent>
      </SidebarGroup>
    </template>
        
    <!-- When sidebar is collapsed, show just the icon in a button -->
    <template v-else>
      <button 
        type="button"
        class="w-8 h-8 rounded-md flex items-center justify-center hover:bg-sidebar-accent transition-colors"
        aria-label="Search"
        @click="handleSearchIconClick"
      >
        <Search class="size-4 text-sidebar-foreground" />
      </button>
    </template>
  </form>
  
  <!-- Floating search dialog -->
  <Dialog :open="showSearchDialog" @update:open="showSearchDialog = $event">
    <DialogContent class="sm:max-w-md">
      <div class="grid gap-4">
        <div class="space-y-2">
          <h2 class="font-semibold text-lg tracking-tight">Search Admin</h2>
          <p class="text-sm text-muted-foreground">
            Enter a search term to find content across the admin panel.
          </p>
        </div>
        <div class="relative">
          <input
            type="search"
            placeholder="Search the admin..."
            class="w-full h-10 px-3 py-2 bg-background text-foreground rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-ring"
            autofocus
          />
          <Search class="absolute right-3 top-1/2 size-4 -translate-y-1/2 opacity-50" />
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>