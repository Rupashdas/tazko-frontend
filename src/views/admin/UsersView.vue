<script setup>
import { ref, computed } from 'vue'

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

const newUser = ref({ name: '', email: '', role: 'Member', status: 'Active' })

/* ── Filtering ── */
const filteredUsers = computed(() =>
	users.value.filter(u => {
		const q = searchQuery.value.toLowerCase()
		const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
		const matchRole = roleFilter.value === 'All' || u.role === roleFilter.value
		const matchStatus = statusFilter.value === 'All' || u.status === statusFilter.value
		return matchSearch && matchRole && matchStatus
	})
)

const totalActive = computed(() => users.value.filter(u => u.status === 'Active').length)
const totalInactive = computed(() => users.value.filter(u => u.status === 'Inactive').length)

/* ── Actions ── */
const selectUser = (user) => { selectedUser.value = { ...user } }

const inviteUser = () => {
	if (!newUser.value.name || !newUser.value.email) return
	users.value.push({ id: Date.now(), ...newUser.value })
	showInviteModal.value = false
	newUser.value = { name: '', email: '', role: 'Member', status: 'Active' }
}

const saveUser = () => {
	const idx = users.value.findIndex(u => u.id === selectedUser.value.id)
	if (idx !== -1) users.value[idx] = { ...selectedUser.value }
}

const deleteUser = (id) => {
	users.value = users.value.filter(u => u.id !== id)
	if (selectedUser.value?.id === id) selectedUser.value = null
}

const toggleStatus = (user) => {
	user.status = user.status === 'Active' ? 'Inactive' : 'Active'
}

const getInitials = (name) =>
	name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

const avatarColors = [
	'bg-blue-100 text-blue-600',
	'bg-violet-100 text-violet-600',
	'bg-emerald-100 text-emerald-600',
	'bg-amber-100 text-amber-600',
	'bg-rose-100 text-rose-600',
]
const getAvatarColor = (id) => avatarColors[id % avatarColors.length]
</script>

<template>
	<div class="flex bg-body text-text relative min-h-[600px]">

		<!-- ── MAIN ─────────────────────────────────────────── -->
		<div
			class="flex-1 min-w-0 flex flex-col overflow-hidden bg-panel border border-heading/8 rounded-2xl shadow-sm">

			<!-- Top Bar -->
			<div class="px-8 py-5 border-b border-heading/8">
				<div class="flex justify-between items-center">
					<div>
						<div class="flex items-center gap-3 mb-0.5">
							<h1 class="text-2xl font-bold text-heading leading-tight">Users</h1>
							<!-- Stats pills -->
							<span
								class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
								<span class="w-1.5 h-1.5 rounded-full bg-green-500" />
								{{ totalActive }} active
							</span>
							<span v-if="totalInactive"
								class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-heading/8 text-text/60">
								{{ totalInactive }} inactive
							</span>
						</div>
						<p class="text-sm text-text/50">Manage system users and their permissions</p>
					</div>

					<button @click="showInviteModal = true"
						class="flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-accent/85 active:scale-95 transition-all">
						<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
							stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
							<line x1="12" y1="5" x2="12" y2="19" />
							<line x1="5" y1="12" x2="19" y2="12" />
						</svg>
						Invite User
					</button>
				</div>
			</div>

			<!-- Filters -->
			<div class="px-8 py-4 border-b border-heading/8 flex gap-3">
				<!-- Search -->
				<div class="relative flex-1 max-w-sm">
					<svg xmlns="http://www.w3.org/2000/svg"
						class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/30" viewBox="0 0 24 24"
						fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
						<circle cx="11" cy="11" r="8" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" />
					</svg>
					<input v-model="searchQuery" type="text" placeholder="Search users…"
						class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-heading/12 bg-body focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-sm transition-all placeholder:text-text/30" />
					<button v-if="searchQuery" @click="searchQuery = ''"
						class="absolute right-3 top-1/2 -translate-y-1/2 text-text/30 hover:text-text">
						<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
							stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</button>
				</div>

				<!-- Role filter -->
				<div class="relative">
					<select v-model="roleFilter"
						class="appearance-none pl-4 pr-9 py-2.5 rounded-xl border border-heading/12 bg-body focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-sm transition-all cursor-pointer text-text">
						<option value="All">All Roles</option>
						<option v-for="r in roles" :key="r">{{ r }}</option>
					</select>
					<svg xmlns="http://www.w3.org/2000/svg"
						class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/30"
						viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
						<polyline points="6 9 12 15 18 9" />
					</svg>
				</div>

				<!-- Status filter -->
				<div class="relative">
					<select v-model="statusFilter"
						class="appearance-none pl-4 pr-9 py-2.5 rounded-xl border border-heading/12 bg-body focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-sm transition-all cursor-pointer text-text">
						<option value="All">All Status</option>
						<option>Active</option>
						<option>Inactive</option>
					</select>
					<svg xmlns="http://www.w3.org/2000/svg"
						class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/30"
						viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
						<polyline points="6 9 12 15 18 9" />
					</svg>
				</div>
			</div>

			<!-- Table -->
			<div class="flex-1 overflow-auto">
				<table class="w-full text-left">
					<thead>
						<tr class="border-b border-heading/8">
							<th class="px-8 py-3 text-xs font-bold uppercase tracking-widest text-text/40">User</th>
							<th class="px-5 py-3 text-xs font-bold uppercase tracking-widest text-text/40">Role</th>
							<th class="px-5 py-3 text-xs font-bold uppercase tracking-widest text-text/40">Status</th>
							<th class="px-8 py-3 text-xs font-bold uppercase tracking-widest text-text/40 text-right">
								Actions</th>
						</tr>
					</thead>

					<tbody>
						<tr v-for="user in filteredUsers" :key="user.id"
							class="border-b border-heading/5 hover:bg-heading/3 transition-colors duration-100 cursor-pointer"
							:class="selectedUser?.id === user.id ? 'bg-accent/5' : ''" @click="selectUser(user)">
							<!-- User cell -->
							<td class="px-8 py-4">
								<div class="flex items-center gap-3">
									<div class="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
										:class="getAvatarColor(user.id)">
										{{ getInitials(user.name) }}
									</div>
									<div>
										<p class="text-sm font-semibold text-heading leading-none">{{ user.name }}</p>
										<p class="text-xs text-text/50 mt-0.5">{{ user.email }}</p>
									</div>
								</div>
							</td>

							<!-- Role cell -->
							<td class="px-5 py-4">
								<span class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600">
									{{ user.role }}
								</span>
							</td>

							<!-- Status cell -->
							<td class="px-5 py-4">
								<span
									class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
									:class="user.status === 'Active'
										? 'bg-green-50 text-green-600'
										: 'bg-heading/8 text-text/50'">
									<span class="w-1.5 h-1.5 rounded-full"
										:class="user.status === 'Active' ? 'bg-green-500' : 'bg-text/30'" />
									{{ user.status }}
								</span>
							</td>

							<!-- Actions cell -->
							<td class="px-8 py-4 text-right">
								<div class="flex items-center justify-end gap-2" @click.stop>
									<button @click="selectUser(user)"
										class="p-2 rounded-lg text-text/40 hover:text-heading hover:bg-heading/8 transition-all"
										title="View details">
										<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24"
											fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
											<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
											<circle cx="12" cy="12" r="3" />
										</svg>
									</button>
									<button @click="deleteUser(user.id)"
										class="p-2 rounded-lg text-text/40 hover:text-red-500 hover:bg-red-50 transition-all"
										title="Delete user">
										<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24"
											fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
											<polyline points="3 6 5 6 21 6" />
											<path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
										</svg>
									</button>
								</div>
							</td>
						</tr>

						<!-- Empty state -->
						<tr v-if="filteredUsers.length === 0">
							<td colspan="4" class="px-8 py-16 text-center">
								<div class="flex flex-col items-center gap-2">
									<div class="w-12 h-12 rounded-2xl bg-heading/5 flex items-center justify-center">
										<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-heading/20"
											viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
											stroke-linecap="round">
											<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
											<circle cx="9" cy="7" r="4" />
											<path d="M23 21v-2a4 4 0 00-3-3.87" />
											<path d="M16 3.13a4 4 0 010 7.75" />
										</svg>
									</div>
									<p class="text-sm font-medium text-heading/30">No users found</p>
									<button v-if="searchQuery || roleFilter !== 'All' || statusFilter !== 'All'"
										@click="searchQuery = ''; roleFilter = 'All'; statusFilter = 'All'"
										class="text-xs text-accent hover:underline">Clear filters</button>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<!-- Table footer -->
			<div class="px-8 py-3 border-t border-heading/8">
				<p class="text-xs text-text/40">
					Showing {{ filteredUsers.length }} of {{ users.length }} users
				</p>
			</div>
		</div>

		<!-- ── RIGHT DRAWER ──────────────────────────────────── -->
		<Transition name="drawer">
			<div v-if="selectedUser"
				class="w-80 shrink-0 bg-panel border border-heading/8 rounded-2xl shadow-sm ml-4 flex flex-col overflow-hidden">
				<!-- Drawer Header -->
				<div class="px-6 py-5 border-b border-heading/8 flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
							:class="getAvatarColor(selectedUser.id)">
							{{ getInitials(selectedUser.name) }}
						</div>
						<div>
							<p class="text-sm font-bold text-heading leading-none">{{ selectedUser.name }}</p>
							<p class="text-xs text-text/50 mt-0.5">{{ selectedUser.email }}</p>
						</div>
					</div>
					<button @click="selectedUser = null"
						class="w-7 h-7 rounded-lg flex items-center justify-center text-text/30 hover:text-text hover:bg-heading/8 transition-all">
						<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
							stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</button>
				</div>

				<!-- Drawer Body -->
				<div class="flex-1 p-6 space-y-5 overflow-auto">

					<!-- Current status badge -->
					<div class="flex items-center justify-between">
						<p class="text-xs font-bold text-text/40 uppercase tracking-widest">Status</p>
						<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
							:class="selectedUser.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-heading/8 text-text/50'">
							<span class="w-1.5 h-1.5 rounded-full"
								:class="selectedUser.status === 'Active' ? 'bg-green-500' : 'bg-text/30'" />
							{{ selectedUser.status }}
						</span>
					</div>

					<div class="border-t border-heading/6" />

					<!-- Role -->
					<div>
						<label class="block text-xs font-bold text-text/40 uppercase tracking-widest mb-2">Role</label>
						<div class="relative">
							<select v-model="selectedUser.role"
								class="w-full appearance-none pl-4 pr-9 py-2.5 rounded-xl border border-heading/12 bg-body focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-sm transition-all cursor-pointer text-text">
								<option v-for="r in roles" :key="r">{{ r }}</option>
							</select>
							<svg xmlns="http://www.w3.org/2000/svg"
								class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/30"
								viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
								stroke-linecap="round">
								<polyline points="6 9 12 15 18 9" />
							</svg>
						</div>
					</div>

					<!-- Actions -->
					<div class="space-y-2.5 pt-1">
						<button @click="saveUser"
							class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/85 active:scale-95 transition-all shadow-sm">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
								stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
								<polyline points="20 6 9 17 4 12" />
							</svg>
							Save Changes
						</button>

						<button @click="toggleStatus(selectedUser)"
							class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-heading/6 text-text text-sm font-semibold hover:bg-heading/10 active:scale-95 transition-all">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
								stroke="currentColor" stroke-width="2" stroke-linecap="round">
								<path d="M18.36 6.64A9 9 0 0 1 20.77 15" />
								<path d="M6.16 6.16a9 9 0 1 0 12.68 12.68" />
								<path d="M12 2v4" />
								<path d="m2 2 20 20" />
							</svg>
							{{ selectedUser.status === 'Active' ? 'Deactivate User' : 'Activate User' }}
						</button>

						<button
							class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-heading/6 text-text text-sm font-semibold hover:bg-heading/10 active:scale-95 transition-all">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
								stroke="currentColor" stroke-width="2" stroke-linecap="round">
								<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
								<path d="M7 11V7a5 5 0 0 1 10 0v4" />
							</svg>
							Reset Password
						</button>
					</div>

					<div class="border-t border-heading/6 pt-2">
						<button @click="deleteUser(selectedUser.id)"
							class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-500 text-sm font-semibold hover:bg-red-100 active:scale-95 transition-all border border-red-100">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
								stroke="currentColor" stroke-width="2" stroke-linecap="round">
								<polyline points="3 6 5 6 21 6" />
								<path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
							</svg>
							Delete User
						</button>
					</div>
				</div>
			</div>
		</Transition>

		<!-- ── INVITE MODAL ──────────────────────────────────── -->
		<Teleport to="body">
			<Transition name="modal">
				<div v-if="showInviteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showInviteModal = false" />

					<div
						class="relative w-full max-w-md bg-panel rounded-2xl shadow-2xl border border-heading/10 overflow-hidden">

						<!-- Modal Header -->
						<div class="px-6 py-5 border-b border-heading/8 flex items-center justify-between">
							<div class="flex items-center gap-3">
								<div class="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
									<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-accent"
										viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
										stroke-linecap="round">
										<path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
										<circle cx="9" cy="7" r="4" />
										<line x1="19" y1="8" x2="19" y2="14" />
										<line x1="22" y1="11" x2="16" y2="11" />
									</svg>
								</div>
								<div>
									<h2 class="text-base font-bold text-heading leading-none">Invite User</h2>
									<p class="text-xs text-text/40 mt-0.5">Send an invite to join the workspace</p>
								</div>
							</div>
							<button @click="showInviteModal = false"
								class="w-7 h-7 rounded-lg flex items-center justify-center text-text/30 hover:text-text hover:bg-heading/8 transition-all">
								<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
									stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</button>
						</div>

						<!-- Modal Body -->
						<div class="p-6 space-y-4">
							<div>
								<label
									class="block text-xs font-bold text-text/50 uppercase tracking-widest mb-1.5">Full
									Name</label>
								<input v-model="newUser.name" placeholder="e.g. Jane Smith"
									class="w-full border border-heading/12 bg-body px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all" />
							</div>

							<div>
								<label
									class="block text-xs font-bold text-text/50 uppercase tracking-widest mb-1.5">Email
									Address</label>
								<input v-model="newUser.email" type="email" placeholder="jane@example.com"
									class="w-full border border-heading/12 bg-body px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all" />
							</div>

							<div>
								<label
									class="block text-xs font-bold text-text/50 uppercase tracking-widest mb-1.5">Role</label>
								<div class="relative">
									<select v-model="newUser.role"
										class="w-full appearance-none border border-heading/12 bg-body px-4 py-2.5 pr-9 rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all cursor-pointer">
										<option v-for="r in roles" :key="r">{{ r }}</option>
									</select>
									<svg xmlns="http://www.w3.org/2000/svg"
										class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/30"
										viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
										stroke-linecap="round">
										<polyline points="6 9 12 15 18 9" />
									</svg>
								</div>
							</div>
						</div>

						<!-- Modal Footer -->
						<div class="px-6 py-4 border-t border-heading/8 flex justify-end gap-3">
							<button @click="showInviteModal = false"
								class="px-5 py-2.5 rounded-xl text-sm font-semibold bg-heading/8 hover:bg-heading/12 text-text transition-colors">
								Cancel
							</button>
							<button @click="inviteUser" :disabled="!newUser.name || !newUser.email"
								class="px-6 py-2.5 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent/85 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-95">
								Send Invite
							</button>
						</div>
					</div>
				</div>
			</Transition>
		</Teleport>

	</div>
</template>

<style scoped>
select {
	-webkit-appearance: none;
	-moz-appearance: none;
}

.drawer-enter-active,
.drawer-leave-active {
	transition: all 0.2s ease;
}

.drawer-enter-from,
.drawer-leave-to {
	opacity: 0;
	transform: translateX(12px);
}

.modal-enter-active,
.modal-leave-active {
	transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
	opacity: 0;
}
</style>