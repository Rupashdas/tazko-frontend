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
            <h3 class="mb-2">Reset Your Password</h3>
            <p class="text-sm">Enter your email to receive a password reset link.</p>
        </div>

        <form @submit.prevent="submit" class="space-y-5">
            <div>
                <label class="block text-text mb-3 font-bold text-sm">Email <span class="text-red-500">*</span></label>
                <div class="flex">
                    <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-heading bg-accent text-heading">
                        <v-icon name="md-alternateemail-outlined" />
                    </span>
                    <input v-model="email" type="email" placeholder="Enter your email" class="input-field radius-left-0"/>
                </div>
            </div>

            <button type="submit" class="tazko-btn w-full" :disabled="loading">
                {{ loading ? 'Submitting...' : 'Submit' }}
            </button>
        </form>
    </div>
</template>