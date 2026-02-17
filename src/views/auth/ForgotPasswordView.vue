<script setup>
import { ref } from 'vue'
import { addIcons } from "oh-vue-icons";
import { MdAlternateemailOutlined } from "oh-vue-icons/icons";
addIcons(MdAlternateemailOutlined);
const loading = ref(false)

</script>
<template>
    <div class="bg-white shadow-lg rounded-lg p-8">
        <div class="mb-6 text-center">
            <h3 class="mb-2">Reset Your Password</h3>
            <p class="text-sm">Enter your email to receive a password reset link.</p>
        </div>

        <form @submit.prevent="" class="space-y-4">
            <div>
                <label class="block text-gray-700 mb-1 font-medium text-sm">Email <span class="text-red-500">*</span></label>
                <div class="flex">
                    <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                        <v-icon name="md-alternateemail-outlined" />
                    </span>
                    <input v-model="email" type="email" placeholder="Enter your email" class="input-field"/>
                </div>
            </div>

            <button type="submit" class="tazko-btn w-full" :disabled="loading">
                {{ loading ? 'Sending Code...' : 'Send Code' }}
            </button>
        </form>
    </div>
</template>