<script setup>
import {RouterLink, RouterView} from 'vue-router'
import Logo from "@/components/icons/Logo.vue";
</script>

<template>
    <div class="flex justify-center pt-10  min-h-screen">
        <div class="mx-auto max-w-md w-full">
            <router-link :to="{name : 'home'}" class="max-w-36 mx-auto block mb-8">
                <Logo />
            </router-link>
            <RouterView />
        </div>
    </div>
</template>
