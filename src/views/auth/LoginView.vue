<script setup>
import { ref } from 'vue'
import { addIcons } from "oh-vue-icons";
import { MdAlternateemailOutlined, RiLockPasswordLine, RiEyeLine, RiEyeOffLine } from "oh-vue-icons/icons";
import { useAuthStore } from '@/stores/useAuthStore'
import { useRouter } from 'vue-router'
import { useToast } from '@/utils/toast'

addIcons(MdAlternateemailOutlined, RiLockPasswordLine, RiEyeLine, RiEyeOffLine);

const auth = useAuthStore()
const router = useRouter()
const { successToast, errorToast } = useToast()

const email = ref('rupash.das.202@gmail.com')
const password = ref('123123')
const loading = ref(false)
const showPassword = ref(false)

const fillCredentials = (type) => {
    if (type === 'superadmin') {
        email.value = 'admin@example.com'
        password.value = 'password1234'
    } else {
        email.value = 'rupash.das.202@gmail.com'
        password.value = '123123'
    }
}

const handleLogin = async () => {
    if (!email.value || !password.value) {
        errorToast('Please fill in all fields')
        return
    }
    loading.value = true
    const response = await auth.login(email.value, password.value)
    if (response.success) {
        successToast(response.message)
        setTimeout(() => router.push({ name: 'home' }), 1000)
    } else {
        if (response.errors && Object.keys(response.errors).length > 0) {
            Object.values(response.errors).flat().forEach(msg => errorToast(msg))
        } else {
            errorToast(response.message || 'Something went wrong')
        }
    }
    loading.value = false
}
</script>

<template>
    <div class="animate-fade-in">

        <!-- Header -->
        <div class="mb-8">
            <h2 class="font-display text-heading" style="font-size: 2rem; letter-spacing: 0.01em; line-height: 1.1;">
                Sign in to Tazko
            </h2>
            <p class="mt-2 text-sm text-text/70 leading-relaxed">
                Don't have an account?
                <router-link :to="{ name: 'signup' }"
                    class="font-semibold text-accent hover:text-accent/80 transition-colors ml-1">
                    Create one free →
                </router-link>
            </p>
        </div>

        <!-- Quick Login Chips -->
        <div class="mb-7">
            <p class="text-[11px] font-semibold uppercase tracking-[0.13em] text-text/40 mb-2.5">Quick fill for demo</p>
            <div class="flex gap-2">
                <button @click="fillCredentials('superadmin')"
                    class="flex-1 text-xs font-semibold py-2 px-3 rounded-lg border-2 border-dashed border-accent/30 text-accent/70 hover:border-accent hover:text-accent hover:bg-accent/5 transition-all duration-200">
                    Super Admin
                </button>
                <button @click="fillCredentials('admin')"
                    class="flex-1 text-xs font-semibold py-2 px-3 rounded-lg border-2 border-dashed border-accent/30 text-accent/70 hover:border-accent hover:text-accent hover:bg-accent/5 transition-all duration-200">
                    Admin
                </button>
            </div>
        </div>

        <!-- Divider -->
        <div class="flex items-center gap-3 mb-7">
            <div class="flex-1 h-px bg-heading/10" />
            <span class="text-[11px] font-medium tracking-widest uppercase text-text/30">or continue with email</span>
            <div class="flex-1 h-px bg-heading/10" />
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="flex flex-col gap-5">

            <!-- Email -->
            <div class="flex flex-col gap-1.5">
                <label class="text-[13px] font-semibold text-heading/80 tracking-wide">
                    Email address <span class="text-red-400 ml-0.5">*</span>
                </label>
                <div class="group relative flex items-center">
                    <span
                        class="absolute left-3.5 text-text/40 group-focus-within:text-accent transition-colors duration-200 pointer-events-none z-10">
                        <v-icon name="md-alternateemail-outlined" scale="0.85" />
                    </span>
                    <input v-model="email" type="email" placeholder="you@company.com" required autocomplete="email"
                        class="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-heading/15 bg-panel text-heading text-sm placeholder:text-text/30 focus:outline-none focus:border-accent transition-all duration-200 shadow-sm focus:shadow-md" />
                </div>
            </div>

            <!-- Password -->
            <div class="flex flex-col gap-1.5">
                <div class="flex items-center justify-between">
                    <label class="text-[13px] font-semibold text-heading/80 tracking-wide">
                        Password <span class="text-red-400 ml-0.5">*</span>
                    </label>
                    <router-link :to="{ name: 'forgot-password' }"
                        class="text-[12px] font-medium text-accent hover:text-accent/70 transition-colors">
                        Forgot password?
                    </router-link>
                </div>
                <div class="group relative flex items-center">
                    <span
                        class="absolute left-3.5 text-text/40 group-focus-within:text-accent transition-colors duration-200 pointer-events-none z-10">
                        <v-icon name="ri-lock-password-line" scale="0.85" />
                    </span>
                    <input v-model="password" :type="showPassword ? 'text' : 'password'"
                        placeholder="Enter your password" required autocomplete="current-password"
                        class="w-full pl-10 pr-11 py-3 rounded-xl border-2 border-heading/15 bg-panel text-heading text-sm placeholder:text-text/30 focus:outline-none focus:border-accent transition-all duration-200 shadow-sm focus:shadow-md" />
                    <button type="button" @click="showPassword = !showPassword"
                        class="absolute right-3.5 text-text/40 hover:text-accent transition-colors duration-200 z-10">
                        <v-icon :name="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'" scale="0.85" />
                    </button>
                </div>
            </div>

            <!-- Submit -->
            <button type="submit" :disabled="loading"
                class="tazko-btn w-full py-3.5 rounded-xl text-sm font-bold tracking-wide mt-1 relative overflow-hidden group"
                :class="loading ? 'opacity-70 cursor-not-allowed' : ''">
                <span v-if="!loading" class="flex items-center justify-center gap-2">
                    Sign In
                    <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                            d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </span>
                <span v-else class="flex items-center justify-center gap-2">
                    <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                </span>
            </button>

        </form>

        <!-- Trust signals -->
        <div class="mt-8 flex items-center justify-center gap-5">
            <div class="flex items-center gap-1.5 text-text/30">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clip-rule="evenodd" />
                </svg>
                <span class="text-[11px] font-medium">SSL Secured</span>
            </div>
            <div class="w-px h-3 bg-heading/10" />
            <div class="flex items-center gap-1.5 text-text/30">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd" />
                </svg>
                <span class="text-[11px] font-medium">Privacy Protected</span>
            </div>
        </div>

    </div>
</template>

<style scoped>
@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateY(12px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in {
    animation: fade-in 0.45s ease both;
}
</style>