<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { addIcons } from "oh-vue-icons"
import { FaUsers, FaUserCog, FaCogs, IoEnterSharp } from "oh-vue-icons/icons"

addIcons(FaUsers, FaUserCog, FaCogs, IoEnterSharp)

const route = useRoute()

const navItems = [
	{
		name: 'system-settings-roles',
		icon: 'fa-user-cog',
		label: 'Manage Roles',
		desc: 'Role permissions',
		available: true,
	},
	{
		name: 'system-settings-users',
		icon: 'fa-users',
		label: 'Manage Users',
		desc: 'User accounts',
		available: true,
	},
	{
		name: null,
		icon: 'io-enter-sharp',
		label: 'Permissions',
		desc: 'Access rules',
		available: false,
	},
	{
		name: null,
		icon: 'fa-cogs',
		label: 'Configurations',
		desc: 'System config',
		available: false,
	},
]

const isActive = (name) => name && route.matched.some(r => r.name === name)
</script>

<template>
	<div class="flex gap-0 mt-10 mb-24 min-h-[600px]">

		<!-- SIDEBAR -->
		<aside
			class="w-64 shrink-0 bg-panel border border-heading/8 rounded-2xl shadow-sm overflow-hidden mr-6 self-start sticky top-24">

			<div class="px-5 pt-5 pb-4 border-b border-heading/8">
				<p class="text-xs font-semibold uppercase tracking-widest text-text/40 mb-1">Admin</p>
				<h2 class="text-lg font-bold text-heading leading-tight">System Settings</h2>
				<p class="text-xs text-text/40 mt-0.5">Configure your workspace</p>
			</div>

			<nav class="p-3 space-y-1">
				<component v-for="item in navItems" :key="item.label"
					:is="item.available && item.name ? RouterLink : 'div'"
					:to="item.available && item.name ? { name: item.name } : undefined"
					class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group w-full"
					:class="[
						isActive(item.name)
							? 'bg-accent/12 text-heading'
							: item.available
								? 'hover:bg-heading/5 text-text cursor-pointer'
								: 'opacity-40 cursor-not-allowed text-text/60'
					]">
					<span class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors" :class="isActive(item.name)
						? 'bg-accent text-white'
						: 'bg-heading/8 text-heading/50 group-hover:bg-accent/15 group-hover:text-accent'">
						<v-icon :name="item.icon" scale="0.85" />
					</span>

					<div class="min-w-0 flex-1">
						<p class="text-sm font-semibold leading-none truncate"
							:class="isActive(item.name) ? 'text-heading' : ''">
							{{ item.label }}
						</p>
						<p class="text-xs text-text/40 mt-0.5 leading-none">{{ item.desc }}</p>
					</div>

					<span v-if="isActive(item.name)" class="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
					<span v-if="!item.available"
						class="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-heading/8 text-text/40">
						Soon
					</span>
				</component>
			</nav>

			<div class="px-5 py-4 border-t border-heading/8">
				<p class="text-xs text-text/30 leading-relaxed">
					Changes apply system-wide and affect all users.
				</p>
			</div>
		</aside>

		<!-- CONTENT -->
		<div class="flex-1 min-w-0">
			<RouterView />
		</div>

	</div>
</template>