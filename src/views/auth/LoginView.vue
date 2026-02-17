<script setup>
import { ref } from 'vue'
import { addIcons } from "oh-vue-icons";
import { MdAlternateemailOutlined, RiLockPasswordLine } from "oh-vue-icons/icons";
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

addIcons(MdAlternateemailOutlined, RiLockPasswordLine);

const auth = useAuthStore()
const router = useRouter()
import { useToast } from '@/utils/toast'
const { successToast, errorToast } = useToast()

const email = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {

    if (!email.value || !password.value) {
        errorToast('Please fill in all fields')
        return
    }

    loading.value = true

    const response = await auth.login(email.value, password.value)

    if (response.success) {
        successToast(response.message)
        setTimeout(() => {
            router.push({ name: 'home' })
        }, 1000)
    } else {
        errorToast(response.message)
    }

    loading.value = false

}
</script>

<template>
    <div class="bg-white shadow-lg rounded-lg p-8">
        <div class="mb-6 text-center">
            <h3 class="mb-2">Let’s Get Things Done</h3>
            <p class="text-sm">Log in to sync with your team and turn your big ideas into actionable milestones.</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
            <div>
                <label class="block text-gray-700 mb-1 font-medium text-sm">Email <span class="text-red-500">*</span></label>
                <div class="flex">
                    <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                        <v-icon name="md-alternateemail-outlined" />
                    </span>
                    <input v-model="email" type="email" placeholder="Enter your email" class="input-field"/>
                </div>
            </div>

            <div>
                <div class="flex justify-between items-center mb-1 ">
                    <label class="block text-gray-700 font-medium text-sm">
                        Password <span class="text-red-500">*</span>
                    </label>

                    <router-link :to="{ name: 'forgot-password' }" class="text-sm text-blue-500 hover:underline">
                        Forgot password?
                    </router-link>
                </div>
                <div class="flex">
                    <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                        <v-icon name="ri-lock-password-line" />
                    </span>
                    <input v-model="password" type="password" placeholder="Enter your password" class="input-field"/>
                </div>

            </div>

            <button type="submit" class="tazko-btn w-full" :disabled="loading">
                {{ loading ? 'Logging in...' : 'Login' }}
            </button>
        </form>

        <p class="mt-4 text-center text-gray-600 text-sm">
            Don't have an account?
            <router-link :to="{name : 'signup'}" class="text-blue-500 hover:underline">Sign Up</router-link>
        </p>
    </div>
</template>
