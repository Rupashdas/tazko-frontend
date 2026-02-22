<script setup>
import { ref } from 'vue'
import { addIcons } from "oh-vue-icons";
import { MdAlternateemailOutlined, RiLockPasswordLine } from "oh-vue-icons/icons";
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue';

addIcons(MdAlternateemailOutlined, RiLockPasswordLine);

const auth = useAuthStore()
const router = useRouter()
import { useToast } from '@/utils/toast'
const { successToast, errorToast } = useToast()

const email = ref('rupash.das.202@gmail.com')
const password = ref('123123')
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
        if (response.errors && Object.keys(response.errors).length > 0) {
            const messages = Object.values(response.errors).flat()
            messages.forEach(msg => errorToast(msg))
        } else {
            errorToast(response.message || 'Something went wrong')
        }
    }

    loading.value = false

}
</script>

<template>
    <base-card maxWidth="max-w-md" marginTop="mt-0">
        <div class="mb-6 text-center">
            <h3 class="mb-2">Let’s Get Things Done</h3>
            <p class="text-sm">Log in to sync with your team and turn your big ideas into actionable milestones.</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
            <div>
                <label class="block text-text mb-3 font-bold text-sm">Email <span class="text-red-500">*</span></label>
                <div class="flex">
                    <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-heading bg-accent text-heading">
                        <v-icon name="md-alternateemail-outlined" />
                    </span>
                    <input v-model="email" type="email" placeholder="Enter your email" class="input-field radius-left-0"/>
                </div>
            </div>

            <div>
                <div class="flex justify-between items-center mb-1 ">
                    <label class="block text-text mb-3 font-bold text-sm">
                        Password <span class="text-red-500">*</span>
                    </label>

                    <router-link :to="{ name: 'forgot-password' }" class="text-sm text-blue-500 hover:underline">
                        Forgot password?
                    </router-link>
                </div>
                <div class="flex">
                    <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-heading bg-accent text-heading">
                        <v-icon name="ri-lock-password-line" />
                    </span>
                    <input v-model="password" type="password" placeholder="Enter your password" class="input-field radius-left-0"/>
                </div>

            </div>

            <button type="submit" class="tazko-btn w-full" :disabled="loading">
                {{ loading ? 'Logging in...' : 'Login' }}
            </button>
        </form>

        <p class="mt-4 text-center text-text text-sm">
            Don't have an account?
            <router-link :to="{name : 'signup'}" class="text-blue-500 hover:underline">Sign Up</router-link>
        </p>
    </base-card>
</template>
