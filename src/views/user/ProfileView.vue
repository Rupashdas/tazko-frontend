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
	try {
		const formData = new FormData()
		formData.append('name', `${firstName.value} ${lastName.value}`)
		formData.append('email', email.value)
		formData.append('title', title.value || '')
		formData.append('phone', phone.value || '')
		formData.append('bio', bio.value || '')
		formData.append('location', location.value || '')
		if (password.value) formData.append('password', password.value)
		if (avatarFile.value) formData.append('avatar', avatarFile.value)
		formData.append('_method', 'PUT')

		const { data } = await axios.post('/api/profile', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		})

		if (data.status === 'success') {
			auth.user = data.data
			successToast(data.message || 'Profile updated successfully!')
			password.value = ''
			confirmPassword.value = ''
			avatarFile.value = null
		}
	} catch (err) {
		if (err.response?.data?.errors) {
			Object.values(err.response.data.errors).flat().forEach(msg => errorToast(msg))
		} else {
			errorToast(err.response?.data?.message || 'Something went wrong.')
		}
	} finally {
		loading.value = false
	}
}

const removeAvatar = () => {
	avatarPreview.value = null
	avatarFile.value = null
}

const processAvatar = (file) => {
	avatarFile.value = file
	avatarPreview.value = URL.createObjectURL(file)
	showModal.value = false
}
</script>

<template>
	<div class="max-w-5xl mx-auto mt-6 md:mt-10 mb-24 px-4">

		<!-- Page Header -->
		<!-- FIX: page-title (was missing leading-tight) -->
		<div class="mb-6 md:mb-8">
			<h1 class="page-title">My Profile</h1>
			<!-- FIX: page-subtitle (was text-base text-text/80 — too large + too bright) -->
			<p class="page-subtitle">Manage your personal information and account security.</p>
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
						<p class="text-sm text-text/60 mt-1">{{ title || 'No title set' }}</p>

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
						<!-- FIX: sidebar-eyebrow (was text-sm font-bold text-text/80 uppercase tracking-widest) -->
						<p class="sidebar-eyebrow">Quick Info</p>
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
								<p class="text-xs text-text/50 leading-none">Email</p>
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
								<p class="text-xs text-text/50 leading-none">Phone</p>
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
								<p class="text-xs text-text/50 leading-none">Location</p>
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
								<p class="text-xs text-text/50 leading-none">Role</p>
								<p class="text-sm font-semibold text-heading truncate mt-0.5">
									{{ auth.user?.roles?.[0]?.label || '—' }}
								</p>
							</div>
						</div>
					</div>
				</div>

				<!-- ── RIGHT COLUMN: Form ───────────────────────── -->
				<div class="flex-1 space-y-5">

					<!-- Section: Basic Information -->
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
								<!-- FIX: section-title (was text-md — invalid Tailwind class!) -->
								<h6 class="section-title">Basic Information</h6>
								<!-- FIX: section-desc (was text-sm text-text/80 — too large + too bright) -->
								<p class="section-desc">Your public profile details</p>
							</div>
						</div>

						<div class="p-5 md:p-6 space-y-4">
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

							<div>
								<label class="block text-sm font-semibold text-text/60 mb-1.5">Job Title</label>
								<input v-model="title" type="text" placeholder="e.g. Senior Developer"
									class="input-field" :disabled="!canUpdateProfile" />
							</div>
						</div>
					</div>

					<!-- Section: Contact Details -->
					<div class="bg-panel border border-heading/8 rounded-2xl shadow-sm overflow-hidden">
						<div class="px-5 md:px-6 py-5 border-b border-heading/6 flex items-center gap-3">
							<div class="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
								<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-500"
									viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
									stroke-linecap="round">
									<path
										d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.01 1.16 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14z" />
								</svg>
							</div>
							<div>
								<!-- FIX: section-title (was text-md) -->
								<h6 class="section-title">Contact Details</h6>
								<!-- FIX: section-desc -->
								<p class="section-desc">Phone & location</p>
							</div>
						</div>

						<div class="p-5 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label class="block text-sm font-semibold text-text/60 mb-1.5">Phone</label>
								<div class="relative">
									<span class="absolute left-3 top-1/2 -translate-y-1/2 text-text/30">
										<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24"
											fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
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
											fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
											<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
											<circle cx="12" cy="10" r="3" />
										</svg>
									</span>
									<input v-model="location" type="text" placeholder="City, Country"
										class="input-field pl-10" :disabled="!canUpdateProfile" />
								</div>
							</div>
						</div>
					</div>

					<!-- Section: About -->
					<div class="bg-panel border border-heading/8 rounded-2xl shadow-sm overflow-hidden">
						<div class="px-5 md:px-6 py-5 border-b border-heading/6 flex items-center gap-3">
							<div class="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
								<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-violet-500"
									viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
									stroke-linecap="round">
									<line x1="8" y1="6" x2="21" y2="6" />
									<line x1="8" y1="12" x2="21" y2="12" />
									<line x1="8" y1="18" x2="21" y2="18" />
									<line x1="3" y1="6" x2="3.01" y2="6" />
									<line x1="3" y1="12" x2="3.01" y2="12" />
									<line x1="3" y1="18" x2="3.01" y2="18" />
								</svg>
							</div>
							<div>
								<!-- FIX: section-title (was text-md) -->
								<h6 class="section-title">About</h6>
								<!-- FIX: section-desc -->
								<p class="section-desc">Short bio or introduction</p>
							</div>
						</div>

						<div class="p-5 md:p-6">
							<label class="block text-sm font-semibold text-text/60 mb-1.5">Bio</label>
							<textarea v-model="bio" rows="3" placeholder="Tell your team a bit about yourself…"
								class="input-field resize-none leading-relaxed" :disabled="!canUpdateProfile" />
							<p class="text-xs text-text/35 mt-1.5">{{ (bio || '').length }}/500 characters</p>
						</div>
					</div>

					<!-- Section: Change Password (only if has permission) -->
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
								<!-- FIX: section-title (was text-md) -->
								<h6 class="section-title">Change Password</h6>
								<!-- FIX: section-desc -->
								<p class="section-desc">Leave blank to keep your current password</p>
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
										placeholder="••••••••" autocomplete="new-password" class="input-field pr-10" />
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
							</div>
						</div>
					</div>

					<!-- Change Password locked (no permission) -->
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
								<!-- FIX: section-title (was text-md) -->
								<h6 class="section-title text-heading/40">Change Password</h6>
								<p class="section-desc">You do not have permission to change your password</p>
							</div>
						</div>
					</div>

					<!-- Save Button -->
					<div class="flex justify-end">
						<button type="submit" :disabled="loading || !canUpdateProfile"
							class="inline-flex items-center gap-2.5 px-8 py-3.5 bg-accent text-white text-sm font-semibold rounded-xl shadow-md shadow-accent/25 hover:bg-accent/85 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
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
		<AvatarCropModal v-if="showModal" :show="showModal" @closeModal="showModal = false"
			@submitAvatar="processAvatar" />
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