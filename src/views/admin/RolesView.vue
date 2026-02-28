<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import axios from '@/axios'
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()

const can = (permission) => {
	return authStore.hasCapability(permission)
}
/*-----------------------
| STATE
------------------------*/
const errors = ref({})
const roles = reactive([])
const capabilities = reactive({})
const selectedRole = ref(null)
const selectedPermissions = reactive({})
const collapsedModules = reactive({})
const searchQuery = ref('')
const showAddRole = ref(false)
const newRoleName = ref('')
const newRoleLabel = ref('')
const loading = reactive({
	page: false,
	roles: false,
	capabilities: false,
	save: false,
	delete: false,
	create: false
})
/*-----------------------
| FETCH DATA
------------------------*/
const fetchRoles = async () => {
	loading.roles = true
	try {
		const { data } = await axios.get('/api/roles')
		roles.length = 0
		roles.push(...data)

		if (roles.length) selectRole(roles[0])
	} catch (err) {
		console.error(err)
	} finally {
		loading.roles = false
	}
}

const fetchCapabilities = async () => {
	loading.capabilities = true
	try {
		const { data } = await axios.get('/api/capabilities')
		Object.assign(capabilities, data)

		Object.keys(capabilities).forEach(module => {
			collapsedModules[module] = false
			if (!selectedPermissions[module])
				selectedPermissions[module] = []
		})
	} catch (err) {
		console.error(err)
	} finally {
		loading.capabilities = false
	}
}
const isPageLoading = computed(() => {
	return loading.roles || loading.capabilities
})
onMounted(() => {
	fetchCapabilities()
	fetchRoles()
})

/*-----------------------
| ROLE SELECT
------------------------*/
const selectRole = (role) => {
	selectedRole.value = role

	// Reset selectedPermissions
	Object.keys(capabilities).forEach(module => {
		if (!selectedPermissions[module]) selectedPermissions[module] = []
		else selectedPermissions[module].length = 0
	})

	// Populate selectedPermissions using IDs
	role.capabilities.forEach(roleCap => {
		// Find the module this capability belongs to
		const moduleEntry = Object.entries(capabilities).find(([module, caps]) =>
			caps.some(c => c.id === roleCap.id)
		)
		if (moduleEntry) {
			const [module] = moduleEntry
			selectedPermissions[module].push(roleCap.id)
		}
	})
}

/*-----------------------
| TOGGLE PERMISSIONS
------------------------*/
const togglePermission = (module, capId) => {
	const idx = selectedPermissions[module].indexOf(capId)
	if (idx > -1) selectedPermissions[module].splice(idx, 1)
	else selectedPermissions[module].push(capId)
}

const toggleSelectAll = (module) => {
	const allCaps = capabilities[module].map(c => c.id)
	if (selectedPermissions[module].length === allCaps.length) {
		selectedPermissions[module] = []
	} else {
		selectedPermissions[module] = [...allCaps]
	}
}

/*-----------------------
| FILTERED CAPABILITIES
------------------------*/
const filteredCapabilities = computed(() => {
	if (!searchQuery.value) return capabilities

	const result = {}
	Object.entries(capabilities).forEach(([module, caps]) => {
		const filtered = caps.filter(c =>
			c.label.toLowerCase().includes(searchQuery.value.toLowerCase())
		)
		if (filtered.length) result[module] = filtered
	})
	return result
})

/*-----------------------
| ADD ROLE
------------------------*/
const addRole = async () => {
	errors.value = {}

	try {
		const res = await axios.post('/api/roles', {
			name: newRoleName.value,
			label: newRoleLabel.value,
			capabilities: []
		})

		roles.push(res.data)
		selectRole(res.data)
		closeModal()

	} catch (err) {
		if (err.response?.status === 422) {
			errors.value = err.response.data.errors
		}
	}
}


const isSuperAdmin = computed(() => {
	return selectedRole.value?.name === 'super-admin'
})
/*-----------------------
| DELETE ROLE
------------------------*/
const deleteRole = async () => {
	if (!selectedRole.value) return
	try {
		await axios.delete(`/api/roles/${selectedRole.value.id}`)
		const idx = roles.findIndex(r => r.id === selectedRole.value.id)
		roles.splice(idx, 1)
		if (roles.length) selectRole(roles[0])
		else selectedRole.value = null
	} catch (err) {
		console.error(err)
	}
}

/*-----------------------
| SAVE CHANGES
------------------------*/
const saveChanges = async () => {
	if (!selectedRole.value) return
	try {
		await axios.put(`/api/roles/${selectedRole.value.id}`, {
			name: selectedRole.value.name,
			label: selectedRole.value.label,
			capabilities: Object.values(selectedPermissions).flat()
		})
		alert('Changes saved!')
	} catch (err) {
		console.error(err)
	}
}

/*-----------------------
| MODAL
------------------------*/
const closeModal = () => {
	showAddRole.value = false
	newRoleName.value = ''
	newRoleLabel.value = ''
}
</script>

<template>
	<div class="flex h-screen bg-body font-sans text-text relative">
		<div v-if="isPageLoading"
			class="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-40">
			<div class="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
		</div>
		<!-- SIDEBAR -->
		<div class="w-72 border-r bg-white p-6 flex flex-col">
			<div class="flex justify-between items-center mb-6">
				<h2 class="text-xl font-semibold text-heading">Roles</h2>
				<button @click="showAddRole = true"
					class="text-sm bg-accent text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition">
					+ Add
				</button>
			</div>

			<!-- ROLE LIST -->
			<ul class="space-y-2 flex-1 overflow-auto">
				<li v-for="role in roles" :key="role.id">
					<button @click="selectRole(role)" class="w-full text-left px-4 py-2.5 rounded-lg transition text-sm"
						:class="selectedRole?.id === role.id
							? 'bg-accent/10 text-heading font-semibold'
							: 'hover:bg-gray-100'">
						{{ role.label }}
					</button>
				</li>
			</ul>
		</div>

		<!-- MAIN CONTENT -->
		<div class="flex-1 p-10 overflow-auto">

			<!-- HEADER -->
			<div class="flex justify-between items-start mb-8">
				<div>
					<h1 class="text-3xl font-semibold text-heading">{{ selectedRole?.label || 'Select Role' }}</h1>
					<p class="text-sm mt-1 text-gray-500">Manage permissions assigned to this role</p>
				</div>

				<div class="flex gap-3">
					<button @click="deleteRole" :disabled="isSuperAdmin"
						class="bg-red-500 text-white px-5 py-2 rounded-lg text-sm hover:bg-red-600 transition">
						Delete Role
					</button>
					<button @click="saveChanges"
						class="bg-green-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-green-700 transition">
						Save Changes
					</button>
				</div>
			</div>

			<!-- SEARCH -->
			<div class="mb-8 max-w-md">
				<input v-model="searchQuery" type="text" placeholder="Search capabilities..."
					class="w-full border px-4 py-2.5 rounded-lg shadow-sm focus:ring-2 focus:ring-accent outline-none" />
			</div>

			<!-- MODULE CARDS -->
			<div v-for="(caps, module) in filteredCapabilities" :key="module"
				class="mb-6 bg-white border rounded-2xl shadow-sm overflow-hidden">

				<!-- Module Header -->
				<div class="flex justify-between items-center px-6 py-4 bg-panel cursor-pointer"
					@click="collapsedModules[module] = !collapsedModules[module]">
					<div class="flex items-center gap-4">
						<h3 class="font-semibold capitalize text-heading">{{ module }}</h3>
						<span class="text-xs bg-gray-200 px-2 py-1 rounded-full">
							{{ selectedPermissions[module]?.length || 0 }} / {{ capabilities[module].length }}
						</span>
					</div>

					<div class="flex items-center gap-6 text-sm">
						<label @click.stop class="flex items-center gap-2 cursor-pointer">
							<input type="checkbox" :disabled="isSuperAdmin"
								:checked="selectedPermissions[module]?.length === capabilities[module]?.length"
								@change="toggleSelectAll(module)" />
							Select All
						</label>
						<span class="text-lg">{{ collapsedModules[module] ? '+' : '-' }}</span>
					</div>
				</div>

				<!-- MODULE BODY -->
				<div v-show="!collapsedModules[module]" class="px-6 py-5 grid grid-cols-2 gap-4">
					<label v-for="cap in caps" :key="cap.id"
						class="flex items-center gap-3 text-sm cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition">
						<input type="checkbox" :disabled="isSuperAdmin"
							:checked="selectedPermissions[module]?.includes(cap.id)"
							@change="togglePermission(module, cap.id)" />
						<span>{{ cap.label }}</span>
					</label>
				</div>

			</div>
		</div>

		<!-- ADD ROLE MODAL -->
		<Teleport to="body">
			<Transition enter-active-class="transition duration-300 ease-out"
				leave-active-class="transition duration-200 ease-in" enter-from-class="opacity-0 scale-105"
				enter-to-class="opacity-100 scale-100" leave-from-class="opacity-100 scale-100"
				leave-to-class="opacity-0 scale-105">
				<div v-if="showAddRole" class="fixed inset-0 z-50 flex items-center justify-center">

					<!-- Overlay -->
					<div class="absolute inset-0 bg-accent/10" @click="closeModal"></div>

					<!-- Modal Panel -->
					<div class="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">

						<!-- Header -->
						<div class="flex justify-between items-center mb-6">
							<h2 class="text-xl font-semibold text-heading">Create New Role</h2>
							<button @click="closeModal"
								class="text-gray-400 hover:text-gray-600 transition text-lg">×</button>
						</div>

						<!-- Body -->
						<div class="space-y-4">
							<div>
								<label class="text-sm font-medium text-gray-600">Role Name</label>
								<input v-model="newRoleLabel" type="text" placeholder="e.g Project Manager"
									class="w-full mt-1 border px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-accent outline-none" />
							</div>

							<div>
								<label class="text-sm font-medium text-gray-600">Role Slug</label>
								<input v-model="newRoleName" type="text" placeholder="e.g project_manager"
									class="w-full mt-1 border px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-accent outline-none" />
							</div>
						</div>

						<!-- Footer -->
						<div class="flex justify-end gap-3 mt-8">
							<button @click="closeModal"
								class="px-5 py-2.5 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 transition">
								Cancel
							</button>
							<button @click="addRole"
								class="px-6 py-2.5 rounded-lg text-sm bg-accent text-white hover:opacity-90 transition shadow-sm">
								Create Role
							</button>
						</div>

					</div>
				</div>
			</Transition>
		</Teleport>

	</div>
</template>