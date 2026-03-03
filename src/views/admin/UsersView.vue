<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/useUserStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/utils/toast'

const userStore = useUserStore()
const authStore = useAuthStore()
const { successToast, errorToast } = useToast()

/* ── Capabilities ──────────────────────────────────────── */
const canCreate = computed(() => authStore.hasCapability('users.create'))
const canDelete = computed(() => authStore.hasCapability('users.delete'))
const canAssignRole = computed(() => authStore.hasCapability('users.role.assign'))

/* ── State ─────────────────────────────────────────────── */
const searchQuery = ref('')
const roleFilter = ref('All')
const selectedUser = ref(null)   // user clicked → opens popup
const showInviteModal = ref(false)
const showDeleteConfirm = ref(false)
const pendingDeleteId = ref(null)

// Invite form
const newUser = ref({ name: '', email: '', role_id: null })
const inviteErrors = ref({})

// Role change (inside popup)
const pendingRoleId = ref(null)

/* ── Computed ──────────────────────────────────────────── */
const users = computed(() => userStore.users)
const roles = computed(() => userStore.roles.filter(r => r.name !== 'super-admin'))

const filteredUsers = computed(() => {
	let list = users.value
	if (roleFilter.value !== 'All') {
		list = list.filter(u =>
			u.roles?.some(r => r.label === roleFilter.value || r.name === roleFilter.value)
		)
	}
	if (searchQuery.value.trim()) {
		const q = searchQuery.value.toLowerCase()
		list = list.filter(u =>
			u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
		)
	}
	return list
})

/* ── Helpers ───────────────────────────────────────────── */
const isOwnAccount = (userId) => authStore.user?.id === userId

const getInitials = (name) =>
	name?.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() || '?'

const avatarColors = [
	{ bg: 'bg-violet-100', text: 'text-violet-600' },
	{ bg: 'bg-sky-100', text: 'text-sky-600' },
	{ bg: 'bg-emerald-100', text: 'text-emerald-600' },
	{ bg: 'bg-amber-100', text: 'text-amber-600' },
	{ bg: 'bg-rose-100', text: 'text-rose-600' },
	{ bg: 'bg-indigo-100', text: 'text-indigo-600' },
]
const getAvatar = (id) => avatarColors[id % avatarColors.length]

const getPrimaryRole = (user) => user.roles?.[0] ?? null

const getRoleBadge = (roleName) => {
	const map = {
		'super-admin': 'bg-violet-100 text-violet-700',
		'admin': 'bg-blue-100 text-blue-700',
		'manager': 'bg-emerald-100 text-emerald-700',
		'member': 'bg-heading/8 text-text/60 border border-heading/10',
	}
	return map[roleName] ?? 'bg-heading/8 text-text/60 border border-heading/10'
}

const formatDate = (d) =>
	d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

/* ── Actions ───────────────────────────────────────────── */
const openUserPopup = (user) => {
	selectedUser.value = { ...user }
	pendingRoleId.value = user.roles?.[0]?.id ?? null
}

const closeUserPopup = () => {
	selectedUser.value = null
	pendingRoleId.value = null
}

const handleAssignRole = async () => {
	if (!pendingRoleId.value) return
	const res = await userStore.assignRole(selectedUser.value.id, pendingRoleId.value)
	if (res.success) {
		successToast(res.message)
		closeUserPopup()
	} else {
		errorToast(res.message)
	}
}

const confirmDelete = (userId) => {
	pendingDeleteId.value = userId
	showDeleteConfirm.value = true
}

const handleDelete = async () => {
	const res = await userStore.deleteUser(pendingDeleteId.value)
	if (res.success) {
		successToast(res.message)
		showDeleteConfirm.value = false
		if (selectedUser.value?.id === pendingDeleteId.value) closeUserPopup()
		pendingDeleteId.value = null
	} else {
		errorToast(res.message)
	}
}

/* ── Invite ────────────────────────────────────────────── */
const validateInvite = () => {
	const e = {}
	if (!newUser.value.name.trim()) e.name = 'Name is required'
	if (!newUser.value.email.trim()) e.email = 'Email is required'
	else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.value.email)) e.email = 'Enter a valid email'
	inviteErrors.value = e
	return !Object.keys(e).length
}

const handleInvite = async () => {
	if (!validateInvite()) return

	const res = await userStore.sendInvitation({
		name: newUser.value.name,
		email: newUser.value.email,
		role_id: newUser.value.role_id || null,
	})

	if (res.success) {
		successToast(res.message)
		closeInviteModal()
	} else {
		if (res.errors) {
			inviteErrors.value = Object.fromEntries(
				Object.entries(res.errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
			)
		} else {
			errorToast(res.message)
		}
	}
}

const closeInviteModal = () => {
	showInviteModal.value = false
	newUser.value = { name: '', email: '', role_id: null }
	inviteErrors.value = {}
}

onMounted(() => userStore.init())
</script>

<template>
	<div class="bg-body text-text min-h-[600px]">

		<!-- ══ MAIN PANEL ════════════════════════════════ -->
		<div class="flex flex-col bg-panel border border-heading/8 rounded-2xl shadow-sm overflow-hidden">

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

				<button v-if="canCreate" @click="showInviteModal = true"
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

				<div class="flex items-center gap-1">
					<button v-for="opt in ['All', ...roles.map(r => r.label)]" :key="opt" @click="roleFilter = opt"
						class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
						:class="roleFilter === opt ? 'bg-accent text-white shadow-sm' : 'text-text/55 hover:text-heading hover:bg-heading/6'">
						{{ opt }}
					</button>
				</div>

				<div class="ml-auto text-xs text-text/40 font-medium tabular-nums whitespace-nowrap">
					{{ filteredUsers.length }} of {{ users.length }}
				</div>
			</div>

			<!-- Loading state -->
			<div v-if="userStore.loading.page" class="flex items-center justify-center py-24">
				<div class="w-7 h-7 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
			</div>

			<!-- Table -->
			<div v-else class="flex-1 overflow-auto">
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
						<tr v-for="user in filteredUsers" :key="user.id" @click="openUserPopup(user)"
							class="group cursor-pointer transition-colors duration-100 hover:bg-heading/3">

							<td class="px-7 py-3.5">
								<div class="flex items-center gap-3">
									<div class="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-transform group-hover:scale-105"
										:class="[getAvatar(user.id).bg, getAvatar(user.id).text]">
										{{ getInitials(user.name) }}
									</div>
									<div class="min-w-0">
										<div class="flex items-center gap-1.5">
											<p class="text-sm font-semibold text-heading leading-tight truncate">{{
												user.name }}</p>
											<span v-if="isOwnAccount(user.id)"
												class="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-accent/15 text-accent">
												You
											</span>
										</div>
										<p class="text-xs text-text/45 mt-0.5 truncate">{{ user.email }}</p>
									</div>
								</div>
							</td>

							<td class="px-4 py-3.5">
								<span v-if="getPrimaryRole(user)"
									class="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold"
									:class="getRoleBadge(getPrimaryRole(user).name)">
									{{ getPrimaryRole(user).label }}
								</span>
								<span v-else class="text-xs text-text/30 italic">No role</span>
							</td>

							<td class="px-4 py-3.5">
								<span class="text-sm text-text/50">{{ formatDate(user.created_at) }}</span>
							</td>

							<td class="px-7 py-3.5 text-right">
								<div class="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
									@click.stop>
									<button @click="openUserPopup(user)"
										class="w-8 h-8 rounded-lg flex items-center justify-center text-text/40 hover:text-accent hover:bg-accent/10 transition-all"
										title="Edit">
										<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24"
											fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
											<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
											<path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
										</svg>
									</button>
									<button v-if="canDelete && !isOwnAccount(user.id)" @click="confirmDelete(user.id)"
										class="w-8 h-8 rounded-lg flex items-center justify-center text-text/40 hover:text-red-500 hover:bg-red-50 transition-all"
										title="Remove">
										<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24"
											fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
											<polyline points="3 6 5 6 21 6" />
											<path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
										</svg>
									</button>
								</div>
							</td>
						</tr>

						<tr v-if="!filteredUsers.length">
							<td colspan="4" class="px-7 py-16 text-center text-text/35 text-sm">
								No users found.
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<!-- Footer -->
			<div class="px-7 py-3.5 border-t border-heading/6 flex items-center justify-between bg-body/30 shrink-0">
				<p class="text-xs text-text/35">
					{{ users.length }} member{{ users.length !== 1 ? 's' : '' }} in workspace
				</p>
			</div>
		</div>

		<!-- ══ USER POPUP MODAL ════════════════════════════ -->
		<Teleport to="body">
			<Transition name="modal">
				<div v-if="selectedUser" class="fixed inset-0 z-50 flex items-center justify-center p-4"
					@mousedown.self="closeUserPopup">
					<div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeUserPopup" />

					<div
						class="relative w-full max-w-sm bg-panel rounded-2xl shadow-2xl border border-heading/10 overflow-hidden">
						<!-- Header -->
						<div class="px-6 py-5 border-b border-heading/8 flex items-start justify-between gap-3">
							<div class="flex items-center gap-3 min-w-0">
								<div class="w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold shrink-0"
									:class="[getAvatar(selectedUser.id).bg, getAvatar(selectedUser.id).text]">
									{{ getInitials(selectedUser.name) }}
								</div>
								<div class="min-w-0">
									<div class="flex items-center gap-1.5">
										<p class="text-sm font-bold text-heading leading-tight truncate">{{
											selectedUser.name }}</p>
										<span v-if="isOwnAccount(selectedUser.id)"
											class="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-accent/15 text-accent">
											You
										</span>
									</div>
									<p class="text-xs text-text/45 mt-0.5 truncate">{{ selectedUser.email }}</p>
								</div>
							</div>
							<button @click="closeUserPopup"
								class="w-7 h-7 rounded-lg flex items-center justify-center text-text/30 hover:text-text hover:bg-heading/8 transition-all shrink-0">
								<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
									stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</button>
						</div>

						<!-- Body -->
						<div class="p-6 space-y-5">
							<!-- Info card -->
							<div class="bg-body/60 border border-heading/6 rounded-xl divide-y divide-heading/6">
								<div class="px-4 py-3 flex items-center justify-between gap-2">
									<span class="text-xs text-text/40 font-medium">Current Role</span>
									<span v-if="getPrimaryRole(selectedUser)"
										class="text-xs font-semibold px-2.5 py-1 rounded-lg"
										:class="getRoleBadge(getPrimaryRole(selectedUser).name)">
										{{ getPrimaryRole(selectedUser).label }}
									</span>
									<span v-else class="text-xs text-text/30 italic">No role</span>
								</div>
								<div class="px-4 py-3 flex items-center justify-between gap-2">
									<span class="text-xs text-text/40 font-medium">Member since</span>
									<span class="text-xs font-semibold text-heading">{{
										formatDate(selectedUser.created_at) }}</span>
								</div>
								<div class="px-4 py-3 flex items-center justify-between gap-2">
									<span class="text-xs text-text/40 font-medium">User ID</span>
									<span class="text-xs font-mono text-text/50">#{{ selectedUser.id }}</span>
								</div>
							</div>

							<!-- Change Role — hidden for own account -->
							<div v-if="canAssignRole && !isOwnAccount(selectedUser.id)">
								<p class="text-[11px] font-bold uppercase tracking-widest text-text/35 mb-2">Assign Role
								</p>
								<div class="grid grid-cols-1 gap-1.5">
									<button v-for="r in roles" :key="r.id" @click="pendingRoleId = r.id"
										class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all"
										:class="pendingRoleId === r.id
											? 'border-accent/40 bg-accent/8 text-accent'
											: 'border-heading/10 hover:border-heading/20 hover:bg-heading/4 text-text/70'">
										<span class="w-2 h-2 rounded-full border-2 shrink-0 transition-colors"
											:class="pendingRoleId === r.id ? 'border-accent bg-accent' : 'border-text/20'" />
										{{ r.label }}
									</button>
								</div>

								<button @click="handleAssignRole"
									:disabled="userStore.loading.save || pendingRoleId === getPrimaryRole(selectedUser)?.id"
									class="mt-3 w-full py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/85 active:scale-95 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
									{{ userStore.loading.save ? 'Saving…' : 'Save Changes' }}
								</button>
							</div>

							<!-- Danger Zone — hidden for own account -->
							<div v-if="canDelete && !isOwnAccount(selectedUser.id)"
								class="border-t border-heading/6 pt-4">
								<p class="text-[11px] font-bold uppercase tracking-widest text-text/35 mb-2">Danger Zone
								</p>
								<button @click="confirmDelete(selectedUser.id)"
									class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 text-sm font-semibold border border-red-100/80 active:scale-95 transition-all">
									<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24"
										fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
										<polyline points="3 6 5 6 21 6" />
										<path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
									</svg>
									Remove User
								</button>
							</div>
						</div>
					</div>
				</div>
			</Transition>
		</Teleport>

		<!-- ══ INVITE MODAL ════════════════════════════════ -->
		<Teleport to="body">
			<Transition name="modal">
				<div v-if="showInviteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeInviteModal" />

					<div
						class="relative w-full max-w-md bg-panel rounded-2xl shadow-2xl border border-heading/10 overflow-hidden">
						<div class="px-6 py-5 border-b border-heading/8 flex items-center justify-between">
							<div class="flex items-center gap-3">
								<div class="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
									<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-accent"
										viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
										stroke-linecap="round">
										<path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
										<circle cx="9" cy="7" r="4" />
										<line x1="19" y1="8" x2="25" y2="8" />
										<line x1="22" y1="5" x2="22" y2="11" />
									</svg>
								</div>
								<h2 class="text-lg font-bold text-heading">Invite Member</h2>
							</div>
							<button @click="closeInviteModal"
								class="w-7 h-7 rounded-lg flex items-center justify-center text-text/40 hover:text-text hover:bg-heading/8 transition-all">
								<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
									stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</button>
						</div>

						<div class="p-6 space-y-4">
							<!-- Name -->
							<div>
								<label class="block text-sm font-semibold text-heading mb-1.5">Full Name <span
										class="text-red-400">*</span></label>
								<input v-model="newUser.name" type="text" placeholder="Jane Smith"
									class="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all bg-panel focus:ring-2 focus:ring-accent/20 focus:border-accent"
									:class="inviteErrors.name ? 'border-red-400' : 'border-heading/15'" />
								<p v-if="inviteErrors.name" class="text-red-500 text-xs mt-1">{{ inviteErrors.name }}
								</p>
							</div>

							<!-- Email -->
							<div>
								<label class="block text-sm font-semibold text-heading mb-1.5">Email Address <span
										class="text-red-400">*</span></label>
								<input v-model="newUser.email" type="email" placeholder="jane@example.com"
									class="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all bg-panel focus:ring-2 focus:ring-accent/20 focus:border-accent"
									:class="inviteErrors.email ? 'border-red-400' : 'border-heading/15'" />
								<p v-if="inviteErrors.email" class="text-red-500 text-xs mt-1">{{ inviteErrors.email }}
								</p>
							</div>

							<!-- Role -->
							<div>
								<label class="block text-sm font-semibold text-heading mb-1.5">Role</label>
								<div class="grid grid-cols-2 gap-1.5">
									<button v-for="r in roles" :key="r.id"
										@click="newUser.role_id = newUser.role_id === r.id ? null : r.id"
										class="flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all"
										:class="newUser.role_id === r.id
											? 'border-accent/50 bg-accent/8 text-accent'
											: 'border-heading/12 hover:border-heading/20 hover:bg-heading/4 text-text/60'">
										{{ r.label }}
									</button>
								</div>
							</div>
						</div>

						<div class="px-6 py-4 border-t border-heading/8 flex items-center justify-between gap-3">
							<p class="text-xs text-text/35">An account will be created for this user.</p>
							<div class="flex gap-2 shrink-0">
								<button @click="closeInviteModal"
									class="px-4 py-2 rounded-xl text-sm font-semibold bg-heading/8 hover:bg-heading/12 text-text transition-colors">
									Cancel
								</button>
								<button @click="handleInvite" :disabled="userStore.loading.invite"
									class="px-5 py-2 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent/85 transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
									{{ userStore.loading.invite ? 'Inviting…' : 'Send Invite' }}
								</button>
							</div>
						</div>
					</div>
				</div>
			</Transition>
		</Teleport>

		<!-- ══ DELETE CONFIRM ══════════════════════════════ -->
		<Teleport to="body">
			<Transition name="modal">
				<div v-if="showDeleteConfirm" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
					<div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showDeleteConfirm = false" />
					<div class="relative w-full max-w-sm bg-panel rounded-2xl shadow-2xl p-6 border border-heading/10">
						<div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-red-500" viewBox="0 0 24 24"
								fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
								<polyline points="3 6 5 6 21 6" />
								<path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
							</svg>
						</div>
						<h3 class="text-lg font-bold text-heading text-center mb-1">Remove User?</h3>
						<p class="text-sm text-text/60 text-center mb-6">This action cannot be undone.</p>
						<div class="flex gap-3">
							<button @click="showDeleteConfirm = false; pendingDeleteId = null"
								class="flex-1 py-2.5 rounded-lg text-sm font-medium bg-heading/8 hover:bg-heading/12 transition-colors text-text">
								Cancel
							</button>
							<button @click="handleDelete" :disabled="userStore.loading.delete"
								class="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-50">
								{{ userStore.loading.delete ? 'Removing…' : 'Yes, Remove' }}
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
	transform: scale(0.97);
}
</style>