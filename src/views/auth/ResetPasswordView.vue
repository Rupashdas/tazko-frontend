<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/axios'
import { useToast } from '@/utils/toast'

const { successToast, errorToast } = useToast()

const route = useRoute()
const router = useRouter()

const token = ref(route.query.token || '')
const email = ref(route.query.email || '')
const password = ref('')
const password_confirmation = ref('')
const loading = ref(false)

const submit = async () => {
    loading.value = true
    try {
        const { data } = await axios.post('/api/password/reset', {
            token: token.value,
            email: email.value,
            password: password.value,
            password_confirmation: password_confirmation.value,
        })
        if(data.status === "success"){
            successToast(data.message || 'Successfully reset!')
            await router.push({name: 'login'})
        }
    } catch (err) {
        if (err.response && err.response.data) {
            const response = err.response.data
            if (response.errors && Object.keys(response.errors).length > 0) {
                Object.values(response.errors).flat().forEach(message => {
                    errorToast(message)
                })
            } else if (response.message) {
                errorToast(response.message)
            } else {
                errorToast('Something went wrong')
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
    <div class="bg-white shadow-lg rounded-lg p-8">
        <div class="mb-6 text-center">
            <h3 class="mb-2">Set a New Password</h3>
            <p class="text-sm">Enter a new password for your account.</p>
        </div>

        <form @submit.prevent="submit" class="space-y-4">
            <div>
                <label class="block text-gray-700 mb-1 font-medium text-sm">New Password <span class="text-red-500">*</span></label>
                <input v-model="password" type="password" placeholder="New password" class="input-field" required />
            </div>

            <div>
                <label class="block text-gray-700 mb-1 font-medium text-sm">Confirm Password <span class="text-red-500">*</span></label>
                <input v-model="password_confirmation" type="password" placeholder="Confirm password" class="input-field" required />
            </div>

            <button type="submit" class="tazko-btn w-full" :disabled="loading">
                {{ loading ? 'Resetting...' : 'Reset Password' }}
            </button>
        </form>
    </div>
</template>