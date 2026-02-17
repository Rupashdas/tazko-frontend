<script setup>
import { ref } from 'vue'
import { addIcons } from "oh-vue-icons";
import { MdAlternateemailOutlined } from "oh-vue-icons/icons";
import axios from '@/axios'
import { useToast } from '@/utils/toast'

const { successToast, errorToast } = useToast()
addIcons(MdAlternateemailOutlined);

const email = ref('')
const loading = ref(false)

const submit = async () => {
    loading.value = true
    try {
        const { data } = await axios.post('/api/password/email', { email: email.value })
        if(data.status === "success") {
            successToast(data.message)
        }else{
            errorToast(data.message)
        }
        email.value = ""
    } catch (err) {
        if (err.response && err.response.data) {
            errorToast(err.response.data.message || "Something went wrong")
        } else {
            errorToast("Network error")
        }
    } finally {
        loading.value = false
    }
}
</script>
<template>
    <div class="bg-white shadow-lg rounded-lg p-8">
        <div class="mb-6 text-center">
            <h3 class="mb-2">Reset Your Password</h3>
            <p class="text-sm">Enter your email to receive a password reset link.</p>
        </div>

        <form @submit.prevent="submit" class="space-y-4">
            <div>
                <label class="block text-gray-700 mb-1 font-medium text-sm">Email <span class="text-red-500">*</span></label>
                <div class="flex">
                    <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                        <v-icon name="md-alternateemail-outlined" />
                    </span>
                    <input v-model="email" type="email" placeholder="Enter your email" class="input-field" required/>
                </div>
            </div>

            <button type="submit" class="tazko-btn w-full" :disabled="loading">
                {{ loading ? 'Submitting...' : 'Submit' }}
            </button>
        </form>
    </div>
</template>