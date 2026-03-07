<script setup>
import AvatarCropModal from "@/components/profile/AvatarCropModal.vue";
import { useAuthStore } from '@/stores/useAuthStore'
import { useRouter } from 'vue-router'
import { useToast } from '@/utils/toast'
import { ref, onMounted, computed } from 'vue'
import { addIcons } from 'oh-vue-icons'
import { RiCloseFill } from "oh-vue-icons/icons";
import axios from '@/axios'
addIcons(RiCloseFill)

const auth = useAuthStore()
const router = useRouter()
const showModal = ref(false)

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const title = ref('')
const phone = ref('')
const bio = ref('')
const location = ref('')
const password = ref('')
const confirmPassword = ref('')

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const avatarFile = ref(null)
const avatarPreview = ref(null)
const loading = ref(false)

const { successToast, errorToast } = useToast()

const canUpdateProfile = computed(() => auth.hasCapability('users.profile.update'))
const canChangePassword = computed(() => auth.hasCapability('users.password.change'))

onMounted(async () => {
	if (!auth.isLoggedIn) {
		await router.push('/login')
		return
	}
	if (auth.user) {
		const nameParts = auth.user.name?.split(' ') || []
		firstName.value = nameParts[0] || ''
		lastName.value = nameParts.slice(1).join(' ') || ''
		email.value = auth.user.email || ''
		title.value = auth.user.title || ''
		phone.value = auth.user.phone || ''
		bio.value = auth.user.bio || ''
		location.value = auth.user.location || ''
	}
})

const user = computed(() => auth.user)
const displayName = computed(() => [firstName.value, lastName.value].filter(Boolean).join(' ') || 'Your Name')
const userInitials = computed(() => {
	const f = firstName.value?.charAt(0) || ''
	const l = lastName.value?.charAt(0) || ''
	return (f + l).toUpperCase() || '?'
})
const hasAvatar = computed(() => avatarPreview.value || user.value?.avatar)

const handleProfileSave = async () => {
	if (!canUpdateProfile.value) { errorToast('You do not have permission to update your profile.'); return }
	if (!firstName.value || !lastName.value || !email.value) { errorToast('Please fill in all required fields.'); return }
	if (password.value && password.value !== confirmPassword.value) { errorToast('Passwords do not match.'); return }
	if (password.value && !canChangePassword.value) { errorToast('You do not have permission to change your password.'); return }

	loading.value = true
	const formData = new FormData()
	formData.append('name', `${firstName.value} ${lastName.value}`)
	formData.append('email', email.value)
	formData.append('title', title.value || '')
	formData.append('phone', phone.value || '')
	formData.append('bio', bio.value || '')
	formData.append('location', location.value || '')
	if (password.value && canChangePassword.value) {
		formData.append('password', password.value)
		formData.append('password_confirmation', confirmPassword.value)
	}
	const response = await auth.updateProfile(formData)
	if (response.success) {
		successToast(response.message)
		password.value = ''
		confirmPassword.value = ''
	} else {
		if (response.errors && Object.keys(response.errors).length > 0) {
			Object.values(response.errors).flat().forEach(msg => errorToast(msg))
		} else if (response.message) {
			errorToast(response.message)
		} else {
			errorToast('Something went wrong')
		}
	}
	loading.value = false
}

const processAvatar = async (file) => {
	if (!file) return
	try {
		loading.value = true
		const formData = new FormData()
		formData.append('avatar', file)
		const response = await axios.post('/api/upload-avatar', formData)
		if (response.data.status === 'success') {
			auth.user.avatar = response.data.user.avatar
			avatarPreview.value = null
			avatarFile.value = null
			successToast(response.data.message || 'Avatar updated')
		} else {
			errorToast(response.data.message || 'Failed to update avatar')
		}
	} catch (err) {
		errorToast(err.response?.data?.message || 'Something went wrong')
	} finally {
		loading.value = false
	}
}

const removeAvatar = async () => {
	if (!user.value) return
	try {
		loading.value = true
		const response = await axios.post('/api/remove-avatar')
		if (response.data.status === 'success') {
			user.value.avatar = null
			avatarPreview.value = null
			avatarFile.value = null
			successToast(response.data.message || 'Avatar removed')
		} else {
			errorToast(response.data.message || 'Failed to remove avatar')
		}
	} catch (err) {
		errorToast(err.response?.data?.message || 'Something went wrong')
	} finally {
		loading.value = false
	}
}
</script>

<template>
	<div class="max-w-5xl mx-auto mt-6 md:mt-10 mb-24 px-4">

		<!-- Page Header -->
		<div class="mb-6 md:mb-8">
			<h1 class="text-2xl sm:text-3xl font-bold text-heading">My Profile</h1>
			<p class="text-text/80 mt-1.5 text-base">Manage your personal information and account security.</p>
		</div>

		<form @submit.prevent="handleProfileSave">
			<div class="flex flex-col lg:flex-row gap-5 lg:gap-6">

				<!-- ── LEFT COLUMN: Avatar Card ─────────────────── -->
				<div class="lg:w-72 shrink-0 space-y-4">

					<!-- Avatar Card -->
					<div class="bg-panel border border-heading/8 rounded-2xl p-6 shadow-sm text-center">

						<!-- Avatar display -->
						<div class="relative w-32 h-32 mx-auto mb-4 group">
							<div
								class="w-32 h-32 rounded-full overflow-hidden ring-4 ring-accent/20 ring-offset-2 ring-offset-panel">
								<img v-if="avatarPreview" :src="avatarPreview" alt="Avatar Preview"
									class="w-full h-full object-cover" />
								<img v-else-if="user?.avatar" :src="user.avatar" alt="Avatar"
									class="w-full h-full object-cover" />
								<div v-else
									class="w-full h-full flex items-center justify-center text-4xl font-bold text-white"
									:style="{ background: 'var(--color-accent)' }">
									{{ userInitials }}
								</div>
							</div>
							<button v-if="hasAvatar && canUpdateProfile" type="button" @click="removeAvatar"
								class="absolute inset-0 rounded-full bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer">
								<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24"
									fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
								<span class="text-white text-xs font-semibold">Remove</span>
							</button>
						</div>

						<!-- Name preview -->
						<h3 class="font-bold text-heading text-xl leading-tight">{{ displayName }}</h3>
						<p class="text-sm text-text/80 mt-1">{{ title || 'No title set' }}</p>

						<!-- Change avatar button -->
						<button v-if="canUpdateProfile" type="button" @click="showModal = true"
							class="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-accent/30 text-accent text-sm font-bold hover:bg-accent/5 hover:border-accent/60 transition-all duration-200 cursor-pointer">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
								stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
								<path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
								<circle cx="12" cy="13" r="4" />
							</svg>
							Change Avatar
						</button>
						<div v-else
							class="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-heading/8 text-text/30 text-sm">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
								stroke="currentColor" stroke-width="2" stroke-linecap="round">
								<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
								<path d="M7 11V7a5 5 0 0110 0v4" />
							</svg>
							Profile editing restricted
						</div>
					</div>

					<!-- Quick Info Card -->
					<div class="bg-panel border border-heading/8 rounded-2xl p-5 shadow-sm space-y-3">
						<p class="text-sm font-bold text-text/80 uppercase tracking-widest">Quick Info</p>
						<div class="flex items-center gap-3">
							<div
								class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
								<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-500"
									viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
									stroke-linecap="round">
									<path
										d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
									<polyline points="22,6 12,13 2,6" />
								</svg>
							</div>
							<div class="min-w-0">
								<p class="text-xs text-text/80 leading-none">Email</p>
								<p class="text-sm font-semibold text-heading truncate mt-0.5">{{ email || '—' }}</p>
							</div>
						</div>
						<div class="flex items-center gap-3">
							<div
								class="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center shrink-0">
								<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-green-500"
									viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
									stroke-linecap="round">
									<path
										d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.01 1.16 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14z" />
								</svg>
							</div>
							<div class="min-w-0">
								<p class="text-xs text-text/80 leading-none">Phone</p>
								<p class="text-sm font-semibold text-heading truncate mt-0.5">{{ phone || '—' }}</p>
							</div>
						</div>
						<div class="flex items-center gap-3">
							<div
								class="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center shrink-0">
								<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-purple-500"
									viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
									stroke-linecap="round">
									<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
									<circle cx="12" cy="10" r="3" />
								</svg>
							</div>
							<div class="min-w-0">
								<p class="text-xs text-text/80 leading-none">Location</p>
								<p class="text-sm font-semibold text-heading truncate mt-0.5">{{ location || '—' }}</p>
							</div>
						</div>
						<div class="flex items-start gap-3">
							<div
								class="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
								<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-amber-500"
									viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
									stroke-linecap="round">
									<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
									<circle cx="12" cy="7" r="4" />
								</svg>
							</div>
							<div class="min-w-0">
								<p class="text-xs text-text/80 leading-none">Role</p>
								<p class="text-sm font-semibold text-heading truncate mt-0.5">{{
									auth.user?.roles?.[0]?.label || '—' }}</p>
							</div>
						</div>
					</div>
				</div>

				<!-- ── RIGHT COLUMN: Form ───────────────────────── -->
				<div class="flex-1 space-y-5">

					<!-- Section: Basic Info -->
					<div class="bg-panel border border-heading/8 rounded-2xl shadow-sm overflow-hidden">
						<div class="px-5 md:px-6 py-5 border-b border-heading/6 flex items-center gap-3">
							<div class="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
								<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-accent" viewBox="0 0 24 24"
									fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
									<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
									<circle cx="12" cy="7" r="4" />
								</svg>
							</div>
							<div>
								<h6 class="text-md font-bold text-heading leading-none">Basic Information</h6>
								<p class="text-sm text-text/80 mt-0.5">Your public profile details</p>
							</div>
						</div>

						<div class="p-5 md:p-6 space-y-4">
							<!-- Name row -->
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label class="block text-sm font-semibold text-text/60 mb-1.5">
										First Name <span class="text-red-400">*</span>
									</label>
									<input v-model="firstName" type="text" placeholder="John" class="input-field"
										:disabled="!canUpdateProfile" />
								</div>
								<div>
									<label class="block text-sm font-semibold text-text/60 mb-1.5">
										Last Name <span class="text-red-400">*</span>
									</label>
									<input v-model="lastName" type="text" placeholder="Doe" class="input-field"
										:disabled="!canUpdateProfile" />
								</div>
							</div>

							<!-- Email -->
							<div>
								<label class="block text-sm font-semibold text-text/60 mb-1.5">
									Email Address <span class="text-red-400">*</span>
								</label>
								<div class="relative">
									<span class="absolute left-3 top-1/2 -translate-y-1/2 text-text/30">
										<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24"
											fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
											<path
												d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
											<polyline points="22,6 12,13 2,6" />
										</svg>
									</span>
									<input v-model="email" type="email" placeholder="you@company.com"
										class="input-field pl-10" :disabled="!canUpdateProfile" />
								</div>
							</div>

							<!-- Title -->
							<div>
								<label class="block text-sm font-semibold text-text/60 mb-1.5">Job Title</label>
								<input v-model="title" type="text" placeholder="e.g. Senior Developer"
									class="input-field" :disabled="!canUpdateProfile" />
							</div>

							<!-- Phone & Location -->
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label class="block text-sm font-semibold text-text/60 mb-1.5">Phone</label>
									<div class="relative">
										<span class="absolute left-3 top-1/2 -translate-y-1/2 text-text/30">
											<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24"
												fill="none" stroke="currentColor" stroke-width="2"
												stroke-linecap="round">
												<path
													d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.01 1.16 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14z" />
											</svg>
										</span>
										<input v-model="phone" type="text" placeholder="+1 (555) 000-0000"
											class="input-field pl-10" :disabled="!canUpdateProfile" />
									</div>
								</div>
								<div>
									<label class="block text-sm font-semibold text-text/60 mb-1.5">Location</label>
									<div class="relative">
										<span class="absolute left-3 top-1/2 -translate-y-1/2 text-text/30">
											<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24"
												fill="none" stroke="currentColor" stroke-width="2"
												stroke-linecap="round">
												<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
												<circle cx="12" cy="10" r="3" />
											</svg>
										</span>
										<input v-model="location" type="text" placeholder="City, Country"
											class="input-field pl-10" :disabled="!canUpdateProfile" />
									</div>
								</div>
							</div>

							<!-- Bio -->
							<div>
								<label class="block text-sm font-semibold text-text/60 mb-1.5">Bio</label>
								<textarea v-model="bio" rows="3" placeholder="Tell your team a bit about yourself…"
									class="input-field resize-none leading-relaxed" :disabled="!canUpdateProfile" />
								<p class="text-xs text-text/35 mt-1.5">{{ (bio || '').length }}/500 characters</p>
							</div>
						</div>
					</div>

					<!-- Section: Security -->
					<div v-if="canChangePassword"
						class="bg-panel border border-heading/8 rounded-2xl shadow-sm overflow-hidden">
						<div class="px-5 md:px-6 py-5 border-b border-heading/6 flex items-center gap-3">
							<div class="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
								<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-amber-500"
									viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
									stroke-linecap="round">
									<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
									<path d="M7 11V7a5 5 0 0110 0v4" />
								</svg>
							</div>
							<div>
								<h6 class="text-md font-bold text-heading leading-none">Change Password</h6>
								<p class="text-sm text-text/80 mt-0.5">Leave blank to keep your current password</p>
							</div>
						</div>

						<div class="p-5 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label class="block text-sm font-semibold text-text/60 mb-1.5">New Password</label>
								<div class="relative">
									<input v-model="password" :type="showPassword ? 'text' : 'password'"
										placeholder="••••••••" autocomplete="new-password" class="input-field pr-10" />
									<button type="button" @click="showPassword = !showPassword"
										class="absolute right-3 top-1/2 -translate-y-1/2 text-text/30 hover:text-text transition-colors">
										<svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4"
											viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
											stroke-linecap="round">
											<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
											<circle cx="12" cy="12" r="3" />
										</svg>
										<svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4"
											viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
											stroke-linecap="round">
											<path
												d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
											<line x1="1" y1="1" x2="23" y2="23" />
										</svg>
									</button>
								</div>
							</div>
							<div>
								<label class="block text-sm font-semibold text-text/60 mb-1.5">Confirm Password</label>
								<div class="relative">
									<input v-model="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
										placeholder="••••••••" autocomplete="new-password" class="input-field pr-10"
										:class="{
											'border-red-400 focus:border-red-400': confirmPassword && password !== confirmPassword,
											'border-green-400 focus:border-green-400': confirmPassword && password === confirmPassword && password
										}" />
									<button type="button" @click="showConfirmPassword = !showConfirmPassword"
										class="absolute right-3 top-1/2 -translate-y-1/2 text-text/30 hover:text-text transition-colors">
										<svg v-if="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg"
											class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
											stroke-width="2" stroke-linecap="round">
											<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
											<circle cx="12" cy="12" r="3" />
										</svg>
										<svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4"
											viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
											stroke-linecap="round">
											<path
												d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
											<line x1="1" y1="1" x2="23" y2="23" />
										</svg>
									</button>
								</div>
								<Transition name="slide-down">
									<p v-if="confirmPassword && password !== confirmPassword"
										class="text-sm text-red-400 mt-1.5 flex items-center gap-1.5">
										<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24"
											fill="currentColor">
											<path
												d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
										</svg>
										Passwords don't match
									</p>
									<p v-else-if="confirmPassword && password === confirmPassword && password"
										class="text-sm text-green-500 mt-1.5 flex items-center gap-1.5">
										<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24"
											fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
											<polyline points="20 6 9 17 4 12" />
										</svg>
										Passwords match
									</p>
								</Transition>
							</div>
						</div>
					</div>

					<!-- Password change not permitted -->
					<div v-else class="bg-panel border border-heading/8 rounded-2xl shadow-sm overflow-hidden">
						<div class="px-5 md:px-6 py-4 flex items-center gap-3">
							<div class="w-9 h-9 rounded-lg bg-heading/6 flex items-center justify-center shrink-0">
								<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-text/30" viewBox="0 0 24 24"
									fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
									<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
									<path d="M7 11V7a5 5 0 0110 0v4" />
								</svg>
							</div>
							<div>
								<h6 class="font-bold text-heading/40 leading-none">Change Password</h6>
								<p class="text-sm text-text/30 mt-0.5">You do not have permission to change your
									password</p>
							</div>
						</div>
					</div>

					<!-- Save Button -->
					<div class="flex justify-end">
						<button type="submit" :disabled="loading || !canUpdateProfile"
							class="inline-flex items-center gap-2.5 px-8 py-3.5 bg-accent text-white text-base font-semibold rounded-xl shadow-md shadow-accent/25 hover:bg-accent/85 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
							:title="!canUpdateProfile ? 'You do not have permission to update your profile' : ''">
							<div v-if="loading"
								class="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
							<svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24"
								fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
								<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
								<polyline points="17 21 17 13 7 13 7 21" />
								<polyline points="7 3 7 8 15 8" />
							</svg>
							{{ loading ? 'Saving…' : 'Save Changes' }}
						</button>
					</div>
				</div>
			</div>
		</form>

		<!-- Avatar Crop Modal -->
		<AvatarCropModal v-if="showModal" @close="showModal = false" @cropped="processAvatar" />
	</div>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
	transition: all 0.2s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
	opacity: 0;
	transform: translateY(-4px);
}
</style>