<script setup>
import {RouterLink, RouterView} from 'vue-router'
import Logo from "@/components/icons/Logo.vue";
</script>

<template>
    <div class="flex justify-center pt-10 bg-gray-100 min-h-screen">
        <div class="mx-auto max-w-md w-full">
            <router-link :to="{name : 'home'}" class="max-w-36 mx-auto block mb-8">
                <Logo />
            </router-link>
            <RouterView />
        </div>
    </div>
</template>

<style scoped>
body {
    background: linear-gradient(135deg, #6B73FF 0%, #000DFF 100%);
}
</style>
