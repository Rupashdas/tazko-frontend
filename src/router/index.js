import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePreferencesStore } from '@/stores/preferences'
import MainLayout from '@/layouts/MainLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

import LoginView from '@/views/auth/LoginView.vue';
import SignupView from '@/views/auth/SignupView.vue';
import ForgotPasswordView from '@/views/auth/ForgotPasswordView.vue';
import ResetPasswordView from '@/views/auth/ResetPasswordView.vue';

import ProfileView from '@/views/user/ProfileView.vue';
import PreferencesView from '@/views/user/PreferencesView.vue';

import HomeView from '@/views/HomeView.vue';
import PingsView from '@/views/PingsView.vue';



const routes = [

    {
        path: '/',
        component: MainLayout,
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                name: 'home',
                component: HomeView,
            },
            {
                path: 'pings',
                name: 'pings',
                component: PingsView,
            },
            {
                path: 'profile',
                name: 'profile',
                component: ProfileView,
            },
            {
                path: 'preferences',
                name: 'preferences',
                component: PreferencesView,
            },
        ]
    },

    {
        path: '/',
        component: AuthLayout,
        meta: { guestOnly: true },
        children: [
            {
                path: 'login',
                name: 'login',
                component: LoginView,
            },
            {
                path: 'signup',
                name: 'signup',
                component: SignupView,
            },
            {
                path: 'forgot-password',
                name: 'forgot-password',
                component: ForgotPasswordView,
            },
            {
                path: 'reset-password',
                name: 'reset-password',
                component: ResetPasswordView,
            },
        ]
    },

]
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})
export default router;

router.beforeEach(async (to, from, next) => {
    const auth = useAuthStore()
    const preferencesStore = usePreferencesStore()
    if (!auth.authChecked) {
        try {
            await auth.fetchUser()
        } catch (e) {
            // ignore
        }
    }

    if (auth.isLoggedIn && !preferencesStore.loaded) {
        try {
            await preferencesStore.loadPreferences()
        } catch (e) {
            console.error('Failed to load preferences', e)
        }
    }

    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const guestOnly = to.matched.some(record => record.meta.guestOnly)

    if (requiresAuth && !auth.isLoggedIn) {
        return next({ name: 'login' })
    }
    if (guestOnly && auth.isLoggedIn) {
        return next({ name: 'home' })
    }

    return next()
})