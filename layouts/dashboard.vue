<script lang="ts">
export const description = 'A sidebar that collapses to icons.'
export const iframeHeight = '800px'
export const containerClass = 'w-full h-full'
import { SidebarInset, SidebarProvider, StufioAdminSidebar } from '#components'
</script>
<template>
  <SidebarProvider>
    <StufioAdminSidebar />
    <SidebarInset>
      <main>
        <slot />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>