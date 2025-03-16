<script lang="ts">
export const description = 'Stufio.com login form.'
</script>

<script setup lang="ts">
import LoginForm from '@/components/LoginForm.vue'
definePageMeta({
    layout: 'login'
})
</script>

<template>
    <div class="font-lexend flex h-screen w-full items-center justify-center px-4">
        <div class="flex flex-col items-center">
            <!-- Logo placed above card -->
            <div class="mb-0 text-center">
                <img src="~/assets/img/stufiotop.png" alt="Stufio Logo" class="w-64 mx-auto" />
            </div>
            <LoginForm />
            <p class="mt-2 font-lexend text-center text-sm text-gray-500 font-light">
                © 2025 Stufio.com. All rights reserved.
            </p>
        </div>
    </div>
</template>