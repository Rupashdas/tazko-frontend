<script setup>
defineProps({
    maxWidth: {
        type: String,
        default: 'max-w-3xl'
    },
    marginTop: {
        type: String,
        default: 'mt-8'
    },
})
</script>

<template>
    <div class="bg-panel transition duration-300 border border-accent/10 p-10 shadow-xl rounded-2xl mx-auto mb-10" :class="[maxWidth, marginTop]">
        <slot />
    </div>
</template>
