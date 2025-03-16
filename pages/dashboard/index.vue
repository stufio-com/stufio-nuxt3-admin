<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})
</script>

<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6">Dashboard</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-4 bg-white shadow rounded-lg">
        <h2 class="text-lg font-medium mb-2">Users</h2>
        <p class="text-2xl font-bold">0</p>
      </div>
      
      <div class="p-4 bg-white shadow rounded-lg">
        <h2 class="text-lg font-medium mb-2">Activities</h2>
        <p class="text-2xl font-bold">0</p>
      </div>
      
      <div class="p-4 bg-white shadow rounded-lg">
        <h2 class="text-lg font-medium mb-2">Modules</h2>
        <p class="text-2xl font-bold">0</p>
      </div>
    </div>
  </div>
</template>
