<template>
  <div class="min-h-screen bg-background flex">
    <!-- Sidebar -->
    <div class="w-64 bg-gray-900 text-white p-4">
      <div class="text-xl font-bold mb-6">Stufio Admin</div>
      
      <nav class="space-y-2">
        <NuxtLink to="/dashboard" class="block px-4 py-2 rounded hover:bg-gray-800">
          Dashboard
        </NuxtLink>
        <NuxtLink to="/dashboard/users" class="block px-4 py-2 rounded hover:bg-gray-800">
          Users
        </NuxtLink>
        <NuxtLink to="/dashboard/activity" class="block px-4 py-2 rounded hover:bg-gray-800">
          Activity
        </NuxtLink>
        <NuxtLink to="/dashboard/settings" class="block px-4 py-2 rounded hover:bg-gray-800">
          Settings
        </NuxtLink>
      </nav>
    </div>
    
    <!-- Content area -->
    <div class="flex-1 overflow-auto">
      <header class="bg-white border-b p-4">
        <!-- Header content -->
        <div class="flex justify-end">
          <button class="px-4 py-2 rounded bg-gray-100">Account</button>
        </div>
      </header>
      
      <!-- Page content -->
      <main>
        <slot />
      </main>
    </div>
  </div>
</template>