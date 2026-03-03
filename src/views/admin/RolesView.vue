<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoleStore } from '@/stores/useRoleStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useRolePermissions } from '@/composables/useRolePermissions'
import { useToast } from '@/utils/toast'

const roleStore = useRoleStore()
const authStore = useAuthStore()
const { successToast, errorToast } = useToast()
const {
	togglePermission,
	toggleSelectAll,
	isPermissionSelected,
	isModuleFullySelected,
	moduleSelectedCount,
} = useRolePermissions()

// ── Capability flags ─────────────────────────────────────────────
const canCreate = computed(() => authStore.hasCapability('roles.create'))
const canUpdate = computed(() => authStore.hasCapability('roles.update'))
const canDelete = computed(() => authStore.hasCapability('roles.delete'))

const searchQuery = ref('')
const showAddRole = ref(false)
const newRoleName = ref('')
const newRoleLabel = ref('')
const showDeleteConfirm = ref(false)

// Mobile sidebar drawer
const mobileSidebarOpen = ref(false)

const filteredCapabilities = computed(() => roleStore.filteredCapabilities(searchQuery.value))
const totalPermissions = computed(() => Object.values(roleStore.capabilities || {}).reduce((sum, caps) => sum + caps.length, 0))
const selectedPermissionsCount = computed(() => Object.values(roleStore.selectedPermissions || {}).reduce((sum, list) => sum + list.length, 0))
const coveragePercent = computed(() => totalPermissions.value ? Math.round((selectedPermissionsCount.value / totalPermissions.value) * 100) : 0)
const moduleList = computed(() => Object.keys(filteredCapabilities.value || {}))

onMounted(() => roleStore.init())

function toastErrors(messages) {
	if (!messages?.length) { errorToast('Something went wrong.'); return }
	messages.forEach(msg => errorToast(msg))
}

async function handleSave() {
	const result = await roleStore.saveChanges()
	result.success ? successToast('Changes saved!') : toastErrors(result.messages)
}

async function handleDelete() {
	const result = await roleStore.deleteRole()
	if (result.success) {
		showDeleteConfirm.value = false
	} else {
		toastErrors(result.messages)
	}
}

const generateRoleName = () => {
	newRoleName.value = newRoleLabel.value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
}

async function handleAddRole() {
	const result = await roleStore.createRole({ name: newRoleName.value, label: newRoleLabel.value })
	if (result.success) {
		successToast('Role created successfully!')
		closeModal()
	} else {
		toastErrors(result.messages)
	}
}

function closeModal() {
	showAddRole.value = false
	newRoleName.value = ''
	newRoleLabel.value = ''
}

function selectRoleAndClose(role) {
	roleStore.selectRole(role)
	mobileSidebarOpen.value = false
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
	<!-- Outer wrapper: fixed height on desktop so the two panels can each scroll independently -->
	<div class="flex flex-col bg-body text-text relative h-full min-h-[600px]">

		<!-- PAGE LOADING OVERLAY -->
		<Transition name="fade">
			<div v-if="roleStore.isPageLoading"
				class="absolute inset-0 bg-panel/80 backdrop-blur-sm flex flex-col items-center justify-center z-40 rounded-xl gap-3">
				<div class="w-10 h-10 rounded-full border-3 border-accent border-t-transparent animate-spin" />
				<p class="text-sm text-text/60 font-medium">Loading roles…</p>
			</div>
		</Transition>

		<!-- ── MOBILE TOP BAR ──────────────────────────────────── -->
		<div class="flex lg:hidden items-center gap-3 px-4 py-3 border-b border-heading/10 bg-panel shrink-0">
			<!-- Hamburger / selected role -->
			<button @click="mobileSidebarOpen = true"
				class="flex items-center gap-2 px-3 py-2 rounded-lg bg-heading/6 hover:bg-heading/10 transition-colors text-sm font-medium text-heading">
				<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none"
					stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="3" y1="12" x2="21" y2="12" />
					<line x1="3" y1="6" x2="21" y2="6" />
					<line x1="3" y1="18" x2="21" y2="18" />
				</svg>
				<span class="truncate max-w-[140px]">{{ roleStore.selectedRole?.label || 'Select role' }}</span>
			</button>

			<div class="flex-1" />

			<!-- Mobile action buttons -->
			<template v-if="roleStore.selectedRole">
				<button v-if="canDelete && !roleStore.selectedRole.is_system_role" @click="showDeleteConfirm = true"
					class="p-2 rounded-lg text-red-400 hover:bg-red-50 border border-red-100 transition-all">
					<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
						stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="3 6 5 6 21 6" />
						<path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
					</svg>
				</button>
				<button v-if="canUpdate" @click="handleSave"
					:disabled="roleStore.loading.save || roleStore.isSuperAdmin"
					class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-accent text-white hover:bg-accent/85 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
					<div v-if="roleStore.loading.save"
						class="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
					<svg v-else xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
						stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
						<polyline points="17 21 17 13 7 13 7 21" />
						<polyline points="7 3 7 8 15 8" />
					</svg>
					{{ roleStore.loading.save ? 'Saving…' : 'Save' }}
				</button>
			</template>
		</div>

		<!-- ── BODY: SIDEBAR + MAIN (desktop side-by-side, full height) ── -->
		<div class="flex flex-1 overflow-hidden">

			<!-- ── SIDEBAR (desktop: always visible & self-scrolling) ───── -->
			<aside class="hidden lg:flex w-64 border-r border-heading/10 bg-panel flex-col shrink-0 overflow-hidden">

				<!-- Sidebar Header -->
				<div class="px-5 pt-5 pb-4 border-b border-heading/10 shrink-0">
					<div class="flex justify-between items-center">
						<div>
							<p class="text-xs font-semibold uppercase tracking-widest text-text/40 mb-1">System</p>
							<h2 class="text-lg font-bold text-heading leading-tight">Roles</h2>
						</div>
						<button v-if="canCreate" @click="showAddRole = true"
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

				<!-- Role List — this part scrolls independently -->
				<ul class="flex-1 overflow-y-auto py-3 px-3 space-y-1">
					<li v-for="role in roleStore.roles" :key="role.id">
						<button @click="roleStore.selectRole(role)"
							class="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 flex items-center gap-3 group"
							:class="roleStore.selectedRole?.id === role.id
								? 'bg-accent/15 text-heading'
								: 'hover:bg-heading/5 text-text'">
							<span
								class="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 transition-colors"
								:class="roleStore.selectedRole?.id === role.id
									? 'bg-accent text-white'
									: 'bg-heading/10 text-heading group-hover:bg-accent/20'">
								{{ getRoleInitial(role.label) }}
							</span>
							<span class="text-sm font-medium truncate">{{ role.label }}</span>
							<span v-if="roleStore.selectedRole?.id === role.id"
								class="ml-auto w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
						</button>
					</li>

					<li v-if="!roleStore.roles?.length" class="px-3 py-8 text-center">
						<p class="text-sm text-text/40">No roles yet</p>
						<button v-if="canCreate" @click="showAddRole = true"
							class="mt-2 text-xs text-accent hover:underline">
							Create one →
						</button>
					</li>
				</ul>

				<!-- Sidebar Footer -->
				<div class="px-5 py-4 border-t border-heading/10 shrink-0">
					<p class="text-xs text-text/40">
						{{ roleStore.roles?.length || 0 }} role{{ roleStore.roles?.length !== 1 ? 's' : '' }} total
					</p>
				</div>
			</aside>

			<!-- ── MAIN PANEL (scrolls independently) ───────────────────── -->
			<div class="flex-1 flex flex-col overflow-hidden">

				<!-- Panel Header — sticky, never scrolls away -->
				<div
					class="px-4 sm:px-8 pt-5 pb-4 border-b border-heading/10 flex items-start justify-between gap-4 shrink-0 bg-body">
					<div class="min-w-0">
						<h1 class="text-lg sm:text-xl font-bold text-heading truncate">
							{{ roleStore.selectedRole?.label || 'Select a Role' }}
						</h1>
						<p v-if="roleStore.selectedRole" class="text-sm text-text/50 mt-0.5 font-mono truncate">
							{{ roleStore.selectedRole.name }}
						</p>
					</div>

					<!-- Desktop Stats + Actions -->
					<div v-if="roleStore.selectedRole" class="hidden lg:flex items-center gap-3 shrink-0">
						<!-- Coverage pill -->
						<div class="flex items-center gap-2 px-3 py-1.5 bg-heading/5 rounded-full">
							<div class="w-2 h-2 rounded-full"
								:class="coveragePercent > 66 ? 'bg-emerald-400' : coveragePercent > 33 ? 'bg-yellow-400' : 'bg-red-400'" />
							<span class="text-xs font-semibold text-text/60">
								{{ selectedPermissionsCount }}/{{ totalPermissions }} ({{ coveragePercent }}%)
							</span>
						</div>

						<button v-if="canDelete && !roleStore.selectedRole.is_system_role"
							@click="showDeleteConfirm = true"
							class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-50 hover:text-red-500 transition-all border border-red-100">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
								stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="3 6 5 6 21 6" />
								<path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
							</svg>
							Delete
						</button>

						<button v-if="canUpdate" @click="handleSave"
							:disabled="roleStore.loading.save || roleStore.isSuperAdmin"
							class="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-accent text-white hover:bg-accent/85 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-95">
							<svg v-if="!roleStore.loading.save" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5"
								viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
								stroke-linecap="round" stroke-linejoin="round">
								<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
								<polyline points="17 21 17 13 7 13 7 21" />
								<polyline points="7 3 7 8 15 8" />
							</svg>
							<div v-else
								class="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
							{{ roleStore.loading.save ? 'Saving…' : 'Save Changes' }}
						</button>
					</div>
				</div>

				<!-- Mobile coverage pill -->
				<div v-if="roleStore.selectedRole"
					class="flex lg:hidden items-center gap-2 px-4 py-2 border-b border-heading/6 shrink-0">
					<div class="w-2 h-2 rounded-full shrink-0"
						:class="coveragePercent > 66 ? 'bg-emerald-400' : coveragePercent > 33 ? 'bg-yellow-400' : 'bg-red-400'" />
					<span class="text-xs text-text/50 font-medium">
						{{ selectedPermissionsCount }} of {{ totalPermissions }} permissions ({{ coveragePercent }}%)
					</span>
				</div>

				<!-- Search bar -->
				<div v-if="roleStore.selectedRole" class="px-4 sm:px-8 py-3 border-b border-heading/6 shrink-0 bg-body">
					<div class="relative">
						<svg xmlns="http://www.w3.org/2000/svg"
							class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text/30 pointer-events-none"
							viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
							stroke-linecap="round" stroke-linejoin="round">
							<circle cx="11" cy="11" r="8" />
							<line x1="21" y1="21" x2="16.65" y2="16.65" />
						</svg>
						<input v-model="searchQuery" type="text" placeholder="Search permissions…"
							class="w-full pl-9 pr-4 py-2 text-sm bg-heading/5 border border-transparent focus:border-accent/30 focus:bg-panel rounded-lg outline-none transition-all" />
					</div>
				</div>

				<!-- Super-admin notice -->
				<div v-if="roleStore.isSuperAdmin"
					class="mx-4 sm:mx-8 mt-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 shrink-0">
					<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-amber-500 shrink-0" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
						<line x1="12" y1="9" x2="12" y2="13" />
						<line x1="12" y1="17" x2="12.01" y2="17" />
					</svg>
					<p class="text-xs text-amber-700 font-medium">
						Super-admin has all permissions by default. Changes cannot be made to this role.
					</p>
				</div>

				<!-- ── MODULE CARDS — this is the ONLY scrolling region ── -->
				<div class="flex-1 overflow-y-auto px-4 sm:px-8 py-6">

					<!-- No role selected -->
					<div v-if="!roleStore.selectedRole"
						class="flex flex-col items-center justify-center h-64 text-center">
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
								class="w-full flex justify-between items-center px-4 sm:px-5 py-4 hover:bg-heading/3 transition-colors"
								@click="roleStore.collapsedModules[module] = !roleStore.collapsedModules[module]">
								<div class="flex items-center gap-3 min-w-0">
									<span class="text-lg leading-none shrink-0">{{ getModuleIcon(module) }}</span>
									<div class="text-left min-w-0 flex w-full items-center gap-2">
										<h3 class="font-semibold capitalize text-heading text-sm">{{ module }}</h3>
										<p class="text-xs text-text/80 mt-0.5">(
											{{ moduleSelectedCount(module) }} of {{
												roleStore.capabilities[module]?.length }}
											permission{{ roleStore.capabilities[module]?.length !== 1 ? 's' : '' }} )
										</p>
									</div>
								</div>

								<div class="flex items-center gap-2 sm:gap-4 shrink-0 ml-2">
									<!-- Mini progress bar (hidden on very small screens) -->
									<div class="hidden sm:flex items-center gap-2">
										<div class="w-16 sm:w-20 h-1.5 bg-heading/10 rounded-full overflow-hidden">
											<div class="h-full bg-accent rounded-full transition-all duration-300"
												:style="{
													width: roleStore.capabilities[module]?.length
														? (moduleSelectedCount(module) / roleStore.capabilities[module].length * 100) + '%'
														: '0%'
												}" />
										</div>
									</div>

									<!-- Select All toggle -->
									<label v-if="canUpdate" class="flex items-center gap-1.5 cursor-pointer"
										@click.stop>
										<input type="checkbox" class="sr-only" :disabled="roleStore.isSuperAdmin"
											:checked="isModuleFullySelected(module)"
											@change="toggleSelectAll(module)" />
										<div class="w-4 h-4 rounded border-2 flex items-center justify-center transition-all"
											:class="isModuleFullySelected(module) ? 'bg-accent border-accent' : 'border-heading/25'">
											<svg v-if="isModuleFullySelected(module)" xmlns="http://www.w3.org/2000/svg"
												class="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none"
												stroke="currentColor" stroke-width="3.5" stroke-linecap="round"
												stroke-linejoin="round">
												<polyline points="20 6 9 17 4 12" />
											</svg>
										</div>
										<span class="text-xs text-text/50 font-medium">All</span>
									</label>

									<!-- Collapse chevron -->
									<svg xmlns="http://www.w3.org/2000/svg"
										class="w-4 h-4 text-text/30 transition-transform duration-200"
										:class="roleStore.collapsedModules[module] ? '-rotate-90' : ''"
										viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
										stroke-linecap="round" stroke-linejoin="round">
										<polyline points="6 9 12 15 18 9" />
									</svg>
								</div>
							</button>

							<!-- Capabilities Grid -->
							<div v-show="!roleStore.collapsedModules[module]"
								class="px-4 sm:px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-heading/6">
								<label v-for="cap in caps" :key="cap.id"
									class="flex items-center gap-3 py-2 px-3 rounded-lg transition-colors group" :class="[
										isPermissionSelected(module, cap.id) ? 'bg-accent/8 text-heading' : 'text-text',
										(roleStore.isSuperAdmin || !canUpdate) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-heading/4'
									]">
									<div class="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-150"
										:class="isPermissionSelected(module, cap.id)
											? 'bg-accent border-accent'
											: 'border-heading/20 group-hover:border-accent/40'">
										<svg v-if="isPermissionSelected(module, cap.id)"
											xmlns="http://www.w3.org/2000/svg" class="w-2.5 h-2.5 text-white"
											viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"
											stroke-linecap="round" stroke-linejoin="round">
											<polyline points="20 6 9 17 4 12" />
										</svg>
									</div>
									<input type="checkbox" class="sr-only"
										:disabled="roleStore.isSuperAdmin || !canUpdate"
										:checked="isPermissionSelected(module, cap.id)"
										@change="togglePermission(module, cap.id)" />
									<span class="text-sm leading-snug">{{ cap.label }}</span>
								</label>
							</div>
						</div>
					</div>
				</div>
				<!-- END scrollable region -->
			</div>
		</div>
		<!-- END body -->


		<!-- ── MOBILE SIDEBAR DRAWER ────────────────────────────── -->
		<Teleport to="body">
			<Transition name="fade">
				<div v-if="mobileSidebarOpen" class="fixed inset-0 z-50 lg:hidden flex">
					<!-- Backdrop -->
					<div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="mobileSidebarOpen = false" />

					<!-- Drawer panel -->
					<Transition name="slide-left">
						<div v-if="mobileSidebarOpen"
							class="relative w-72 max-w-[85vw] bg-panel h-full flex flex-col shadow-2xl">

							<!-- Drawer Header -->
							<div
								class="px-5 pt-5 pb-4 border-b border-heading/10 flex items-center justify-between shrink-0">
								<div>
									<p class="text-xs font-semibold uppercase tracking-widest text-text/40 mb-1">System
									</p>
									<h2 class="text-lg font-bold text-heading">Roles</h2>
								</div>
								<div class="flex items-center gap-2">
									<button v-if="canCreate" @click="showAddRole = true; mobileSidebarOpen = false"
										class="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center hover:bg-accent/80 transition-all active:scale-95"
										title="Add new role">
										<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24"
											fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
											stroke-linejoin="round">
											<line x1="12" y1="5" x2="12" y2="19" />
											<line x1="5" y1="12" x2="19" y2="12" />
										</svg>
									</button>
									<button @click="mobileSidebarOpen = false"
										class="w-8 h-8 rounded-lg flex items-center justify-center text-text/40 hover:text-text hover:bg-heading/8 transition-all">
										<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24"
											fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
											<line x1="18" y1="6" x2="6" y2="18" />
											<line x1="6" y1="6" x2="18" y2="18" />
										</svg>
									</button>
								</div>
							</div>

							<!-- Role List -->
							<ul class="flex-1 overflow-y-auto py-3 px-3 space-y-1">
								<li v-for="role in roleStore.roles" :key="role.id">
									<button @click="selectRoleAndClose(role)"
										class="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 flex items-center gap-3 group"
										:class="roleStore.selectedRole?.id === role.id
											? 'bg-accent/15 text-heading'
											: 'hover:bg-heading/5 text-text'">
										<span
											class="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
											:class="roleStore.selectedRole?.id === role.id
												? 'bg-accent text-white'
												: 'bg-heading/10 text-heading group-hover:bg-accent/20'">
											{{ getRoleInitial(role.label) }}
										</span>
										<span class="text-sm font-medium truncate">{{ role.label }}</span>
										<span v-if="roleStore.selectedRole?.id === role.id"
											class="ml-auto w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
									</button>
								</li>

								<li v-if="!roleStore.roles?.length" class="px-3 py-8 text-center">
									<p class="text-sm text-text/40">No roles yet</p>
									<button v-if="canCreate" @click="showAddRole = true; mobileSidebarOpen = false"
										class="mt-2 text-xs text-accent hover:underline">
										Create one →
									</button>
								</li>
							</ul>

							<!-- Drawer Footer -->
							<div class="px-5 py-4 border-t border-heading/10 shrink-0">
								<p class="text-xs text-text/40">
									{{ roleStore.roles?.length || 0 }} role{{ roleStore.roles?.length !== 1 ? 's' : ''
									}} total
								</p>
							</div>
						</div>
					</Transition>
				</div>
			</Transition>
		</Teleport>


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
				<div v-if="showAddRole && canCreate" class="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeModal" />
					<div
						class="relative w-full max-w-md bg-panel rounded-2xl shadow-2xl border border-heading/10 overflow-hidden transition-all">

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
							<div v-if="newRoleName" class="flex items-center gap-2 px-3 py-2 bg-heading/5 rounded-lg">
								<span class="text-xs text-text/40 font-medium">Slug:</span>
								<code class="text-xs font-mono text-accent">{{ newRoleName }}</code>
							</div>
						</div>

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
/* Modal transitions */
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
	transform: scale(0.97);
}

/* Fade */
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

/* Mobile drawer slide-in from left */
.slide-left-enter-active,
.slide-left-leave-active {
	transition: transform 0.25s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
	transform: translateX(-100%);
}
</style>