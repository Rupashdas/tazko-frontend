<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoleStore } from '@/stores/useRoleStore'
import { useRolePermissions } from '@/composables/useRolePermissions'
import { useToast } from '@/utils/toast'

const roleStore = useRoleStore()
const { successToast, errorToast } = useToast()
const {
	togglePermission,
	toggleSelectAll,
	isPermissionSelected,
	isModuleFullySelected,
	moduleSelectedCount,
} = useRolePermissions()

const searchQuery = ref('')
const showAddRole = ref(false)
const newRoleName = ref('')
const newRoleLabel = ref('')
const showDeleteConfirm = ref(false)

const filteredCapabilities = computed(() => roleStore.filteredCapabilities(searchQuery.value))
const totalPermissions = computed(() => Object.values(roleStore.capabilities || {}).reduce((sum, caps) => sum + caps.length, 0))
const selectedPermissionsCount = computed(() => Object.values(roleStore.selectedPermissions || {}).reduce((sum, list) => sum + list.length, 0))
const coveragePercent = computed(() => totalPermissions.value ? Math.round((selectedPermissionsCount.value / totalPermissions.value) * 100) : 0)
const moduleList = computed(() => Object.keys(filteredCapabilities.value || {}))

onMounted(() => roleStore.init())

async function handleSave() {
	const result = await roleStore.saveChanges()
	result.success ? successToast('Changes saved!') : errorToast('Failed to save changes.')
}

async function handleDelete() {
	const result = await roleStore.deleteRole()
	result.success ? (showDeleteConfirm.value = false) : errorToast('Failed to delete role.')
}

const generateRoleName = () => {
	newRoleName.value = newRoleLabel.value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
}

async function handleAddRole() {
	const result = await roleStore.createRole({ name: newRoleName.value, label: newRoleLabel.value })
	if (result.success) closeModal()
}

function closeModal() {
	showAddRole.value = false
	newRoleName.value = ''
	newRoleLabel.value = ''
}

function getRoleInitial(label) {
	return label?.charAt(0)?.toUpperCase() || '?'
}

function getModuleIcon(module) {
	const icons = { users: '👥', projects: '📁', tasks: '✅', settings: '⚙️', reports: '📊', billing: '💳', roles: '🛡️', teams: '🤝', dashboard: '🏠', files: '📄', messages: '💬', analytics: '📈' }
	return icons[module?.toLowerCase()] || '🔧'
}
</script>

<template>
	<div class="flex bg-body text-text relative min-h-[600px]">

		<!-- PAGE LOADING OVERLAY -->
		<Transition name="fade">
			<div v-if="roleStore.isPageLoading"
				class="absolute inset-0 bg-panel/80 backdrop-blur-sm flex flex-col items-center justify-center z-40 rounded-xl gap-3">
				<div class="w-10 h-10 rounded-full border-3 border-accent border-t-transparent animate-spin" />
				<p class="text-sm text-text/60 font-medium">Loading roles…</p>
			</div>
		</Transition>
		<!-- ── SIDEBAR ──────────────────────────────────────── -->
		<aside class="w-64 border-r border-heading/10 bg-panel flex flex-col shrink-0 rounded-l-xl overflow-hidden">

			<!-- Sidebar Header -->
			<div class="px-5 pt-5 pb-4 border-b border-heading/10">
				<div class="flex justify-between items-center">
					<div>
						<p class="text-xs font-semibold uppercase tracking-widest text-text/40 mb-1">System</p>
						<h2 class="text-lg font-bold text-heading leading-tight">Roles</h2>
					</div>
					<button @click="showAddRole = true"
						class="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center hover:bg-accent/80 transition-all active:scale-95 shadow-sm"
						title="Add new role">
						<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
							stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
							<line x1="12" y1="5" x2="12" y2="19" />
							<line x1="5" y1="12" x2="19" y2="12" />
						</svg>
					</button>
				</div>
			</div>
			<!-- Role List -->
			<ul class="flex-1 overflow-auto py-3 px-3 space-y-1">
				<li v-for="role in roleStore.roles" :key="role.id">
					<button @click="roleStore.selectRole(role)"
						class="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 flex items-center gap-3 group"
						:class="roleStore.selectedRole?.id === role.id
							? 'bg-accent/15 text-heading'
							: 'hover:bg-heading/5 text-text'">
						<!-- Avatar initial -->
						<span
							class="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 transition-colors"
							:class="roleStore.selectedRole?.id === role.id
								? 'bg-accent text-white'
								: 'bg-heading/10 text-heading group-hover:bg-accent/20'">
							{{ getRoleInitial(role.label) }}
						</span>
						<span class="text-sm font-medium truncate">{{ role.label }}</span>
						<!-- Active indicator -->
						<span v-if="roleStore.selectedRole?.id === role.id"
							class="ml-auto w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
					</button>
				</li>

				<!-- Empty state -->
				<li v-if="!roleStore.roles?.length" class="px-3 py-8 text-center">
					<p class="text-sm text-text/40">No roles yet</p>
					<button @click="showAddRole = true" class="mt-2 text-xs text-accent hover:underline">
						Create one →
					</button>
				</li>
			</ul>

			<!-- Sidebar Footer -->
			<div class="px-5 py-4 border-t border-heading/10">
				<p class="text-xs text-text/40">
					{{ roleStore.roles?.length || 0 }} role{{ roleStore.roles?.length !== 1 ? 's' : '' }} total
				</p>
			</div>
		</aside>

		<!-- ── MAIN CONTENT ─────────────────────────────────── -->
		<div class="flex-1 flex flex-col overflow-hidden">

			<!-- Top Bar -->
			<div class="px-8 py-5 border-b border-heading/10 bg-panel/50">
				<div class="flex justify-between items-center">

					<!-- Role title + meta -->
					<div class="flex items-center gap-4">
						<div v-if="roleStore.selectedRole">
							<div class="flex items-center gap-3">
								<h1 class="text-2xl font-bold text-heading leading-tight">
									{{ roleStore.selectedRole.label }}
								</h1>
								<!-- SuperAdmin badge -->
								<span v-if="roleStore.isSuperAdmin"
									class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
									<svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24"
										fill="currentColor">
										<path
											d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
									</svg>
									Super Admin
								</span>
							</div>
							<p class="text-sm text-text/50 mt-0.5">Manage permissions for this role</p>
						</div>
						<div v-else>
							<h1 class="text-2xl font-bold text-heading/30">Select a Role</h1>
							<p class="text-sm text-text/30 mt-0.5">Choose a role from the sidebar</p>
						</div>
					</div>

					<!-- Action Buttons -->
					<div v-if="roleStore.selectedRole" class="flex items-center gap-3">
						<!-- Coverage pill -->
						<div class="flex items-center gap-2 px-3 py-1.5 bg-heading/5 rounded-lg">
							<div class="w-16 h-1.5 bg-heading/10 rounded-full overflow-hidden">
								<div class="h-full bg-accent rounded-full transition-all duration-500"
									:style="{ width: coveragePercent + '%' }" />
							</div>
							<span class="text-xs font-semibold text-text/60">{{ coveragePercent }}%</span>
						</div>

						<button @click="showDeleteConfirm = true"
							:disabled="roleStore.isSuperAdmin || roleStore.loading.delete"
							class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-red-100">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
								stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="3 6 5 6 21 6" />
								<path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
							</svg>
							{{ roleStore.loading.delete ? 'Deleting…' : 'Delete' }}
						</button>

						<button @click="handleSave" :disabled="roleStore.loading.save"
							class="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-accent text-white hover:bg-accent/85 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
							<svg v-if="!roleStore.loading.save" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4"
								viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
								stroke-linecap="round" stroke-linejoin="round">
								<polyline points="20 6 9 17 4 12" />
							</svg>
							<svg v-else class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none"
								viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
									stroke-width="4" />
								<path class="opacity-75" fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
							</svg>
							{{ roleStore.loading.save ? 'Saving…' : 'Save Changes' }}
						</button>
					</div>
				</div>
			</div>

			<!-- Search Bar -->
			<div v-if="roleStore.selectedRole" class="px-8 py-4 border-b border-heading/10">
				<div class="relative">
					<svg xmlns="http://www.w3.org/2000/svg"
						class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/30" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<circle cx="11" cy="11" r="8" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" />
					</svg>
					<input v-model="searchQuery" type="text" placeholder="Search capabilities…"
						class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-heading/15 bg-panel focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-sm transition-all placeholder:text-text/30" />
					<button v-if="searchQuery" @click="searchQuery = ''"
						class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/40 hover:text-text transition-colors">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
							stroke-width="2.5" stroke-linecap="round">
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</button>
				</div>
			</div>

			<!-- Module Cards Area -->
			<div class="flex-1 overflow-auto px-8 py-6">

				<!-- No role selected -->
				<div v-if="!roleStore.selectedRole" class="flex flex-col items-center justify-center h-64 text-center">
					<div class="w-16 h-16 rounded-2xl bg-heading/5 flex items-center justify-center mb-4">
						<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-heading/20" viewBox="0 0 24 24"
							fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
							stroke-linejoin="round">
							<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
						</svg>
					</div>
					<p class="text-heading/40 font-medium">No role selected</p>
					<p class="text-sm text-text/30 mt-1">Pick a role from the sidebar to manage its permissions</p>
				</div>

				<!-- No results from search -->
				<div v-else-if="moduleList.length === 0 && searchQuery"
					class="flex flex-col items-center justify-center h-48 text-center">
					<p class="text-heading/40 font-medium">No results for "{{ searchQuery }}"</p>
					<button @click="searchQuery = ''" class="text-sm text-accent hover:underline mt-2">
						Clear search
					</button>
				</div>

				<!-- Module Cards -->
				<div v-else class="space-y-3">
					<div v-for="(caps, module) in filteredCapabilities" :key="module"
						class="bg-panel border border-heading/10 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">

						<!-- Module Header -->
						<button type="button"
							class="w-full flex justify-between items-center px-5 py-4 hover:bg-heading/3 transition-colors"
							@click="roleStore.collapsedModules[module] = !roleStore.collapsedModules[module]">
							<div class="flex items-center gap-3">
								<!-- Module icon -->
								<span class="text-lg leading-none">{{ getModuleIcon(module) }}</span>
								<div class="text-left">
									<h3 class="font-semibold capitalize text-heading text-sm">{{ module }}</h3>
									<p class="text-xs text-text/40 mt-0.5">
										{{ moduleSelectedCount(module) }} of {{ roleStore.capabilities[module]?.length
										}}
										permission{{ roleStore.capabilities[module]?.length !== 1 ? 's' : '' }}
									</p>
								</div>
							</div>

							<div class="flex items-center gap-4">
								<!-- Mini progress bar -->
								<div class="flex items-center gap-2">
									<div class="w-20 h-1.5 bg-heading/10 rounded-full overflow-hidden">
										<div class="h-full bg-accent rounded-full transition-all duration-300" :style="{
											width: roleStore.capabilities[module]?.length
												? (moduleSelectedCount(module) / roleStore.capabilities[module].length * 100) + '%'
												: '0%'
										}" />
									</div>
									<span class="text-xs font-medium text-text/40 w-8 text-right">
										{{ roleStore.capabilities[module]?.length ?
											Math.round(moduleSelectedCount(module) / roleStore.capabilities[module].length *
												100) : 0 }}%
									</span>
								</div>

								<!-- Select All toggle -->
								<label @click.stop
									class="flex items-center gap-1.5 text-xs font-medium text-text/50 hover:text-text cursor-pointer select-none"
									:class="{ 'opacity-40 cursor-not-allowed': roleStore.isSuperAdmin }">
									<div class="relative w-8 h-4 rounded-full transition-colors duration-200"
										:class="isModuleFullySelected(module) ? 'bg-accent' : 'bg-heading/15'">
										<div class="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200"
											:class="isModuleFullySelected(module) ? 'translate-x-4' : 'translate-x-0.5'" />
									</div>
									<input type="checkbox" class="sr-only" :disabled="roleStore.isSuperAdmin"
										:checked="isModuleFullySelected(module)" @change="toggleSelectAll(module)" />
									All
								</label>

								<!-- Chevron -->
								<svg xmlns="http://www.w3.org/2000/svg"
									class="w-4 h-4 text-text/30 transition-transform duration-200"
									:class="{ 'rotate-180': !roleStore.collapsedModules[module] }" viewBox="0 0 24 24"
									fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
									stroke-linejoin="round">
									<polyline points="6 9 12 15 18 9" />
								</svg>
							</div>
						</button>

						<!-- Module Body -->
						<div v-show="!roleStore.collapsedModules[module]"
							class="px-5 pb-4 pt-1 grid grid-cols-2 md:grid-cols-3 gap-2 border-t border-heading/5">
							<label v-for="cap in caps" :key="cap.id"
								class="flex items-center gap-2.5 text-sm cursor-pointer px-3 py-2.5 rounded-lg transition-all duration-150 group select-none"
								:class="[
									isPermissionSelected(module, cap.id)
										? 'bg-accent/8 text-heading'
										: 'hover:bg-heading/4 text-text',
									roleStore.isSuperAdmin ? 'cursor-not-allowed opacity-60' : ''
								]">
								<!-- Custom checkbox -->
								<div class="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-150"
									:class="isPermissionSelected(module, cap.id)
										? 'bg-accent border-accent'
										: 'border-heading/20 group-hover:border-accent/40'">
									<svg v-if="isPermissionSelected(module, cap.id)" xmlns="http://www.w3.org/2000/svg"
										class="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none"
										stroke="currentColor" stroke-width="3.5" stroke-linecap="round"
										stroke-linejoin="round">
										<polyline points="20 6 9 17 4 12" />
									</svg>
								</div>
								<input type="checkbox" class="sr-only" :disabled="roleStore.isSuperAdmin"
									:checked="isPermissionSelected(module, cap.id)"
									@change="togglePermission(module, cap.id)" />
								<span class="text-sm leading-snug">{{ cap.label }}</span>
							</label>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- ── DELETE CONFIRM MODAL ──────────────────────────── -->
		<Teleport to="body">
			<Transition name="modal">
				<div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showDeleteConfirm = false" />
					<div class="relative w-full max-w-sm bg-panel rounded-2xl shadow-2xl p-6 border border-heading/10">
						<div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-red-500" viewBox="0 0 24 24"
								fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
								stroke-linejoin="round">
								<polyline points="3 6 5 6 21 6" />
								<path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
							</svg>
						</div>
						<h3 class="text-lg font-bold text-heading text-center mb-1">Delete Role?</h3>
						<p class="text-sm text-text/60 text-center mb-6">
							Are you sure you want to delete
							<strong class="text-heading">{{ roleStore.selectedRole?.label }}</strong>?
							This action cannot be undone.
						</p>
						<div class="flex gap-3">
							<button @click="showDeleteConfirm = false"
								class="flex-1 py-2.5 rounded-lg text-sm font-medium bg-heading/8 hover:bg-heading/12 transition-colors text-text">
								Cancel
							</button>
							<button @click="handleDelete" :disabled="roleStore.loading.delete"
								class="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
								{{ roleStore.loading.delete ? 'Deleting…' : 'Yes, Delete' }}
							</button>
						</div>
					</div>
				</div>
			</Transition>
		</Teleport>

		<!-- ── ADD ROLE MODAL ────────────────────────────────── -->
		<Teleport to="body">
			<Transition name="modal">
				<div v-if="showAddRole" class="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeModal" />

					<div
						class="relative w-full max-w-md bg-panel rounded-2xl shadow-2xl border border-heading/10 overflow-hidden">

						<!-- Modal Header -->
						<div class="px-6 py-5 border-b border-heading/10 flex items-center justify-between">
							<div class="flex items-center gap-3">
								<div class="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
									<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-accent"
										viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
										stroke-linecap="round" stroke-linejoin="round">
										<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
									</svg>
								</div>
								<h2 class="text-lg font-bold text-heading">Create New Role</h2>
							</div>
							<button @click="closeModal"
								class="w-7 h-7 rounded-lg flex items-center justify-center text-text/40 hover:text-text hover:bg-heading/8 transition-all">
								<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
									stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</button>
						</div>

						<!-- Modal Body -->
						<div class="p-6 space-y-5">
							<div>
								<label class="block text-sm font-semibold text-heading mb-1.5">
									Role Display Name <span class="text-red-400">*</span>
								</label>
								<input @input="generateRoleName" v-model="newRoleLabel" type="text"
									placeholder="e.g. Project Manager"
									class="w-full border px-4 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition-all bg-panel"
									:class="roleStore.errors?.label ? 'border-red-400 bg-red-50/30' : 'border-heading/15'" />
								<p v-if="roleStore.errors?.label"
									class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
									<svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24"
										fill="currentColor">
										<path
											d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
									</svg>
									{{ roleStore.errors.label[0] }}
								</p>
							</div>

							<!-- Role slug preview -->
							<div v-if="newRoleName" class="flex items-center gap-2 px-3 py-2 bg-heading/5 rounded-lg">
								<span class="text-xs text-text/40 font-medium">Slug:</span>
								<code class="text-xs font-mono text-accent">{{ newRoleName }}</code>
							</div>
						</div>

						<!-- Modal Footer -->
						<div class="px-6 py-4 border-t border-heading/10 flex justify-end gap-3">
							<button @click="closeModal"
								class="px-5 py-2.5 rounded-lg text-sm font-medium bg-heading/8 hover:bg-heading/12 text-text transition-colors">
								Cancel
							</button>
							<button @click="handleAddRole" :disabled="roleStore.loading.create || !newRoleLabel"
								class="px-6 py-2.5 rounded-lg text-sm font-semibold bg-accent text-white hover:bg-accent/85 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-95">
								{{ roleStore.loading.create ? 'Creating…' : 'Create Role' }}
							</button>
						</div>
					</div>
				</div>
			</Transition>
		</Teleport>

	</div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
	transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
	opacity: 0;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
	transform: translateY(8px) scale(0.97);
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity 0s ease;
}

.fade-enter-from {
	transition: opacity 0.2s ease;
	opacity: 0;
}

.fade-leave-to {
	opacity: 0;
}
</style>