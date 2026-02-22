<script setup>
    import {RouterLink} from "vue-router";
    import Logo from "./icons/Logo.vue";
    import { addIcons } from "oh-vue-icons";
    import { useAuthStore } from '@/stores/auth'
    import { SiHomeadvisor, BiChatDots, LaUserCircleSolid, CoSettings, MdLogoutOutlined , LaUserEditSolid} from
            "oh-vue-icons/icons";
    import { useRouter } from 'vue-router'
    import { useRoute } from 'vue-router'
    import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
    import { useToast } from "@/utils/toast.js"

    const { errorToast } = useToast()

    addIcons(SiHomeadvisor, BiChatDots, LaUserCircleSolid, CoSettings, MdLogoutOutlined, LaUserEditSolid);

    const router = useRouter()
    const auth = useAuthStore()
    const handleLogout = async () => {
        const response = await auth.logout()
        if(response.success){
            await router.push({name: 'login'})
        }else{
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
    <header class="py-4 border-b border-b-tazko-blue/20">
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
                            <router-link :to="{name: 'home'}">
                                <v-icon name="si-homeadvisor" /> Home
                            </router-link>
                        </li>
                        <li>
                            <router-link :to="{name: 'pings'}">
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
                            <img v-if="auth.user?.avatar" :src="auth.user.avatar" alt="Avatar"
                                class=" w-8 h-8 object-cover rounded-full"/>
                            <v-icon class="w-8 " v-else name="la-user-circle-solid" />
                            {{ auth.user?.name }}
                        </button>

                        <!-- Dropdown -->
                        <Transition name="fade-up">
                            <div v-if="dropdownOpen"
                                class="absolute top-12 right-0 flex-col flex w-50 px-6 py-3 bg-panel rounded-md shadow-lg shadow-tazko-blue/10">
                                <div class="absolute -top-2 right-4 w-4 h-4 bg-panel rotate-45 shadow-tazko-blue/10"></div>
                                <router-link :to="{name : 'profile'}"
                                    class="dropdown-item text-tazko-blue flex align-center gap-1">
                                    <v-icon class="w-5" name="la-user-edit-solid" /> Edit Profile
                                </router-link>

                                <router-link :to="{name : 'preferences'}"
                                    class="dropdown-item text-tazko-blue flex align-center gap-1">
                                    <v-icon class="w-5" name="co-settings" /> Preparences
                                </router-link>

                                <button class="dropdown-item text-tazko-blue flex align-center gap-1 logout"
                                    @click="handleLogout">
                                    <v-icon class="w-5" name="md-logout-outlined" /> Logout
                                </button>
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

.dropdown-item{
    @apply w-full text-left font-medium py-3 cursor-pointer hover:text-[#303030] transition
    [&:not(:last-child)]:border-b border-b-gray-300
    text-sm;
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