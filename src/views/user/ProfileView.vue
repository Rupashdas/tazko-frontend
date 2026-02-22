<script setup>
import BaseCard from '@/components/ui/BaseCard.vue'
import AvatarCropModal from "@/components/profile/AvatarCropModal.vue";
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useToast } from '@/utils/toast'
import { ref, onMounted, computed } from 'vue'
import { addIcons } from 'oh-vue-icons'
import { RiCloseFill   } from "oh-vue-icons/icons";
import axios from '@/axios'
addIcons(RiCloseFill )

const auth = useAuthStore()
const router = useRouter()
const showModal = ref(false)

// Form fields
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const title = ref('')
const phone = ref('')
const bio = ref('')
const location = ref('')
const password = ref('')
const confirmPassword = ref('')

// Avatar
const avatarFile = ref(null)
const avatarPreview = ref(null)

const loading = ref(false)

const { successToast, errorToast } = useToast()

// Load user data
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

// Submit handler
const handleProfileSave = async () => {
	
	if (!firstName.value || !lastName.value || !email.value) {
		errorToast('Please fill in all required fields.')
		return
	}
	
	if (password.value && password.value !== confirmPassword.value) {
		errorToast('Passwords do not match.')
		return
	}
	
	loading.value = true
	
	const formData = new FormData()
	
	formData.append('name', `${firstName.value} ${lastName.value}`)
	formData.append('email', email.value)
	formData.append('title', title.value || '')
	formData.append('phone', phone.value || '')
	formData.append('bio', bio.value || '')
	formData.append('location', location.value || '')
	
	if (password.value) {
		formData.append('password', password.value)
		formData.append('password_confirmation', confirmPassword.value)
	}
	
	if(avatarFile.value){
		formData.append('avatar', avatarFile.value)
	}
	
	const response = await auth.updateProfile(formData)
	
	if (response.success) {
		successToast(response.message)
		
		password.value = ''
		confirmPassword.value = ''
	} else {
		if (response.errors && Object.keys(response.errors).length > 0) {
			Object.values(response.errors).flat().forEach(message => {
				errorToast(message)
			})
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
	avatarFile.value = file
	avatarPreview.value = URL.createObjectURL(file)
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
			successToast(response.data.message || 'Avatar removed successfully')
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
	<base-card maxWidth="max-w-3xl" marginTop="mt-30">
		<div class="relative -mt-30">
			<div class="text-center">
				<div class="relative w-40 h-40 mx-auto block group ">
					<img v-if="avatarPreview" :src="avatarPreview" alt="Avatar Preview"
						class="w-full object-cover rounded-full border-accent border-3 mx-auto"/>
					<img v-else-if="user?.avatar" :src="user.avatar" alt="Avatar"
						class="w-full object-cover rounded-full border-accent border-3 mx-auto"/>
					<div v-else class="w-full h-full">
						<v-icon class="w-40 h-40 bg-panel rounded-full shadow-md shadow-accent-10"
							name="la-user-circle-solid" />
					</div>
					<button type="button" v-if="avatarPreview || user?.avatar" @click="removeAvatar"
						class="absolute h-full w-full z-10 rounded-full bg-black/40 top-0 left-0 cursor-pointer text-white opacity-0 group-hover:opacity-100 transition">
						<v-icon name="ri-close-fill" scale="1.5" fill="white" />
					</button>
				</div>
				
				<button @click="showModal = true"
					class="border px-4 py-2 border-accent rounded-3xl mt-5 cursor-pointer text-xs font-bold text-accent hover:bg-accent-10 transition">Change your avatar</button>
				<Teleport to="body">
					<AvatarCropModal :show="showModal" @closeModal="showModal = false" @submitAvatar="processAvatar"/>
				</Teleport>
			</div>
			<div class="mt-8">
				<form action="#" class="space-y-5" @submit.prevent="handleProfileSave">
					<div class="flex gap-4 flex-wrap w-full">
						<div class="flex-1">
							<label class="block text-text mb-3 font-bold text-sm">First Name <span class="text-red-500">*</span></label>
							<input v-model="firstName" type="text" placeholder="Enter your first name" class="input-field"/>
						</div>
						<div class="flex-1">
							<label class="block text-text mb-3 font-bold text-sm">Last Name <span
								class="text-red-500">*</span></label>
							<input v-model="lastName" type="text" placeholder="Enter your first name" class="input-field"/>
						</div>
					</div>
					<div class="flex gap-4 flex-wrap w-full">
						<div class="flex-1">
							<label class="block text-text mb-3 font-bold text-sm">Email <span
								class="text-red-500">*</span></label>
							<input v-model="email" type="text" placeholder="Enter your email address"
								class="input-field"/>
						</div>
						<div class="flex-1">
							<label class="block text-text mb-3 font-bold text-sm">Phone</label>
							<input v-model="phone" type="text" placeholder="Enter phone number"
								class="input-field"/>
						</div>
					</div>
					<div>
						<label class="block text-text mb-3 font-bold text-sm">Title</label>
						<input v-model="title" type="text" placeholder="e.g. Web developer"
							class="input-field"/>
					</div>
					<div>
						<label class="block text-text mb-3 font-bold text-sm">Short bio or current status</label>
						<textarea v-model="bio" type="text" placeholder="e.g. Beleive in quality" rows="4"
							class="input-field"></textarea>
					</div>
					<div>
						<label class="block text-text mb-3 font-bold text-sm">Location</label>
						<input v-model="location" type="text" placeholder="Enter your location"
							class="input-field"/>
					</div>
					<div>
						<label class="block text-text mb-3 font-bold text-sm">Password</label>
						<input v-model="password" type="password" placeholder="Enter your password"
							class="input-field"/>
					</div>
					<div>
						<label class="block text-text mb-3 font-bold text-sm">Confirm Password</label>
						<input v-model="confirmPassword" type="password" placeholder="Enter your password again"
							class="input-field"/>
					</div>
					<button type="submit" class="tazko-btn w-full" :disabled="loading">
						{{ loading ? 'Saving...' : 'Save Changes' }}
					</button>
				</form>
			</div>
		</div>
	</base-card>
</template>