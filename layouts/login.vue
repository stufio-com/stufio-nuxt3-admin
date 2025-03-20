<template>
    <!-- Background pattern -->
    <div class="fixed left-0 top-0 -z-10 h-full w-full">
        <div class="relative h-full w-full bg-slate-50 dark:bg-gray-900">
            <div
                class="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]">
            </div>
        </div>
    </div>

    <!-- Settings panel with language and theme -->
    <div class="fixed top-4 right-4 z-10">
        <div class="stufio-control-panel">
            <div class="stufio-control-group">
                <!-- Theme Switcher -->
                <StufioUiThemeSwitcher />

                <!-- Divider -->
                <div class="stufio-control-divider"></div>

                <!-- Language Switcher -->
                <StufioI18nLocaleSwitcher :show-flag="false" locale-format="code" width="60px" />
            </div>
        </div>
    </div>

    <!-- Main content area -->
    <div class="min-h-screen flex items-center justify-center">
        <div class="w-full max-w-md">
            <slot />
        </div>
    </div>
</template>
