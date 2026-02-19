<script setup>
import { RouterView } from 'vue-router'
import HeaderCompontent from '@/components/HeaderCompontent.vue'
</script>

<template>
    <HeaderCompontent />
    <main class="container">
        <RouterView />
    </main>
</template>