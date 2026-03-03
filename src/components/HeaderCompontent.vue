<script setup>
import { RouterLink } from "vue-router";
import Logo from "./icons/Logo.vue";
import { addIcons } from "oh-vue-icons";
import { useAuthStore } from '@/stores/auth'
import { SiHomeadvisor, BiChatDots, LaUserCircleSolid, CoSettings, MdLogoutOutlined, LaUserEditSolid, BiPalette } from
    "oh-vue-icons/icons";
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useToast } from "@/utils/toast.js"

const { errorToast } = useToast()

addIcons(SiHomeadvisor, BiChatDots, LaUserCircleSolid, CoSettings, MdLogoutOutlined, LaUserEditSolid, BiPalette);

const router = useRouter()
const auth = useAuthStore()
const handleLogout = async () => {
    const response = await auth.logout()
    if (response.success) {
        await router.push({ name: 'login' })
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
}

const dropdownOpen = ref(false)
const dropdownRef = ref(null)

const toggleDropdown = () => {
    dropdownOpen.value = !dropdownOpen.value
}
const handleClickOutside = (e) => {
    if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
        dropdownOpen.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
})

const route = useRoute()

watch(() => route.fullPath, () => {
    dropdownOpen.value = false
})
</script>

<template>
    <header class="sticky top-0 z-50 bg-panel px-4 py-5 shadow-sm">
        <div class="container mx-auto">
            <div class="flex items-center">
                <div class="max-w-40">
                    <RouterLink to="/" class="max-w-24 inline-block">
                        <Logo />
                    </RouterLink>
                </div>
                <nav class="flex flex-1 items-center justify-center">
                    <ul class="flex items-center flex-wrap gap-3">
                        <li>
                            <router-link :to="{ name: 'home' }">
                                <v-icon name="si-homeadvisor" /> Home
                            </router-link>
                        </li>
                        <li>
                            <router-link :to="{ name: 'pings' }">
                                <v-icon name="bi-chat-dots" /> Pings
                            </router-link>
                        </li>
                    </ul>
                </nav>
                <div class="max-w-40">
                    <div class="relative" ref="dropdownRef" v-if="auth.isLoggedIn">

                        <!-- Profile Button -->
                        <button class="flex items-center gap-2 cursor-pointer font-medium text-sm"
                            @click="toggleDropdown">
                            <div class="text-left">
                                <p>{{ auth.user ? auth.user.name : "User" }}</p>
                            </div>
                            <img v-if="auth.user?.avatar" :src="auth.user.avatar" alt="Avatar"
                                class=" w-8 h-8 object-cover rounded-full border-1 border-accent" />
                            <v-icon class="w-8" v-else name="la-user-circle-solid" />
                        </button>

                        <!-- User dropdown -->
                        <Transition name="fade-up">
                            <div>
                                <div>
                                    <h4>{{ auth.user?.name ?? "User" }}</h4>
                                    <p>{{ auth.user?.roles?.[0]?.label || "User" }}</p>
                                </div>

                                <div class="pt-4">
                                    <router-link :to="{ name: 'profile' }"
                                        class="dropdown-item text-accent flex align-center gap-1 hover:text-heading font-medium">
                                        <v-icon class="w-5" name="la-user-edit-solid" /> Edit Profile
                                    </router-link>

                                    <router-link :to="{ name: 'preferences' }"
                                        class="dropdown-item text-accent flex align-center gap-1 hover:text-heading font-medium">
                                        <v-icon class="w-5" name="bi-palette" /> Preferences
                                    </router-link>

                                    <!--
                                    System Settings — only show if user has the settings.view capability.
                                    super-admin: always visible (hasCapability returns true for super-admin).
                                    client / developer without settings.view: link hidden entirely.
                                -->
                                    <router-link v-if="auth.hasCapability('settings.view')"
                                        :to="{ name: 'system-settings' }"
                                        class="dropdown-item text-accent flex align-center gap-1 hover:text-heading font-medium">
                                        <v-icon class="w-5" name="co-settings" /> System Settings
                                    </router-link>

                                    <button
                                        class="dropdown-item text-accent flex align-center gap-1 hover:text-heading font-medium logout"
                                        @click="handleLogout">
                                        <v-icon class="w-5" name="md-logout-outlined" /> Logout
                                    </button>
                                </div>
                            </div>
                        </Transition>
                    </div>
                </div>
            </div>
        </div>
    </header>
</template>

<style scoped>
@reference "tailwindcss";

.dropdown-item {
    @apply w-full text-left font-medium py-3 cursor-pointer transition [&:not(:last-child)]:border-b border-b-gray-300 text-sm;
}

.fade-up-enter-active,
.fade-up-leave-active {
    transition: all 0.2s ease-in-out;
    opacity: 1;
    visibility: visible;
    margin-top: 0
}

.fade-up-enter-from,
.fade-up-leave-to {
    opacity: 0;
    visibility: hidden;
    margin-top: 10px;
}
</style>