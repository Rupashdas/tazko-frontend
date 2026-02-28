<script setup>
import BaseCard from '@/components/ui/BaseCard.vue'
import { RouterLink, RouterView } from 'vue-router'
import { addIcons } from "oh-vue-icons"
import { FaUsers, IoEnterSharp, FaUserCog, FaCogs } from "oh-vue-icons/icons"

addIcons(FaUsers, IoEnterSharp, FaUserCog, FaCogs)
</script>

<template>
	<div class="flex gap-6 mt-10">
		<base-card class="w-full p-8">
			<h2 class="text-2xl font-bold mb-2">System Settings</h2>
			<p class="mb-6 text-gray-500">
				Manage system-wide settings and configurations.
			</p>

			<div class="flex gap-10">

				<!-- Sidebar -->
				<aside class="w-64 border-r pr-6">
					<ul class="space-y-4">
						<li>
							<router-link :to="{ name: 'system-settings-roles' }"
								class="flex items-center gap-2 text-blue-600 hover:underline">
								<v-icon name="fa-user-cog" />
								Manage Roles
							</router-link>
						</li>

						<li>
							<router-link :to="{ name: 'system-settings-users' }"
								class="flex items-center gap-2 text-blue-600 hover:underline">
								<v-icon name="fa-users" />
								Manage Users
							</router-link>
						</li>

						<li>
							<a href="#" class="flex items-center gap-2 text-gray-600">
								<v-icon name="io-enter-sharp" />
								Manage Permissions
							</a>
						</li>

						<li>
							<a href="#" class="flex items-center gap-2 text-gray-600">
								<v-icon name="fa-cogs" />
								Manage System Configurations
							</a>
						</li>
					</ul>
				</aside>

				<!-- Content -->
				<div class="flex-1">
					<RouterView />
				</div>

			</div>
		</base-card>
	</div>
</template>