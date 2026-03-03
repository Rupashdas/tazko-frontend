<script setup>
import { ref, computed } from 'vue'

/* ── Mock Data ─────────────────────────────────────────── */
const users = ref([
	{ id: 1, name: 'John Doe', email: 'john@mail.com', role: 'Admin', joined: '2024-01-12' },
	{ id: 2, name: 'Sara Khan', email: 'sara@mail.com', role: 'Project Manager', joined: '2024-02-05' },
	{ id: 3, name: 'Rakib Hasan', email: 'rakib@mail.com', role: 'Member', joined: '2024-03-19' },
	{ id: 4, name: 'Emily Carter', email: 'emily@mail.com', role: 'Member', joined: '2024-04-01' },
	{ id: 5, name: 'David Nguyen', email: 'david@mail.com', role: 'Project Manager', joined: '2024-05-22' },
])

const roles = ['Admin', 'Project Manager', 'Member']

/* ── State ─────────────────────────────────────────────── */
const selectedUser = ref(null)
const searchQuery = ref('')
const roleFilter = ref('All')
const showInviteModal = ref(false)
const newUser = ref({ name: '', email: '', role: 'Member' })
const inviteErrors = ref({})

/* ── Computed ───────────────────────────────────────────── */
const filteredUsers = computed(() =>
	users.value.filter(u => {
		const q = searchQuery.value.toLowerCase()
		const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
		const matchRole = roleFilter.value === 'All' || u.role === roleFilter.value
		return matchSearch && matchRole
	})
)

/* ── Helpers ────────────────────────────────────────────── */
const getInitials = (name) =>
	name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

const avatarPalette = [
	{ bg: 'bg-violet-100', text: 'text-violet-600' },
	{ bg: 'bg-sky-100', text: 'text-sky-600' },
	{ bg: 'bg-emerald-100', text: 'text-emerald-600' },
	{ bg: 'bg-amber-100', text: 'text-amber-600' },
	{ bg: 'bg-rose-100', text: 'text-rose-600' },
]
const getAvatar = (id) => avatarPalette[id % avatarPalette.length]

const roleBadge = {
	'Admin': 'bg-violet-50 text-violet-700 border border-violet-200/80',
	'Project Manager': 'bg-sky-50 text-sky-700 border border-sky-200/80',
	'Member': 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
}
const getRoleBadge = (role) => roleBadge[role] ?? 'bg-heading/8 text-text/60 border border-heading/10'

const formatDate = (d) =>
	new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

/* ── Actions ────────────────────────────────────────────── */
const selectUser = (user) => {
	selectedUser.value = selectedUser.value?.id === user.id ? null : { ...user }
}

const validateInvite = () => {
	const e = {}
	if (!newUser.value.name.trim()) e.name = 'Name is required'
	if (!newUser.value.email.trim()) e.email = 'Email is required'
	else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.value.email)) e.email = 'Enter a valid email'
	inviteErrors.value = e
	return !Object.keys(e).length
}

const inviteUser = () => {
	if (!validateInvite()) return
	users.value.push({ id: Date.now(), joined: new Date().toISOString().split('T')[0], ...newUser.value })
	closeInviteModal()
}

const closeInviteModal = () => {
	showInviteModal.value = false
	newUser.value = { name: '', email: '', role: 'Member' }
	inviteErrors.value = {}
}

const deleteUser = (id) => {
	users.value = users.value.filter(u => u.id !== id)
	if (selectedUser.value?.id === id) selectedUser.value = null
}

const saveUser = () => {
	const idx = users.value.findIndex(u => u.id === selectedUser.value.id)
	if (idx !== -1) users.value[idx] = { ...selectedUser.value }
}
</script>

<template>
	<div class="flex gap-5 bg-body text-text min-h-[600px]">

		<!-- ══ MAIN PANEL ════════════════════════════════ -->
		<div
			class="flex-1 min-w-0 flex flex-col bg-panel border border-heading/8 rounded-2xl shadow-sm overflow-hidden">

			<!-- Top Bar -->
			<div class="px-7 py-5 border-b border-heading/8 flex items-center justify-between gap-4 shrink-0">
				<div class="flex items-center gap-4">
					<div class="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
						<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-accent" viewBox="0 0 24 24"
							fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
							<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
							<circle cx="9" cy="7" r="4" />
							<path d="M23 21v-2a4 4 0 00-3-3.87" />
							<path d="M16 3.13a4 4 0 010 7.75" />
						</svg>
					</div>
					<div>
						<div class="flex items-center gap-2.5">
							<h1 class="text-xl font-bold text-heading leading-tight">Manage Users</h1>
							<span
								class="px-2 py-0.5 rounded-full text-xs font-bold bg-heading/8 text-text/60 tabular-nums">
								{{ users.length }}
							</span>
						</div>
						<p class="text-xs text-text/45 mt-0.5">Invite and manage workspace members</p>
					</div>
				</div>

				<button @click="showInviteModal = true"
					class="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-accent/88 active:scale-95 transition-all shrink-0">
					<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
						stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
						<line x1="12" y1="5" x2="12" y2="19" />
						<line x1="5" y1="12" x2="19" y2="12" />
					</svg>
					Invite User
				</button>
			</div>

			<!-- Filter Bar -->
			<div class="px-7 py-3.5 border-b border-heading/6 flex items-center gap-3 shrink-0 bg-body/40">
				<!-- Search -->
				<div class="relative flex-1 max-w-xs">
					<svg xmlns="http://www.w3.org/2000/svg"
						class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/35 pointer-events-none"
						viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
						<circle cx="11" cy="11" r="8" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" />
					</svg>
					<input v-model="searchQuery" type="text" placeholder="Search by name or email…"
						class="w-full pl-9 pr-9 py-2 rounded-lg border border-heading/12 bg-panel focus:border-accent focus:ring-2 focus:ring-accent/15 outline-none text-sm transition-all placeholder:text-text/30" />
					<button v-if="searchQuery" @click="searchQuery = ''"
						class="absolute right-3 top-1/2 -translate-y-1/2 text-text/30 hover:text-text transition-colors">
						<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
							stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</button>
				</div>

				<div class="h-5 w-px bg-heading/10" />

				<!-- Role pill tabs -->
				<div class="flex items-center gap-1">
					<button v-for="opt in ['All', ...roles]" :key="opt" @click="roleFilter = opt"
						class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" :class="roleFilter === opt
							? 'bg-accent text-white shadow-sm'
							: 'text-text/55 hover:text-heading hover:bg-heading/6'">
						{{ opt }}
					</button>
				</div>

				<div class="ml-auto text-xs text-text/40 font-medium tabular-nums whitespace-nowrap">
					{{ filteredUsers.length }} of {{ users.length }}
				</div>
			</div>

			<!-- Table -->
			<div class="flex-1 overflow-auto">
				<table class="w-full text-left">
					<thead class="sticky top-0 z-10 bg-panel/95 backdrop-blur-sm">
						<tr class="border-b border-heading/8">
							<th class="px-7 py-3 text-[11px] font-bold uppercase tracking-widest text-text/35">Member
							</th>
							<th class="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-text/35">Role</th>
							<th class="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-text/35">Joined
							</th>
							<th
								class="px-7 py-3 text-[11px] font-bold uppercase tracking-widest text-text/35 text-right">
								Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-heading/5">
						<tr v-for="user in filteredUsers" :key="user.id" @click="selectUser(user)"
							class="group cursor-pointer transition-colors duration-100"
							:class="selectedUser?.id === user.id ? 'bg-accent/5 hover:bg-accent/7' : 'hover:bg-heading/3'">

							<td class="px-7 py-3.5">
								<div class="flex items-center gap-3">
									<div class="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-transform group-hover:scale-105"
										:class="[getAvatar(user.id).bg, getAvatar(user.id).text]">
										{{ getInitials(user.name) }}
									</div>
									<div class="min-w-0">
										<p class="text-sm font-semibold text-heading leading-tight truncate">{{
											user.name }}</p>
										<p class="text-xs text-text/45 mt-0.5 truncate">{{ user.email }}</p>
									</div>
								</div>
							</td>

							<td class="px-4 py-3.5">
								<span class="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold"
									:class="getRoleBadge(user.role)">
									{{ user.role }}
								</span>
							</td>

							<td class="px-4 py-3.5">
								<span class="text-sm text-text/50">{{ formatDate(user.joined) }}</span>
							</td>

							<td class="px-7 py-3.5 text-right">
								<div class="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
									@click.stop>
									<button @click="selectUser(user)"
										class="p-2 rounded-lg text-text/45 hover:text-accent hover:bg-accent/8 transition-all"
										title="View details">
										<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24"
											fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
											<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
											<circle cx="12" cy="12" r="3" />
										</svg>
									</button>
									<button @click="deleteUser(user.id)"
										class="p-2 rounded-lg text-text/45 hover:text-red-500 hover:bg-red-50 transition-all"
										title="Remove user">
										<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24"
											fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
											<polyline points="3 6 5 6 21 6" />
											<path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
										</svg>
									</button>
								</div>
							</td>
						</tr>

						<tr v-if="filteredUsers.length === 0">
							<td colspan="4" class="px-7 py-20 text-center">
								<div class="flex flex-col items-center gap-3">
									<div class="w-14 h-14 rounded-2xl bg-heading/5 flex items-center justify-center">
										<svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-heading/20"
											viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
											stroke-linecap="round">
											<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
											<circle cx="9" cy="7" r="4" />
											<path d="M23 21v-2a4 4 0 00-3-3.87" />
											<path d="M16 3.13a4 4 0 010 7.75" />
										</svg>
									</div>
									<div>
										<p class="text-sm font-semibold text-heading/35">No users found</p>
										<p class="text-xs text-text/30 mt-0.5">Try adjusting your search or filters</p>
									</div>
									<button v-if="searchQuery || roleFilter !== 'All'"
										@click="searchQuery = ''; roleFilter = 'All'"
										class="text-xs text-accent font-semibold hover:underline mt-1">Clear
										filters</button>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<!-- Table Footer -->
			<div class="px-7 py-3 border-t border-heading/6 flex items-center justify-between shrink-0 bg-body/30">
				<p class="text-xs text-text/35">
					{{ filteredUsers.length }} member{{ filteredUsers.length !== 1 ? 's' : '' }} in workspace
				</p>
				<p v-if="selectedUser" class="text-xs text-accent font-medium">Viewing {{ selectedUser.name }}</p>
			</div>
		</div>

		<!-- ══ RIGHT DRAWER ═══════════════════════════════ -->
		<Transition name="drawer">
			<aside v-if="selectedUser"
				class="w-72 shrink-0 bg-panel border border-heading/8 rounded-2xl shadow-sm flex flex-col overflow-hidden">

				<!-- Drawer Header -->
				<div class="px-5 py-5 border-b border-heading/8 flex items-start justify-between gap-3">
					<div class="flex items-center gap-3 min-w-0">
						<div class="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
							:class="[getAvatar(selectedUser.id).bg, getAvatar(selectedUser.id).text]">
							{{ getInitials(selectedUser.name) }}
						</div>
						<div class="min-w-0">
							<p class="text-sm font-bold text-heading leading-tight truncate">{{ selectedUser.name }}</p>
							<p class="text-xs text-text/45 mt-0.5 truncate">{{ selectedUser.email }}</p>
						</div>
					</div>
					<button @click="selectedUser = null"
						class="w-7 h-7 rounded-lg flex items-center justify-center text-text/30 hover:text-text hover:bg-heading/8 transition-all shrink-0 mt-0.5">
						<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
							stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</button>
				</div>

				<!-- Drawer Body -->
				<div class="flex-1 overflow-auto p-5 space-y-5">

					<!-- Info card -->
					<div class="bg-body/60 border border-heading/6 rounded-xl divide-y divide-heading/6">
						<div class="px-4 py-3 flex items-center justify-between gap-2">
							<span class="text-xs text-text/40 font-medium">Role</span>
							<span class="text-xs font-semibold px-2.5 py-1 rounded-lg"
								:class="getRoleBadge(selectedUser.role)">
								{{ selectedUser.role }}
							</span>
						</div>
						<div class="px-4 py-3 flex items-center justify-between gap-2">
							<span class="text-xs text-text/40 font-medium">Member since</span>
							<span class="text-xs font-semibold text-heading">{{ formatDate(selectedUser.joined)
								}}</span>
						</div>
						<div class="px-4 py-3 flex items-center justify-between gap-2">
							<span class="text-xs text-text/40 font-medium">User ID</span>
							<span class="text-xs font-mono text-text/50">#{{ selectedUser.id }}</span>
						</div>
					</div>

					<!-- Change Role -->
					<div>
						<p class="text-[11px] font-bold uppercase tracking-widest text-text/35 mb-2">Change Role</p>
						<div class="grid grid-cols-1 gap-1.5">
							<button v-for="r in roles" :key="r" @click="selectedUser.role = r"
								class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all"
								:class="selectedUser.role === r
									? 'border-accent/40 bg-accent/8 text-accent'
									: 'border-heading/10 hover:border-heading/20 hover:bg-heading/4 text-text/70'">
								<span class="w-2 h-2 rounded-full border-2 shrink-0 transition-colors"
									:class="selectedUser.role === r ? 'border-accent bg-accent' : 'border-text/20'" />
								{{ r }}
							</button>
						</div>
					</div>

					<!-- Save -->
					<button @click="saveUser"
						class="w-full py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/85 active:scale-95 transition-all shadow-sm">
						Save Changes
					</button>

					<!-- Danger Zone -->
					<div class="border-t border-heading/6 pt-4">
						<p class="text-[11px] font-bold uppercase tracking-widest text-text/35 mb-2">Danger Zone</p>
						<button @click="deleteUser(selectedUser.id)"
							class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 text-sm font-semibold border border-red-100/80 active:scale-95 transition-all">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
								stroke="currentColor" stroke-width="2" stroke-linecap="round">
								<polyline points="3 6 5 6 21 6" />
								<path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
							</svg>
							Remove User
						</button>
					</div>
				</div>
			</aside>
		</Transition>

		<!-- ══ INVITE MODAL ════════════════════════════════ -->
		<Teleport to="body">
			<Transition name="modal">
				<div v-if="showInviteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeInviteModal" />

					<div
						class="relative w-full max-w-md bg-panel rounded-2xl shadow-2xl border border-heading/10 overflow-hidden">
						<!-- Header -->
						<div class="px-6 py-5 border-b border-heading/8 flex items-center justify-between">
							<div class="flex items-center gap-3">
								<div class="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
									<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-accent"
										viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
										stroke-linecap="round">
										<path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
										<circle cx="9" cy="7" r="4" />
										<line x1="19" y1="8" x2="19" y2="14" />
										<line x1="22" y1="11" x2="16" y2="11" />
									</svg>
								</div>
								<div>
									<h2 class="text-base font-bold text-heading leading-tight">Invite a member</h2>
									<p class="text-xs text-text/40 mt-0.5">They'll receive an email invitation</p>
								</div>
							</div>
							<button @click="closeInviteModal"
								class="w-7 h-7 rounded-lg flex items-center justify-center text-text/30 hover:text-text hover:bg-heading/8 transition-all">
								<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
									stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</button>
						</div>

						<!-- Body -->
						<div class="p-6 space-y-4">
							<div>
								<label
									class="block text-xs font-bold text-text/50 uppercase tracking-widest mb-1.5">Full
									Name</label>
								<input v-model="newUser.name" placeholder="e.g. Jane Smith"
									class="w-full border px-4 py-2.5 rounded-xl text-sm outline-none transition-all bg-body placeholder:text-text/30"
									:class="inviteErrors.name
										? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-200'
										: 'border-heading/12 focus:border-accent focus:ring-2 focus:ring-accent/15'" />
								<p v-if="inviteErrors.name" class="text-xs text-red-500 mt-1">{{ inviteErrors.name }}
								</p>
							</div>

							<div>
								<label
									class="block text-xs font-bold text-text/50 uppercase tracking-widest mb-1.5">Email
									Address</label>
								<input v-model="newUser.email" type="email" placeholder="jane@example.com"
									class="w-full border px-4 py-2.5 rounded-xl text-sm outline-none transition-all bg-body placeholder:text-text/30"
									:class="inviteErrors.email
										? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-200'
										: 'border-heading/12 focus:border-accent focus:ring-2 focus:ring-accent/15'" />
								<p v-if="inviteErrors.email" class="text-xs text-red-500 mt-1">{{ inviteErrors.email }}
								</p>
							</div>

							<div>
								<label
									class="block text-xs font-bold text-text/50 uppercase tracking-widest mb-1.5">Role</label>
								<div class="grid grid-cols-3 gap-2">
									<button v-for="r in roles" :key="r" @click="newUser.role = r"
										class="py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all text-center"
										:class="newUser.role === r
											? 'border-accent/50 bg-accent/8 text-accent'
											: 'border-heading/12 hover:border-heading/20 hover:bg-heading/4 text-text/60'">
										{{ r }}
									</button>
								</div>
							</div>
						</div>

						<!-- Footer -->
						<div class="px-6 py-4 border-t border-heading/8 flex items-center justify-between gap-3">
							<p class="text-xs text-text/35">An invite link will be sent via email.</p>
							<div class="flex gap-2 shrink-0">
								<button @click="closeInviteModal"
									class="px-4 py-2 rounded-xl text-sm font-semibold bg-heading/8 hover:bg-heading/12 text-text transition-colors">
									Cancel
								</button>
								<button @click="inviteUser"
									class="px-5 py-2 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent/85 transition-all shadow-sm active:scale-95">
									Send Invite
								</button>
							</div>
						</div>
					</div>
				</div>
			</Transition>
		</Teleport>
	</div>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
	transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-enter-from,
.drawer-leave-to {
	opacity: 0;
	transform: translateX(16px);
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