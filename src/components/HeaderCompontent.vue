<script setup>
    import {RouterLink} from "vue-router";
    import Logo from "./icons/Logo.vue";
    import { addIcons } from "oh-vue-icons";
    import { useAuthStore } from '@/stores/auth'
    import { SiHomeadvisor, BiChatDots, LaUserCircleSolid  } from "oh-vue-icons/icons";
    import { useRouter } from 'vue-router'

    addIcons(SiHomeadvisor, BiChatDots, LaUserCircleSolid  );

    const router = useRouter()
    const auth = useAuthStore()
    const handleLogout = async () => {
        const response = await auth.logout()
        if(response.success){
            await router.push({name: 'login'})
        }
    }
</script>

<template>
    <header class="py-4">
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
                    <button type="button" class="cursor-pointer" @click="handleLogout">
                        <v-icon name="la-user-circle-solid" /> Logout
                    </button>
                </div>
            </div>
        </div>
    </header>
</template>

<style scoped>
</style>