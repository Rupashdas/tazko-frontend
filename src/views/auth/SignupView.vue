<script setup>
import { ref, computed } from 'vue'
import { addIcons } from "oh-vue-icons";
import { MdAlternateemailOutlined, RiLockPasswordLine, CoUserPlus, RiEyeLine, RiEyeOffLine } from "oh-vue-icons/icons";
import { useAuthStore } from '@/stores/useAuthStore'
import { useRouter } from 'vue-router'
import { useToast } from '@/utils/toast'

addIcons(MdAlternateemailOutlined, RiLockPasswordLine, CoUserPlus, RiEyeLine, RiEyeOffLine);

const router = useRouter()
const { successToast, errorToast } = useToast()
const auth = useAuthStore()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const showPassword = ref(false)
const showConfirm = ref(false)

// Password strength
const passwordStrength = computed(() => {
    const val = password.value
    if (!val) return { score: 0, label: '', color: '' }
    let score = 0
    if (val.length >= 8) score++
    if (/[A-Z]/.test(val)) score++
    if (/[0-9]/.test(val)) score++
    if (/[^A-Za-z0-9]/.test(val)) score++
    const levels = [
        { label: 'Too short', color: 'bg-red-400' },
        { label: 'Weak', color: 'bg-orange-400' },
        { label: 'Fair', color: 'bg-yellow-400' },
        { label: 'Good', color: 'bg-blue-400' },
        { label: 'Strong', color: 'bg-emerald-400' },
    ]
    return { score, ...levels[score] }
})

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
            <h2 class="auth-title">Create your account</h2>
            <p class="mt-2 text-sm text-text/60 leading-relaxed">
                Already have an account?
                <router-link :to="{ name: 'login' }"
                    class="font-semibold text-accent hover:text-accent/80 transition-colors ml-1">
                    Sign in →
                </router-link>
            </p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSignup" class="flex flex-col gap-4">

            <!-- Name row -->
            <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-1.5">
                    <label class="text-[13px] font-semibold text-heading/80 tracking-wide">
                        First Name <span class="text-red-400">*</span>
                    </label>
                    <div class="group relative flex items-center">
                        <span
                            class="absolute left-3.5 text-text/40 group-focus-within:text-accent transition-colors pointer-events-none z-10">
                            <v-icon name="co-user-plus" scale="0.82" />
                        </span>
                        <input v-model="firstName" type="text" placeholder="Jane" required autocomplete="given-name"
                            class="w-full pl-10 pr-3 py-3 rounded-xl border-2 border-heading/15 bg-panel text-heading text-sm placeholder:text-text/30 focus:outline-none focus:border-accent transition-all duration-200 shadow-sm" />
                    </div>
                </div>
                <div class="flex flex-col gap-1.5">
                    <label class="text-[13px] font-semibold text-heading/80 tracking-wide">
                        Last Name <span class="text-red-400">*</span>
                    </label>
                    <div class="group relative flex items-center">
                        <span
                            class="absolute left-3.5 text-text/40 group-focus-within:text-accent transition-colors pointer-events-none z-10">
                            <v-icon name="co-user-plus" scale="0.82" />
                        </span>
                        <input v-model="lastName" type="text" placeholder="Doe" required autocomplete="family-name"
                            class="w-full pl-10 pr-3 py-3 rounded-xl border-2 border-heading/15 bg-panel text-heading text-sm placeholder:text-text/30 focus:outline-none focus:border-accent transition-all duration-200 shadow-sm" />
                    </div>
                </div>
            </div>

            <!-- Email -->
            <div class="flex flex-col gap-1.5">
                <label class="text-[13px] font-semibold text-heading/80 tracking-wide">
                    Email address <span class="text-red-400">*</span>
                </label>
                <div class="group relative flex items-center">
                    <span
                        class="absolute left-3.5 text-text/40 group-focus-within:text-accent transition-colors pointer-events-none z-10">
                        <v-icon name="md-alternateemail-outlined" scale="0.85" />
                    </span>
                    <input v-model="email" type="email" placeholder="you@company.com" required autocomplete="email"
                        class="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-heading/15 bg-panel text-heading text-sm placeholder:text-text/30 focus:outline-none focus:border-accent transition-all duration-200 shadow-sm" />
                </div>
            </div>

            <!-- Password -->
            <div class="flex flex-col gap-1.5">
                <label class="text-[13px] font-semibold text-heading/80 tracking-wide">
                    Password <span class="text-red-400">*</span>
                </label>
                <div class="group relative flex items-center">
                    <span
                        class="absolute left-3.5 text-text/40 group-focus-within:text-accent transition-colors pointer-events-none z-10">
                        <v-icon name="ri-lock-password-line" scale="0.85" />
                    </span>
                    <input v-model="password" :type="showPassword ? 'text' : 'password'"
                        placeholder="Create a strong password" required autocomplete="new-password"
                        class="w-full pl-10 pr-11 py-3 rounded-xl border-2 border-heading/15 bg-panel text-heading text-sm placeholder:text-text/30 focus:outline-none focus:border-accent transition-all duration-200 shadow-sm" />
                    <button type="button" @click="showPassword = !showPassword"
                        class="absolute right-3.5 text-text/40 hover:text-accent transition-colors z-10">
                        <v-icon :name="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'" scale="0.85" />
                    </button>
                </div>

                <!-- Strength meter -->
                <div v-if="password" class="flex items-center gap-2 mt-0.5">
                    <div class="flex gap-1 flex-1">
                        <div v-for="i in 4" :key="i" class="flex-1 h-1 rounded-full transition-all duration-300"
                            :class="i <= passwordStrength.score ? passwordStrength.color : 'bg-heading/10'" />
                    </div>
                    <span class="text-[11px] font-semibold text-text/80">{{ passwordStrength.label }}</span>
                </div>
            </div>

            <!-- Confirm Password -->
            <div class="flex flex-col gap-1.5">
                <label class="text-[13px] font-semibold text-heading/80 tracking-wide">
                    Confirm Password <span class="text-red-400">*</span>
                </label>
                <div class="group relative flex items-center">
                    <span
                        class="absolute left-3.5 text-text/40 group-focus-within:text-accent transition-colors pointer-events-none z-10">
                        <v-icon name="ri-lock-password-line" scale="0.85" />
                    </span>
                    <input v-model="confirmPassword" :type="showConfirm ? 'text' : 'password'"
                        placeholder="Repeat your password" required autocomplete="new-password"
                        class="w-full pl-10 pr-11 py-3 rounded-xl border-2 transition-all duration-200 bg-panel text-heading text-sm placeholder:text-text/30 focus:outline-none shadow-sm"
                        :class="confirmPassword && password !== confirmPassword
                            ? 'border-red-400 focus:border-red-400'
                            : confirmPassword && password === confirmPassword
                                ? 'border-emerald-400 focus:border-emerald-400'
                                : 'border-heading/15 focus:border-accent'" />
                    <button type="button" @click="showConfirm = !showConfirm"
                        class="absolute right-3.5 text-text/40 hover:text-accent transition-colors z-10">
                        <v-icon :name="showConfirm ? 'ri-eye-off-line' : 'ri-eye-line'" scale="0.85" />
                    </button>
                </div>
                <p v-if="confirmPassword && password !== confirmPassword"
                    class="text-[12px] text-red-400 font-medium flex items-center gap-1">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clip-rule="evenodd" />
                    </svg>
                    Passwords don't match
                </p>
            </div>

            <!-- Terms note -->
            <p class="text-[11px] text-text/40 leading-relaxed">
                By creating an account you agree to our
                <a href="#" class="text-accent/70 hover:text-accent underline underline-offset-2">Terms of Service</a>
                and
                <a href="#" class="text-accent/70 hover:text-accent underline underline-offset-2">Privacy Policy</a>.
            </p>

            <!-- Submit -->
            <button type="submit" :disabled="loading"
                class="tazko-btn w-full py-3.5 rounded-xl text-sm font-bold tracking-wide group"
                :class="loading ? 'opacity-70 cursor-not-allowed' : ''">
                <span v-if="!loading" class="flex items-center justify-center gap-2">
                    Create Account
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
                    Creating account...
                </span>
            </button>

        </form>

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