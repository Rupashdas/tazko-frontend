<script setup>
import { ref } from 'vue'
import { addIcons } from "oh-vue-icons";
import { MdAlternateemailOutlined } from "oh-vue-icons/icons";
import axios from '@/axios'
import { useToast } from '@/utils/toast'

addIcons(MdAlternateemailOutlined);

const { successToast, errorToast } = useToast()

const email = ref('')
const loading = ref(false)
const submitted = ref(false)

const submit = async () => {
    loading.value = true
    try {
        const { data } = await axios.post('/api/password/email', { email: email.value })
        if (data.status === "success") {
            successToast(data.message)
            submitted.value = true
        } else {
            errorToast(data.message)
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

const resetForm = () => {
    submitted.value = false
    email.value = ''
}
</script>

<template>
    <div class="animate-fade-in">

        <!-- Success State -->
        <div v-if="submitted" class="text-center">
            <!-- Icon -->
            <div
                class="w-16 h-16 rounded-2xl bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            </div>

            <h2 class="font-display text-heading mb-2" style="font-size: 1.8rem; line-height: 1.15;">
                Check your inbox
            </h2>
            <p class="text-sm text-text/70 leading-relaxed mb-2">
                We've sent a password reset link to
            </p>
            <p class="text-sm font-semibold text-heading mb-6 px-4 py-2 bg-heading/5 rounded-lg inline-block">
                {{ email }}
            </p>
            <p class="text-xs text-text/40 mb-8 leading-relaxed">
                Didn't receive it? Check your spam folder or try again.
            </p>

            <div class="flex flex-col gap-3">
                <button @click="resetForm" class="tazko-btn w-full py-3.5 rounded-xl text-sm font-bold">
                    Try a different email
                </button>
                <router-link :to="{ name: 'login' }"
                    class="text-sm font-medium text-text/60 hover:text-accent transition-colors text-center">
                    ← Back to sign in
                </router-link>
            </div>
        </div>

        <!-- Default State -->
        <div v-else>
            <!-- Header -->
            <div class="mb-8">
                <!-- Back link -->
                <router-link :to="{ name: 'login' }"
                    class="inline-flex items-center gap-1.5 text-[13px] font-medium text-text/60 hover:text-accent transition-colors mb-6">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to sign in
                </router-link>

                <!-- Icon -->
                <div class="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                    <svg class="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                </div>

                <h2 class="auth-title">Reset password</h2>
                <p class="mt-2 text-sm text-text/60 leading-relaxed max-w-xs">
                    Enter your email and we'll send you a secure link to reset your password.
                </p>
            </div>

            <!-- Form -->
            <form @submit.prevent="submit" class="flex flex-col gap-5">

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

                <!-- Info note -->
                <div class="flex items-start gap-2.5 p-3.5 rounded-xl bg-accent/5 border border-accent/15">
                    <svg class="w-4 h-4 text-accent mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clip-rule="evenodd" />
                    </svg>
                    <p class="text-[12px] text-text/60 leading-relaxed">
                        The reset link expires in <strong class="text-heading/70">60 minutes</strong> for security.
                    </p>
                </div>

                <button type="submit" :disabled="loading"
                    class="tazko-btn w-full py-3.5 rounded-xl text-sm font-bold tracking-wide group"
                    :class="loading ? 'opacity-70 cursor-not-allowed' : ''">
                    <span v-if="!loading" class="flex items-center justify-center gap-2">
                        Send Reset Link
                        <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </span>
                    <span v-else class="flex items-center justify-center gap-2">
                        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Sending link...
                    </span>
                </button>

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