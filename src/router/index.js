import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { usePreferencesStore } from '@/stores/usePreferencesStore'
import MainLayout from '@/layouts/MainLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

import LoginView from '@/views/auth/LoginView.vue';
import SignupView from '@/views/auth/SignupView.vue';
import ForgotPasswordView from '@/views/auth/ForgotPasswordView.vue';
import ResetPasswordView from '@/views/auth/ResetPasswordView.vue';

import ProfileView from '@/views/user/ProfileView.vue';
import PreferencesView from '@/views/user/PreferencesView.vue';
import SystemSettingsView from '@/views/admin/SystemSettingsView.vue';
import RolesView from '@/views/admin/RolesView.vue';
import UsersView from '@/views/admin/UsersView.vue';
import UnauthorizedView from '@/views/errors/Unauthorizedview.vue';

import HomeView from '@/views/HomeView.vue';
import PingsView from '@/views/PingsView.vue';
import ProjectsView from '@/views/projects/ProjectsView.vue';
import ProjectDetailView from '@/views/projects/ProjectDetailView.vue';

import AcceptInvitationView from '@/views/auth/AcceptInvitationView.vue';

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

            // ── Projects ──────────────────────────────────────────────────────
            {
                path: 'projects',
                name: 'projects',
                component: ProjectsView,
                meta: {
                    requiresCapability: 'projects.view',
                },
            },
            {
                path: 'projects/:id',
                name: 'project-detail',
                component: ProjectDetailView,
                meta: {
                    requiresCapability: 'projects.view',
                },
            },

            // 403 page
            {
                path: 'unauthorized',
                name: 'unauthorized',
                component: UnauthorizedView,
            },

            /*-----------------------------------------------------------------
            | System Settings — capability-guarded
            -----------------------------------------------------------------*/
            {
                path: 'system-settings',
                name: 'system-settings',
                redirect: { name: 'system-settings-roles' },
                component: SystemSettingsView,
                meta: {
                    requiresAuth: true,
                    requiresCapability: 'settings.view',
                },
                children: [
                    {
                        path: 'roles',
                        name: 'system-settings-roles',
                        component: RolesView,
                        meta: {
                            requiresCapability: 'roles.view',
                        },
                    },
                    {
                        path: 'users',
                        name: 'system-settings-users',
                        component: UsersView,
                        meta: {
                            requiresCapability: 'users.view',
                        },
                    },
                ]
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
            {
                path: 'accept-invitation',
                name: 'accept-invitation',
                component: AcceptInvitationView,
            },
        ]
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

router.beforeEach(async (to, from, next) => {
    const auth = useAuthStore()
    const preferencesStore = usePreferencesStore()

    // 1. Ensure auth state is resolved
    if (!auth.authChecked) {
        try {
            await auth.fetchUser()
        } catch (e) {
            // ignore
        }
    }

    // 2. If the user is logged in but marked inactive, force logout
    if (auth.isLoggedIn && auth.user?.is_active === false) {
        auth.user = null
        auth.authChecked = true
        return next({ name: 'login', query: { reason: 'deactivated' } })
    }

    // 3. Load preferences after login
    if (auth.isLoggedIn && !preferencesStore.loaded) {
        try {
            await preferencesStore.loadPreferences()
        } catch (e) {
            console.error('Failed to load preferences', e)
        }
    }

    const requiresAuth = to.matched.some(r => r.meta.requiresAuth)
    const guestOnly = to.matched.some(r => r.meta.guestOnly)

    // 4. Auth check
    if (requiresAuth && !auth.isLoggedIn) {
        return next({ name: 'login' })
    }
    if (guestOnly && auth.isLoggedIn) {
        return next({ name: 'home' })
    }

    // 5. Capability check
    if (auth.isLoggedIn) {
        const matchedWithCap = [...to.matched]
            .reverse()
            .find(r => r.meta?.requiresCapability)

        if (matchedWithCap) {
            const required = matchedWithCap.meta.requiresCapability
            if (!auth.hasCapability(required)) {
                return next({ name: 'unauthorized', query: { from: to.fullPath } })
            }
        }
    }

    return next()
})

export default router