<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { addIcons } from 'oh-vue-icons'
import { RiLockPasswordLine, RiEyeLine, RiEyeOffLine } from 'oh-vue-icons/icons'
import axios from '@/axios'
import { useToast } from '@/utils/toast'

addIcons(RiLockPasswordLine, RiEyeLine, RiEyeOffLine)

const { successToast, errorToast } = useToast()
const route = useRoute()
const router = useRouter()

const token = route.query.token ?? ''
const loading = ref(false)
const checking = ref(true)
const invalid = ref(false)
const done = ref(false)

const invitation = ref(null)  // { name, email, role, invited_by, expires_at }

const password = ref('')
const password_confirmation = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)

/* ── Password strength (same pattern as ResetPasswordView) ── */
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

/* ── Validate token on mount ─────────────────────────────── */
onMounted(async () => {
	if (!token) { invalid.value = true; checking.value = false; return }

	try {
		const { data } = await axios.get(`/api/invitations/${token}`)
		invitation.value = data.data
	} catch (err) {
		invalid.value = true
		const msg = err.response?.data?.message ?? 'Invalid or expired invitation.'
		errorToast(msg)
	} finally {
		checking.value = false
	}
})

/* ── Accept ──────────────────────────────────────────────── */
const submit = async () => {
	if (password.value !== password_confirmation.value) {
		errorToast('Passwords do not match.')
		return
	}
	loading.value = true
	try {
		const { data } = await axios.post(`/api/invitations/${token}/accept`, {
			password: password.value,
			password_confirmation: password_confirmation.value,
		})
		if (data.status === 'success') {
			successToast(data.message)
			done.value = true
		}
	} catch (err) {
		const errors = err.response?.data?.errors
		if (errors) {
			Object.values(errors).flat().forEach(m => errorToast(m))
		} else {
			errorToast(err.response?.data?.message ?? 'Something went wrong.')
		}
	} finally {
		loading.value = false
	}
}
</script>

<template>
	<div class="animate-fade-in">

		<!-- ── Checking token ── -->
		<div v-if="checking" class="flex flex-col items-center justify-center py-16 gap-4">
			<div class="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
			<p class="text-sm text-text/80">Verifying invitation…</p>
		</div>

		<!-- ── Invalid / expired ── -->
		<div v-else-if="invalid" class="text-center">
			<div
				class="w-16 h-16 rounded-2xl bg-red-50 border-2 border-red-100 flex items-center justify-center mx-auto mb-6">
				<svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
						d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
				</svg>
			</div>
			<h2 class="auth-title mb-2">Invalid Invitation</h2>
			<p class="text-sm text-text/60 leading-relaxed mb-8">
				This invitation link is invalid or has expired.<br>
				Please ask your admin to send a new one.
			</p>
			<router-link :to="{ name: 'login' }" class="tazko-btn inline-block px-6 py-3 rounded-xl text-sm font-bold">
				Go to Login
			</router-link>
		</div>

		<!-- ── Success ── -->
		<div v-else-if="done" class="text-center">
			<div
				class="w-16 h-16 rounded-2xl bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center mx-auto mb-6">
				<svg class="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
				</svg>
			</div>
			<h2 class="auth-title mb-2">You're in! 🎉</h2>
			<p class="text-sm text-text/60 leading-relaxed mb-8">
				Your account has been created successfully.<br>
				You can now sign in with your email and password.
			</p>
			<router-link :to="{ name: 'login' }" class="tazko-btn inline-block px-6 py-3 rounded-xl text-sm font-bold">
				Go to Login →
			</router-link>
		</div>

		<!-- ── Accept form ── -->
		<div v-else>
			<!-- Header -->
			<div class="mb-8">
				<div class="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
					<svg class="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
							d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM19 8l2 2m0 0l2-2m-2 2V5" />
					</svg>
				</div>
				<h2 class="auth-title">Accept Invitation</h2>
				<p class="mt-2 text-sm text-text/60 leading-relaxed">
					You've been invited by <strong class="text-heading/80">{{ invitation.invited_by }}</strong>.
					Set a password to create your account.
				</p>
			</div>

			<!-- Invite info card -->
			<div class="flex items-center gap-3 p-3.5 bg-heading/5 rounded-xl border border-heading/10 mb-6">
				<div
					class="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center shrink-0 text-sm font-bold text-accent">
					{{ invitation.name?.charAt(0)?.toUpperCase() }}
				</div>
				<div class="min-w-0">
					<p class="text-sm font-semibold text-heading leading-tight truncate">{{ invitation.name }}</p>
					<p class="text-xs text-text/50 mt-0.5 truncate">{{ invitation.email }}</p>
				</div>
				<span v-if="invitation.role"
					class="ml-auto text-xs font-semibold px-2.5 py-1 rounded-lg bg-accent/10 text-accent shrink-0">
					{{ invitation.role }}
				</span>
			</div>

			<!-- Form -->
			<form @submit.prevent="submit" class="flex flex-col gap-5">

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

					<!-- Strength bar -->
					<div v-if="password" class="flex items-center gap-2 mt-0.5">
						<div class="flex gap-1 flex-1">
							<div v-for="i in 4" :key="i" class="flex-1 h-1.5 rounded-full transition-all duration-300"
								:class="i <= passwordStrength.score ? passwordStrength.color : 'bg-heading/10'" />
						</div>
						<span class="text-[11px] font-semibold text-text/80">{{ passwordStrength.label }}</span>
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
							placeholder="Repeat your password" required autocomplete="new-password"
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

				<button type="submit" :disabled="loading || passwordStrength.score < 2"
					class="tazko-btn w-full py-3.5 rounded-xl text-sm font-bold tracking-wide mt-1 disabled:opacity-50 disabled:cursor-not-allowed">
					<span v-if="loading" class="flex items-center justify-center gap-2">
						<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
						</svg>
						Creating account…
					</span>
					<span v-else>Create My Account →</span>
				</button>
			</form>

			<p class="text-center text-xs text-text/40 mt-6">
				Already have an account?
				<router-link :to="{ name: 'login' }"
					class="text-accent hover:text-accent/80 font-semibold transition-colors">
					Sign in
				</router-link>
			</p>
		</div>

	</div>
</template>