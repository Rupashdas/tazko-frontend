<script setup>
import { ref, computed } from 'vue'
import { addIcons } from "oh-vue-icons";
import { MdAlternateemailOutlined, RiLockPasswordLine, RiEyeLine, RiEyeOffLine } from "oh-vue-icons/icons";
import { useAuthStore } from '@/stores/useAuthStore'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from '@/utils/toast'

addIcons(MdAlternateemailOutlined, RiLockPasswordLine, RiEyeLine, RiEyeOffLine);

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const { successToast, errorToast } = useToast()

const email = ref('')
const password = ref('')
const loading = ref(false)
const showPassword = ref(false)

// Show a contextual banner when redirected after deactivation
const isDeactivated = computed(() => route.query.reason === 'deactivated')

const fillCredentials = (type) => {
    if (type === 'superadmin') {
        email.value = 'admin@example.com'
        password.value = 'Pass123#'
    } else {
        email.value = 'rupash.das.202@gmail.com'
        password.value = 'Pass123#'
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
            <h2 class="auth-title">Sign in to Tazko</h2>
            <p class="mt-2 text-sm text-text/60 leading-relaxed">
                Don't have an account?
                <router-link :to="{ name: 'signup' }"
                    class="font-semibold text-accent hover:text-accent/80 transition-colors ml-1">
                    Create one free →
                </router-link>
            </p>
        </div>

        <!-- ── Deactivated account banner ───────────────────────── -->
        <Transition name="slide-down">
            <div v-if="isDeactivated"
                class="mb-6 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-red-50 border border-red-200">
                <div class="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                    </svg>
                </div>
                <div>
                    <p class="text-sm font-bold text-red-700 leading-tight">Account deactivated</p>
                    <p class="text-xs text-red-500 mt-0.5 leading-relaxed">
                        Your account has been deactivated. Please contact your administrator to regain access.
                    </p>
                </div>
            </div>
        </Transition>

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
                :class="loading ? 'opacity-75 cursor-not-allowed' : ''">
                <span class="relative z-10 flex items-center justify-center gap-2">
                    <svg v-if="loading" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {{ loading ? 'Signing in…' : 'Sign in' }}
                </span>
            </button>

        </form>

    </div>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.25s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}
</style>