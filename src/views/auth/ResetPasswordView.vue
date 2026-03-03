<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { addIcons } from 'oh-vue-icons'
import { RiLockPasswordLine, RiEyeLine, RiEyeOffLine } from 'oh-vue-icons/icons'
import axios from '@/axios'
import { useToast } from '@/utils/toast'

addIcons(RiLockPasswordLine, RiEyeLine, RiEyeOffLine)

const { successToast, errorToast } = useToast()
const route = useRoute()
const router = useRouter()

const token = ref(route.query.token || '')
const email = ref(route.query.email || '')
const password = ref('')
const password_confirmation = ref('')
const loading = ref(false)
const showPassword = ref(false)
const showConfirm = ref(false)
const success = ref(false)

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

const submit = async () => {
    loading.value = true
    try {
        const { data } = await axios.post('/api/password/reset', {
            token: token.value,
            email: email.value,
            password: password.value,
            password_confirmation: password_confirmation.value,
        })
        if (data.status === 'success') {
            successToast(data.message || 'Password reset successfully!')
            success.value = true
            setTimeout(() => router.push({ name: 'login' }), 2500)
        }
    } catch (err) {
        if (err.response?.data) {
            const response = err.response.data
            if (response.errors && Object.keys(response.errors).length > 0) {
                Object.values(response.errors).flat().forEach(msg => errorToast(msg))
            } else {
                errorToast(response.message || 'Something went wrong')
            }
        } else {
            errorToast('Network error')
        }
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="animate-fade-in">

        <!-- Success state -->
        <div v-if="success" class="text-center">
            <div
                class="w-16 h-16 rounded-2xl bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h2 class="font-display text-heading mb-3" style="font-size: 1.8rem; line-height: 1.15;">
                Password updated!
            </h2>
            <p class="text-sm text-text/60 mb-6 leading-relaxed">
                Your password has been changed successfully.<br>Redirecting you to sign in…
            </p>
            <div class="flex justify-center">
                <div class="flex gap-1">
                    <div v-for="i in 3" :key="i" class="w-2 h-2 rounded-full bg-accent/40 animate-bounce"
                        :style="`animation-delay: ${(i - 1) * 0.15}s`" />
                </div>
            </div>
        </div>

        <!-- Default state -->
        <div v-else>
            <!-- Header -->
            <div class="mb-8">
                <!-- Icon -->
                <div class="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                    <svg class="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>

                <h2 class="font-display text-heading"
                    style="font-size: 2rem; letter-spacing: 0.01em; line-height: 1.1;">
                    Set new password
                </h2>
                <p class="mt-2 text-sm text-text/60 leading-relaxed">
                    Choose a strong, unique password to protect your account.
                </p>
            </div>

            <!-- Email badge (if present) -->
            <div v-if="email"
                class="flex items-center gap-2.5 px-3.5 py-2.5 bg-heading/5 rounded-xl mb-6 border border-heading/10">
                <svg class="w-4 h-4 text-text/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <span class="text-[13px] font-medium text-heading/70 truncate">{{ email }}</span>
            </div>

            <!-- Form -->
            <form @submit.prevent="submit" class="flex flex-col gap-5">

                <!-- New Password -->
                <div class="flex flex-col gap-1.5">
                    <label class="text-[13px] font-semibold text-heading/80 tracking-wide">
                        New Password <span class="text-red-400">*</span>
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

                    <!-- Strength bar -->
                    <div v-if="password" class="flex items-center gap-2 mt-0.5">
                        <div class="flex gap-1 flex-1">
                            <div v-for="i in 4" :key="i" class="flex-1 h-1.5 rounded-full transition-all duration-300"
                                :class="i <= passwordStrength.score ? passwordStrength.color : 'bg-heading/10'" />
                        </div>
                        <span class="text-[11px] font-semibold text-text/50">{{ passwordStrength.label }}</span>
                    </div>

                    <!-- Requirements -->
                    <div class="grid grid-cols-2 gap-x-3 gap-y-1 mt-1">
                        <div v-for="(req, i) in [
                            { label: '8+ characters', met: password.length >= 8 },
                            { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
                            { label: 'Number', met: /[0-9]/.test(password) },
                            { label: 'Special character', met: /[^A-Za-z0-9]/.test(password) },
                        ]" :key="i" class="flex items-center gap-1.5">
                            <svg class="w-3 h-3 flex-shrink-0 transition-colors duration-200"
                                :class="req.met ? 'text-emerald-400' : 'text-heading/20'" fill="currentColor"
                                viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clip-rule="evenodd" />
                            </svg>
                            <span class="text-[11px] transition-colors duration-200"
                                :class="req.met ? 'text-heading/60' : 'text-text/30'">
                                {{ req.label }}
                            </span>
                        </div>
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
                        <input v-model="password_confirmation" :type="showConfirm ? 'text' : 'password'"
                            placeholder="Repeat your new password" required autocomplete="new-password"
                            class="w-full pl-10 pr-11 py-3 rounded-xl border-2 transition-all duration-200 bg-panel text-heading text-sm placeholder:text-text/30 focus:outline-none shadow-sm"
                            :class="password_confirmation && password !== password_confirmation
                                ? 'border-red-400 focus:border-red-400'
                                : password_confirmation && password === password_confirmation
                                    ? 'border-emerald-400 focus:border-emerald-400'
                                    : 'border-heading/15 focus:border-accent'" />
                        <button type="button" @click="showConfirm = !showConfirm"
                            class="absolute right-3.5 text-text/40 hover:text-accent transition-colors z-10">
                            <v-icon :name="showConfirm ? 'ri-eye-off-line' : 'ri-eye-line'" scale="0.85" />
                        </button>
                    </div>
                    <p v-if="password_confirmation && password !== password_confirmation"
                        class="text-[12px] text-red-400 font-medium flex items-center gap-1">
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clip-rule="evenodd" />
                        </svg>
                        Passwords don't match
                    </p>
                </div>

                <!-- Submit -->
                <button type="submit" :disabled="loading"
                    class="tazko-btn w-full py-3.5 rounded-xl text-sm font-bold tracking-wide group mt-1"
                    :class="loading ? 'opacity-70 cursor-not-allowed' : ''">
                    <span v-if="!loading" class="flex items-center justify-center gap-2">
                        Reset Password
                        <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </span>
                    <span v-else class="flex items-center justify-center gap-2">
                        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Resetting...
                    </span>
                </button>

                <router-link :to="{ name: 'login' }"
                    class="text-center text-[13px] font-medium text-text/50 hover:text-accent transition-colors">
                    ← Back to sign in
                </router-link>

            </form>
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