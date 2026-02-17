import { defineStore } from 'pinia'
import axios from '@/axios'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        authChecked: false,
    }),
    getters: {
        isLoggedIn: (state) => !!state.user,
    },
    actions: {
        async login(email, password) {
            try {
                await axios.get('/sanctum/csrf-cookie')

                const { data } = await axios.post('/api/login', { email, password })

                if (data.status === 'success') {
                    if (data.user) {
                        this.user = data.user
                        this.authChecked = true
                    } else {
                        await this.fetchUser()
                    }
                    return { success: true, message: data.message }
                }


                return { success: false, message: data.message || 'Login failed' }
            } catch (err) {
                return {
                    success: false,
                    message: err.response?.data?.message || 'Something went wrong. Please try again.'
                }
            }
        },

        async signup(name, email, password) {
            try {
                await axios.get('/sanctum/csrf-cookie')
                const { data } = await axios.post('/api/register', { name, email, password })
                console.log(data);
                if (data.status === 'success') {
                    if (data.user) {
                        this.user = data.user
                        this.authChecked = true
                    } else {
                        await this.fetchUser()
                    }
                    return { success: true, message: data.message }
                }
                return { success: false, message: data.message || 'Registration failed' }
            } catch (err) {
                return { success: false, message: err.response?.data?.message || 'Registration failed' }
            }
        },

        async logout() {
            try {
                const { data } = await axios.post('/api/logout')
                console.log(data);
                this.user = null
                this.authChecked = true
                return { success: true }
            } catch (err) {
                console.error('Logout error', err)
                this.user = null
                this.authChecked = true
                return { success: false, message: err.response?.data?.message }
            }
        },

        async fetchUser() {
            try {
                const { data } = await axios.get('/api/user')
                console.log(data)
                this.user = data.user
                return this.user
            } catch (err) {
                this.user = null
                return null
            } finally {
                this.authChecked = true
            }
        }
    }
})
