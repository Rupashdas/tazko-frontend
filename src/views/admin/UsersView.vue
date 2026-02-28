<script setup>
import { ref, computed } from 'vue'

/*
|--------------------------------------------------------------------------
| State
|--------------------------------------------------------------------------
*/

const users = ref([
	{ id: 1, name: 'John Doe', email: 'john@mail.com', role: 'Admin', status: 'Active' },
	{ id: 2, name: 'Sara Khan', email: 'sara@mail.com', role: 'Project Manager', status: 'Active' },
	{ id: 3, name: 'Rakib Hasan', email: 'rakib@mail.com', role: 'Member', status: 'Inactive' },
])

const roles = ['Admin', 'Project Manager', 'Member']
const selectedUser = ref(null)

const searchQuery = ref('')
const roleFilter = ref('All')
const statusFilter = ref('All')

const showInviteModal = ref(false)

const newUser = ref({
	name: '',
	email: '',
	role: 'Member',
	status: 'Active'
})

/*
|--------------------------------------------------------------------------
| Computed Filtering
|--------------------------------------------------------------------------
*/

const filteredUsers = computed(() => {
	return users.value.filter(user => {

		const matchesSearch =
			user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
			user.email.toLowerCase().includes(searchQuery.value.toLowerCase())

		const matchesRole =
			roleFilter.value === 'All' || user.role === roleFilter.value

		const matchesStatus =
			statusFilter.value === 'All' || user.status === statusFilter.value

		return matchesSearch && matchesRole && matchesStatus
	})
})

/*
|--------------------------------------------------------------------------
| Actions
|--------------------------------------------------------------------------
*/

const selectUser = (user) => {
	selectedUser.value = { ...user }
}

const inviteUser = () => {
	if (!newUser.value.name || !newUser.value.email) return

	users.value.push({
		id: Date.now(),
		...newUser.value
	})

	showInviteModal.value = false
	newUser.value = { name: '', email: '', role: 'Member', status: 'Active' }
}

const deleteUser = (id) => {
	users.value = users.value.filter(u => u.id !== id)
	selectedUser.value = null
}

const toggleStatus = (user) => {
	user.status = user.status === 'Active' ? 'Inactive' : 'Active'
}
</script>

<template>
	<div class="flex h-screen bg-[var(--color-body)] font-sans text-[var(--color-text)]">

		<!-- MAIN -->
		<div class="flex-1 p-8 overflow-auto">

			<!-- HEADER -->
			<div class="flex justify-between items-center mb-8">
				<div>
					<h1 class="text-3xl font-semibold text-[var(--color-heading)]">
						Users
					</h1>
					<p class="text-sm text-gray-500">
						Manage system users and permissions
					</p>
				</div>

				<button @click="showInviteModal = true"
					class="bg-[var(--color-accent)] text-white px-6 py-2.5 rounded-xl shadow-sm hover:opacity-90 transition">
					+ Invite User
				</button>
			</div>

			<!-- FILTERS -->
			<div class="flex gap-4 mb-6">
				<input v-model="searchQuery" type="text" placeholder="Search users..."
					class="flex-1 px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[var(--color-accent)] outline-none" />

				<select v-model="roleFilter" class="px-4 py-2.5 border rounded-xl">
					<option value="All">All Roles</option>
					<option v-for="r in roles" :key="r">{{ r }}</option>
				</select>

				<select v-model="statusFilter" class="px-4 py-2.5 border rounded-xl">
					<option value="All">All Status</option>
					<option>Active</option>
					<option>Inactive</option>
				</select>
			</div>

			<!-- TABLE -->
			<div class="bg-white rounded-2xl shadow-sm overflow-hidden">
				<table class="w-full text-left">
					<thead class="bg-[var(--color-panel)] text-sm">
						<tr>
							<th class="p-5">User</th>
							<th class="p-5">Role</th>
							<th class="p-5">Status</th>
							<th class="p-5 text-right">Actions</th>
						</tr>
					</thead>

					<tbody>
						<tr v-for="user in filteredUsers" :key="user.id" class="border-t hover:bg-gray-50 transition">
							<td class="p-5">
								<div class="flex items-center gap-4">
									<div
										class="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-accent)]/20 text-sm font-semibold">
										{{ user.name.charAt(0) }}
									</div>
									<div>
										<div class="font-medium">{{ user.name }}</div>
										<div class="text-sm text-gray-500">{{ user.email }}</div>
									</div>
								</div>
							</td>

							<td class="p-5">
								<span class="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-600">
									{{ user.role }}
								</span>
							</td>

							<td class="p-5">
								<span class="px-3 py-1 rounded-full text-sm" :class="user.status === 'Active'
									? 'bg-green-100 text-green-600'
									: 'bg-gray-200 text-gray-600'">
									{{ user.status }}
								</span>
							</td>

							<td class="p-5 text-right space-x-2">
								<button @click="selectUser(user)"
									class="text-sm px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200">
									View
								</button>

								<button @click="deleteUser(user.id)"
									class="text-sm px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
									Delete
								</button>
							</td>
						</tr>

						<tr v-if="filteredUsers.length === 0">
							<td colspan="4" class="text-center p-8 text-gray-400">
								No users found
							</td>
						</tr>

					</tbody>
				</table>
			</div>
		</div>


		<!-- RIGHT DRAWER -->
		<div v-if="selectedUser" class="w-96 bg-white border-l shadow-xl p-8 transition-all">

			<div class="flex justify-between items-center mb-6">
				<h3 class="text-xl font-semibold">
					{{ selectedUser.name }}
				</h3>
				<button @click="selectedUser = null">✕</button>
			</div>

			<div class="space-y-4">

				<select v-model="selectedUser.role" class="w-full border px-4 py-2 rounded-xl">
					<option v-for="r in roles" :key="r">{{ r }}</option>
				</select>

				<button @click="toggleStatus(selectedUser)"
					class="w-full py-2 rounded-xl bg-gray-100 hover:bg-gray-200">
					Toggle Status
				</button>

				<button class="w-full py-2 rounded-xl bg-gray-100 hover:bg-gray-200">
					Reset Password
				</button>

				<button @click="deleteUser(selectedUser.id)"
					class="w-full py-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200">
					Delete User
				</button>

			</div>
		</div>


		<!-- INVITE MODAL -->
		<Teleport to="body">
			<div v-if="showInviteModal"
				class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

				<div class="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">

					<h2 class="text-xl font-semibold mb-6">Invite User</h2>

					<div class="space-y-4">
						<input v-model="newUser.name" placeholder="Full Name"
							class="w-full border px-4 py-2 rounded-xl" />

						<input v-model="newUser.email" placeholder="Email" class="w-full border px-4 py-2 rounded-xl" />

						<select v-model="newUser.role" class="w-full border px-4 py-2 rounded-xl">
							<option v-for="r in roles" :key="r">{{ r }}</option>
						</select>
					</div>

					<div class="flex justify-end gap-3 mt-6">
						<button @click="showInviteModal = false" class="px-4 py-2 bg-gray-100 rounded-xl">
							Cancel
						</button>
						<button @click="inviteUser" class="px-6 py-2 bg-[var(--color-accent)] text-white rounded-xl">
							Invite
						</button>
					</div>

				</div>
			</div>
		</Teleport>

	</div>
</template>