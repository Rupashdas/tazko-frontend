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
    <div
        class="bg-white border border-gray-200 transition duration-300 p-10 bg-white shadow-md rounded-2xl shadow-tazko-blue/10 mx-auto mb-10" :class="[maxWidth, marginTop]">
        <slot />
    </div>
</template>
