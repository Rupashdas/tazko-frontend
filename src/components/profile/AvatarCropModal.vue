<script setup>
import { ref, nextTick, watch } from 'vue'
import Croppie from 'croppie'
import 'croppie/croppie.css'
import { useToast } from "@/utils/toast.js";
const { errorToast } = useToast()

const props = defineProps({
	show : Boolean,
})
const emit = defineEmits(['closeModal', 'submitAvatar'])

const modalContainer = ref(null )
const imageInput = ref(null)
const hasImage = ref(false)
const dragActive = ref(false)

const originalFile = ref(null)
const cropper = ref(null)

const croppieInstance = ref(null)
const croppieEl = ref(null)
const handleClickOutside = (e) => {
	if (modalContainer.value && e.target === modalContainer.value) {
		closeModal()
	}
}
const closeModal = () => {
	if (croppieInstance.value) {
		croppieInstance.value.destroy()
		croppieInstance.value = null
	}
	hasImage.value = false
	emit('closeModal')
}

const handleFile = async (file) => {
	originalFile.value = file
	
	const reader = new FileReader()
	reader.onload = async (event) => {
		hasImage.value = true
		await nextTick()
		
		// destroy previous instance
		if (croppieInstance.value) {
			croppieInstance.value.destroy()
		}
		
		croppieInstance.value = new Croppie(croppieEl.value, {
			url: event.target.result,
			
			viewport: {
				width: 240,
				height: 240,
				type: 'circle',
			},
			
			boundary: {
				width: '100%',
				height: 288,
			},
			
		})
	}
	reader.readAsDataURL(file)
}

const onFileChange = (e) => handleFile(e.target.files[0])
const submitAvatar = async () => {
	if (!croppieInstance.value) return errorToast("No image selected")
	
	try {
		const blob = await croppieInstance.value.result({
			type: 'blob',
			size: { width: 400, height: 400 },
			format: 'png',
		})
		
		const fileName = originalFile.value?.name || 'avatar.png'
		const croppedFile = new File([blob], fileName, { type: blob.type })
		
		emit('submitAvatar', croppedFile)
		closeModal()
	} catch (err) {
		console.error(err)
		errorToast("Cropping failed")
	}
}


watch(() => props.show, (newVal) => {
	if (newVal) {
		document.body.style.overflow = 'hidden'
		document.body.style.height = '100vh'
	} else {
		document.body.style.overflow = ''
		document.body.style.height = 'auto'
	}
})
const onDrop = (e) => {
	e.preventDefault()
	dragActive.value = false
	
	const files = e.dataTransfer.files
	
	if (files.length === 0) return
	
	if (files.length > 1) {
		errorToast("Please upload only one avatar")
		return
	}
	
	handleFile(files[0])
}
const triggerFileInput = () => {
	if (!hasImage.value) {
		imageInput.value.click()
	}
}
</script>

<template>
	<Transition name="fade">
		<div v-if="show" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
			@click="handleClickOutside" ref="modalContainer">
			<div class="bg-panel w-full max-w-2xl rounded-2xl p-6 relative">
				<h3 class="text-xl font-semibold mb-4">Update Avatar</h3>
				<input type="file" class="hidden" accept="image/*" ref="imageInput" @change="onFileChange"/>
				<div
					id="cropper-container"
					class="border-2 min-h-80 border-dashed relative border-theme rounded-xl p-4" :class="{
					'border-blue-500 bg-blue-50': dragActive, 'cursor-pointer' : !hasImage }"
					@dragover.prevent="dragActive = true"
					@dragleave="dragActive = false"
					@drop="onDrop"
				>
					<div v-if="!hasImage"
						class="cursor-pointer text-gray-500 absolute h-full w-full top-0 left-0 flex items-center justify-center"
						@click="triggerFileInput">
						<p>Drag & Drop or Click to Select Image</p>
					</div>
					<div
						v-show="hasImage"
						ref="croppieEl"
						class="w-full h-full"
					></div>
				</div>
				<div class="flex mt-6 justify-end gap-4">
					<button type="button"
						class="px-4 py-2 text-text dark:text-panel bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-400"
						@click="closeModal">Cancel
					</button>
					<button type="button" class="tazko-btn" @click="submitAvatar">Save</button>
				</div>
			</div>
		</div>
	</Transition>
</template>

<style scoped>

.fade-enter-active,
.fade-leave-active {
	transition: all 0.2s ease-in-out;
	opacity: 1;
	visibility: visible;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
	visibility: hidden;
}

</style>
