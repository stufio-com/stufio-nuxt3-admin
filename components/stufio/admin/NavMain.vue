<script setup lang="ts">
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { ChevronRight, type LucideIcon } from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

defineProps<{
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}>()

// Get sidebar state
const { open } = useSidebar()
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel>Platform</SidebarGroupLabel>
    <SidebarMenu>
      <!-- When sidebar is expanded, use collapsible -->
      <template v-if="open">
        <Collapsible
          v-for="item in items"
          :key="item.title"
          as-child
          :default-open="item.isActive"
          class="group/collapsible"
        >
          <SidebarMenuItem>
            <!-- For items without sub-items, use NuxtLink directly -->
            <template v-if="!item.items || item.items.length === 0">
              <SidebarMenuButton as-child>
                <NuxtLink :to="item.url" class="flex items-center gap-2 w-full">
                  <component :is="item.icon" v-if="item.icon" />
                  <span>{{ item.title }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </template>
            
            <!-- For items with sub-items, use collapsible -->
            <template v-else>
              <CollapsibleTrigger as-child>
                <SidebarMenuButton :tooltip="item.title">
                  <component :is="item.icon" v-if="item.icon" />
                  <span>{{ item.title }}</span>
                  <ChevronRight class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem v-for="subItem in item.items" :key="subItem.title">
                    <SidebarMenuSubButton as-child>
                      <NuxtLink 
                        :to="subItem.url" 
                        class="w-full"
                        active-class="text-primary font-medium"
                        exact-active-class="bg-primary/10"
                      >
                        <span>{{ subItem.title }}</span>
                      </NuxtLink>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </template>
          </SidebarMenuItem>
        </Collapsible>
      </template>
      
      <!-- When sidebar is collapsed, use popover -->
      <template v-else>
        <SidebarMenuItem v-for="item in items" :key="item.title">
          <!-- For items without sub-items, use NuxtLink directly -->
          <template v-if="!item.items || item.items.length === 0">
            <SidebarMenuButton as-child>
              <NuxtLink :to="item.url" :tooltip="item.title">
                <component :is="item.icon" v-if="item.icon" />
                <span class="sr-only">{{ item.title }}</span>
              </NuxtLink>
            </SidebarMenuButton>
          </template>
          
          <!-- For items with sub-items, use popover -->
          <template v-else>
            <Popover>
              <PopoverTrigger as-child>
                <SidebarMenuButton :tooltip="item.title">
                  <component :is="item.icon" v-if="item.icon" />
                  <span class="sr-only">{{ item.title }}</span>
                </SidebarMenuButton>
              </PopoverTrigger>
              <PopoverContent side="right" align="start" class="p-0 w-48">
                <div class="p-2 font-medium border-b">{{ item.title }}</div>
                <div class="py-1">
                  <NuxtLink
                    v-for="subItem in item.items" 
                    :key="subItem.title" 
                    :to="subItem.url"
                    class="flex items-center px-3 py-1.5 text-sm hover:bg-accent transition-colors"
                  >
                    {{ subItem.title }}
                  </NuxtLink>
                </div>
              </PopoverContent>
            </Popover>
          </template>
        </SidebarMenuItem>
      </template>
    </SidebarMenu>
  </SidebarGroup>
</template>
