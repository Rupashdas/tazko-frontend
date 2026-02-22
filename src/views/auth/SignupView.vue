<script setup>
import {ref} from 'vue'
import { addIcons } from "oh-vue-icons";
import { MdAlternateemailOutlined, RiLockPasswordLine, CoUserPlus } from "oh-vue-icons/icons";
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useToast } from '@/utils/toast'
import BaseCard from '@/components/ui/BaseCard.vue';

const router = useRouter()
const { successToast, errorToast } = useToast()
addIcons(MdAlternateemailOutlined, RiLockPasswordLine, CoUserPlus);

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)

const auth = useAuthStore()
const handleSignup = async () => {

    if (!firstName.value || !lastName.value || !email.value || !password.value || !confirmPassword.value) {
        errorToast('All fields are required.')
        return
    }
    if (password.value !== confirmPassword.value) {
        errorToast('Passwords do not match.')
        return
    }

    loading.value = true
    const name = `${firstName.value} ${lastName.value}`
    const response = await auth.signup(name, email.value, password.value)

    if (response.success) {
        successToast(response.message)
        setTimeout(() => {
            router.push({name : 'home'})
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
            <h3 class="mb-2">Create Your Account</h3>
            <p class="text-sm">Join Tazko to collaborate with your team, track your projects, and turn your ideas
                into actionable milestones</p>
        </div>

        <form @submit.prevent="handleSignup" class="space-y-5">

            <div>
                <label class="block text-text mb-3 font-bold text-sm">First Name <span class="text-red-500">*</span></label>
                <div class="flex">
                    <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-heading bg-accent text-heading">
                        <v-icon name="co-user-plus" />
                    </span>
                    <input v-model="firstName" type="text" placeholder="Enter your first name" class="input-field radius-left-0"/>
                </div>
            </div>

            <div>
                <label class="block text-text mb-3 font-bold text-sm">Last Name <span class="text-red-500">*</span></label>
                <div class="flex">
                    <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-heading bg-accent text-heading">
                        <v-icon name="co-user-plus" />
                    </span>
                    <input v-model="lastName" type="text" placeholder="Enter your last name" class="input-field radius-left-0"/>
                </div>
            </div>

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
                <label class="block text-text mb-3 font-bold text-sm">Password <span class="text-red-500">*</span></label>
                <div class="flex">
                    <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-heading bg-accent text-heading">
                        <v-icon name="ri-lock-password-line" />
                    </span>
                    <input v-model="password" type="password" placeholder="Enter your password" class="input-field radius-left-0"/>
                </div>
            </div>
            <div>
                <label class="block text-text mb-3 font-bold text-sm">Confirm Password <span class="text-red-500">*</span></label>
                <div class="flex">
                    <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-heading bg-accent text-heading">
                        <v-icon name="ri-lock-password-line" />
                    </span>
                    <input type="password" v-model="confirmPassword" placeholder="Enter your password again"
                        class="input-field radius-left-0"/>
                </div>
            </div>

            <button type="submit" class="tazko-btn w-full" :disabled="loading">
                {{ loading ? 'Signing up...' : 'Sign Up' }}
            </button>

        </form>

        <p class="mt-4 text-center text-gray-600 text-sm">
            Already have an account?
            <router-link :to="{name : 'login' }" class="text-blue-500 hover:underline">Login</router-link>
        </p>
    </base-card>
</template>
