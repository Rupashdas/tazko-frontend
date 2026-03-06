<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/useUserStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/utils/toast'

const userStore = useUserStore()
const authStore = useAuthStore()
const { successToast, errorToast } = useToast()

/* ── Capability flags ──────────────────────────────────────────── */
const canCreate = computed(() => authStore.hasCapability('users.create'))
const canUpdate = computed(() => authStore.hasCapability('users.update'))
const canDelete = computed(() => authStore.hasCapability('users.delete'))
const canActivate = computed(() => authStore.hasCapability('users.activate'))
const canAssignRole = computed(() => authStore.hasCapability('users.role.assign'))
const canViewProfile = computed(() => authStore.hasCapability('users.profile.view'))

/* ── State ─────────────────────────────────────────────────────── */
const searchQuery = ref('')
const roleFilter = ref('All')
const selectedUser = ref(null)
const showInviteModal = ref(false)
const showDeleteConfirm = ref(false)
const pendingDeleteId = ref(null)

// Edit mode inside popup
const editMode = ref(false)
const editName = ref('')
const editEmail = ref('')
const editErrors = ref({})

// Invite form
const newUser = ref({ name: '', email: '', role_id: null })
const inviteErrors = ref({})
const invitations = computed(() => userStore.invitations)
const showCancelConfirm = ref(false)
const pendingCancelId = ref(null)


// Role change inside popup
const pendingRoleId = ref(null)

/* ── Computed ───────────────────────────────────────────────────── */
const users = computed(() => userStore.users)
const roles = computed(() => userStore.roles.filter(r => r.name !== 'super-admin'))
const allRoles = computed(() => userStore.roles)

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

/* ── Helpers ────────────────────────────────────────────────────── */
const isOwnAccount = (userId) => authStore.user?.id === userId
const getInitials = (name) => name?.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() || '?'

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
	d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

/* ── Popup ──────────────────────────────────────────────────────── */
const openUserPopup = (user) => {
	selectedUser.value = user
	pendingRoleId.value = getPrimaryRole(user)?.id ?? null
	editMode.value = false
	editName.value = user.name
	editEmail.value = user.email
	editErrors.value = {}
}

const closeUserPopup = () => {
	selectedUser.value = null
	editMode.value = false
	editErrors.value = {}
}

/* ── Edit user name/email ───────────────────────────────────────── */
const startEdit = () => {
	editName.value = selectedUser.value.name
	editEmail.value = selectedUser.value.email
	editErrors.value = {}
	editMode.value = true
}

const handleUpdateUser = async () => {
	editErrors.value = {}
	const res = await userStore.updateUser(selectedUser.value.id, {
		name: editName.value,
		email: editEmail.value,
	})
	if (res.success) {
		successToast(res.message)
		// Update selectedUser reference
		const updated = users.value.find(u => u.id === selectedUser.value.id)
		if (updated) selectedUser.value = updated
		editMode.value = false
	} else {
		if (res.errors) editErrors.value = Object.fromEntries(
			Object.entries(res.errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
		)
		else errorToast(res.message)
	}
}

/* ── Activate / Deactivate ──────────────────────────────────────── */
const handleToggleActive = async (user) => {
	const res = await userStore.toggleActive(user.id)
	if (res.success) {
		successToast(res.message)
		// Refresh selectedUser
		const updated = users.value.find(u => u.id === user.id)
		if (updated && selectedUser.value?.id === user.id) selectedUser.value = updated
	} else {
		errorToast(res.message)
	}
}

/* ── Assign Role ────────────────────────────────────────────────── */
const handleAssignRole = async () => {
	if (!pendingRoleId.value) return
	const res = await userStore.assignRole(selectedUser.value.id, pendingRoleId.value)
	if (res.success) {
		successToast(res.message)
		const updated = users.value.find(u => u.id === selectedUser.value.id)
		if (updated) selectedUser.value = updated
	} else {
		errorToast(res.message)
	}
}

/* ── Delete ─────────────────────────────────────────────────────── */
const confirmDelete = (userId) => {
	pendingDeleteId.value = userId
	showDeleteConfirm.value = true
}

const handleDelete = async () => {
	const res = await userStore.deleteUser(pendingDeleteId.value)
	if (res.success) {
		successToast(res.message)
		showDeleteConfirm.value = false
		pendingDeleteId.value = null
		if (selectedUser.value?.id === pendingDeleteId.value) closeUserPopup()
	} else {
		errorToast(res.message)
	}
}

/* ── Invite ─────────────────────────────────────────────────────── */
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

const confirmCancel = (id) => {
	pendingCancelId.value = id
	showCancelConfirm.value = true
}

const handleCancel = async () => {
	const res = await userStore.cancelInvitation(pendingCancelId.value)
	if (res.success) {
		successToast(res.message)
		showCancelConfirm.value = false
		pendingCancelId.value = null
	} else {
		errorToast(res.message)
	}
}

const handleResend = async (id) => {
	const res = await userStore.resendInvitation(id)
	if (res.success) successToast(res.message)
	else errorToast(res.message)
}

const getStatusBadge = (status) => {
	if (status === 'pending') return 'bg-amber-100 text-amber-700'
	if (status === 'expired') return 'bg-red-100 text-red-600'
	return 'bg-heading/8 text-text/50'
}

onMounted(() => userStore.init())
</script>

<template>
	<div class="bg-body text-text min-h-[600px] relative">
		<!-- PAGE LOADING OVERLAY -->
		<Transition name="fade">
			<div v-if="userStore.loading.page"
				class="absolute inset-0 bg-panel/80 backdrop-blur-sm flex flex-col items-center justify-center z-40 rounded-xl gap-3">
				<div class="w-10 h-10 rounded-full border-3 border-accent border-t-transparent animate-spin" />
				<p class="text-sm text-text/60 font-medium">Loading users…</p>
			</div>
		</Transition>
		<!-- ══ MAIN PANEL ════════════════════════════════════════ -->
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
						viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="11" cy="11" r="8" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" />
					</svg>
					<input v-model="searchQuery" type="text" placeholder="Search users…"
						class="w-full pl-9 pr-4 py-2 text-sm bg-heading/5 border border-transparent focus:border-accent/30 focus:bg-panel rounded-lg outline-none transition-all" />
				</div>

				<!-- Role filter pills -->
				<div class="flex items-center gap-1.5 flex-wrap">
					<button v-for="role in ['All', ...allRoles.map(r => r.label)]" :key="role"
						@click="roleFilter = role" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
						:class="roleFilter === role
							? 'bg-accent text-white'
							: 'bg-heading/6 text-text/60 hover:bg-heading/10'">
						{{ role }}
					</button>
				</div>
			</div>

			<!-- Table -->
			<div class="overflow-x-auto flex-1">
				<table class="w-full min-w-[520px]">
					<thead>
						<tr class="border-b border-heading/6 bg-body/40">
							<th
								class="px-7 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-text/40">
								User</th>
							<th
								class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-text/40">
								Role</th>
							<th
								class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-text/40">
								Status</th>
							<th
								class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-text/40">
								Joined</th>
							<th
								class="px-7 py-3 text-right text-[11px] font-bold uppercase tracking-widest text-text/40">
								Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-heading/5">
						<tr v-for="user in filteredUsers" :key="user.id"
							class="group transition-colors hover:bg-heading/3"
							:class="{ 'opacity-50': !user.is_active }">

							<!-- Name / Email -->
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
												class="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-accent/15 text-accent">You</span>
										</div>
										<p class="text-xs text-text/45 mt-0.5 truncate">{{ user.email }}</p>
									</div>
								</div>
							</td>

							<!-- Role -->
							<td class="px-4 py-3.5">
								<span v-if="getPrimaryRole(user)"
									class="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold"
									:class="getRoleBadge(getPrimaryRole(user).name)">
									{{ getPrimaryRole(user).label }}
								</span>
								<span v-else class="text-xs text-text/30 italic">No role</span>
							</td>

							<!-- Status badge -->
							<td class="px-4 py-3.5">
								<span
									class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
									:class="user.is_active
										? 'bg-emerald-100 text-emerald-700'
										: 'bg-red-100 text-red-600'">
									<span class="w-1.5 h-1.5 rounded-full"
										:class="user.is_active ? 'bg-emerald-500' : 'bg-red-400'" />
									{{ user.is_active ? 'Active' : 'Inactive' }}
								</span>
							</td>

							<!-- Joined date -->
							<td class="px-4 py-3.5">
								<span class="text-sm text-text/50">{{ formatDate(user.created_at) }}</span>
							</td>

							<!-- Actions -->
							<td class="px-7 py-3.5 text-right">
								<div class="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
									@click.stop>

									<!-- View/Edit profile popup — requires users.profile.view OR users.update -->
									<button v-if="canViewProfile || canUpdate" @click="openUserPopup(user)"
										class="w-8 h-8 rounded-lg flex items-center justify-center text-text/40 hover:text-accent hover:bg-accent/10 transition-all"
										title="View / Edit">
										<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24"
											fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
											<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
											<path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
										</svg>
									</button>

									<!-- Activate / Deactivate toggle -->
									<button
										v-if="canActivate && !isOwnAccount(user.id) && !user.roles?.some(r => r.name === 'super-admin')"
										@click="handleToggleActive(user)" :disabled="userStore.loading.activate"
										:title="user.is_active ? 'Deactivate' : 'Activate'"
										class="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
										:class="user.is_active
											? 'text-text/40 hover:text-amber-500 hover:bg-amber-50'
											: 'text-text/40 hover:text-emerald-600 hover:bg-emerald-50'">
										<!-- Deactivate icon -->
										<svg v-if="user.is_active" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4"
											viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
											stroke-linecap="round">
											<circle cx="12" cy="12" r="10" />
											<line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
										</svg>
										<!-- Activate icon -->
										<svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4"
											viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
											stroke-linecap="round">
											<path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
											<polyline points="22 4 12 14.01 9 11.01" />
										</svg>
									</button>

									<!-- Delete -->
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
							<td colspan="5" class="px-7 py-16 text-center text-text/35 text-sm">No users found.</td>
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

		<!-- ══ PENDING INVITATIONS ════════════════════════════════ -->
		<div v-if="canCreate && invitations.length > 0"
			class="mt-6 flex flex-col bg-panel border border-heading/8 rounded-2xl shadow-sm overflow-hidden">

			<!-- Header -->
			<div class="px-7 py-5 border-b border-heading/8 flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
						<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-amber-600" viewBox="0 0 24 24"
							fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
							<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
							<polyline points="22,6 12,13 2,6" />
						</svg>
					</div>
					<div>
						<div class="flex items-center gap-2">
							<h2 class="text-base font-bold text-heading">Pending Invitations</h2>
							<span
								class="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 tabular-nums">
								{{ invitations.length }}
							</span>
						</div>
						<p class="text-xs text-text/45 mt-0.5">Invitations waiting to be accepted</p>
					</div>
				</div>
			</div>

			<!-- Table -->
			<div class="overflow-x-auto">
				<table class="w-full min-w-[480px]">
					<thead>
						<tr class="border-b border-heading/6 bg-body/40">
							<th
								class="px-7 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-text/40">
								Invitee</th>
							<th
								class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-text/40">
								Role</th>
							<th
								class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-text/40">
								Status</th>
							<th
								class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-text/40">
								Expires</th>
							<th
								class="px-7 py-3 text-right text-[11px] font-bold uppercase tracking-widest text-text/40">
								Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-heading/5">
						<tr v-for="inv in invitations" :key="inv.id" class="group hover:bg-heading/3 transition-colors">

							<!-- Name / Email -->
							<td class="px-7 py-3.5">
								<p class="text-sm font-semibold text-heading leading-tight">{{ inv.name }}</p>
								<p class="text-xs text-text/45 mt-0.5">{{ inv.email }}</p>
							</td>

							<!-- Role -->
							<td class="px-4 py-3.5">
								<span v-if="inv.role" class="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold"
									:class="getRoleBadge(inv.role.name)">
									{{ inv.role.label }}
								</span>
								<span v-else class="text-xs text-text/30 italic">No role</span>
							</td>

							<!-- Status -->
							<td class="px-4 py-3.5">
								<span
									class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold capitalize"
									:class="getStatusBadge(inv.status)">
									<span class="w-1.5 h-1.5 rounded-full"
										:class="inv.status === 'pending' ? 'bg-amber-500' : 'bg-red-400'" />
									{{ inv.status }}
								</span>
							</td>

							<!-- Expires -->
							<td class="px-4 py-3.5">
								<span class="text-sm text-text/50">{{ formatDate(inv.expires_at) }}</span>
							</td>

							<!-- Actions -->
							<td class="px-7 py-3.5 text-right">
								<div
									class="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
									<!-- Resend -->
									<button @click="handleResend(inv.id)" :disabled="userStore.loading.resend"
										title="Resend invitation"
										class="w-8 h-8 rounded-lg flex items-center justify-center text-text/40 hover:text-accent hover:bg-accent/10 transition-all disabled:opacity-40">
										<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24"
											fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
											<polyline points="1 4 1 10 7 10" />
											<polyline points="23 20 23 14 17 14" />
											<path
												d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
										</svg>
									</button>

									<!-- Cancel -->
									<button @click="confirmCancel(inv.id)" title="Cancel invitation"
										class="w-8 h-8 rounded-lg flex items-center justify-center text-text/40 hover:text-red-500 hover:bg-red-50 transition-all">
										<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24"
											fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
											<line x1="18" y1="6" x2="6" y2="18" />
											<line x1="6" y1="6" x2="18" y2="18" />
										</svg>
									</button>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<!-- Cancel Confirm Modal -->
		<Teleport to="body">
			<Transition name="modal">
				<div v-if="showCancelConfirm"
					class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
					@click.self="showCancelConfirm = false">
					<div class="relative bg-panel rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
						<div class="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-red-500" viewBox="0 0 24 24"
								fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
								<polyline points="3 6 5 6 21 6" />
								<path d="M19 6l-1 14H6L5 6" />
								<path d="M10 11v6" />
								<path d="M14 11v6" />
							</svg>
						</div>
						<h3 class="text-base font-bold text-heading mb-1">Cancel Invitation?</h3>
						<p class="text-sm text-text/50 mb-6">This will revoke the invitation link. The user won't be
							able to join unless re-invited.</p>
						<div class="flex gap-3">
							<button @click="showCancelConfirm = false"
								class="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-heading/8 hover:bg-heading/12 text-text transition-colors">
								Keep
							</button>
							<button @click="handleCancel"
								class="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors">
								Cancel Invite
							</button>
						</div>
					</div>
				</div>
			</Transition>
		</Teleport>

		<!-- ══ USER POPUP MODAL ══════════════════════════════════ -->
		<Teleport to="body">
			<Transition name="modal">
				<div v-if="selectedUser" class="fixed inset-0 z-50 flex items-center justify-center p-4"
					@mousedown.self="closeUserPopup">
					<div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeUserPopup" />

					<div
						class="relative w-full max-w-sm bg-panel rounded-2xl shadow-2xl border border-heading/10 overflow-hidden transition-all">

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
											class="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-accent/15 text-accent">You</span>
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

							<!-- ── Edit Name/Email (users.update) ── -->
							<div v-if="canUpdate && !isOwnAccount(selectedUser.id)">
								<div class="flex items-center justify-between mb-2">
									<p class="text-[11px] font-bold uppercase tracking-widest text-text/35">User Info
									</p>
									<button v-if="!editMode" @click="startEdit"
										class="text-xs text-accent font-semibold hover:underline">Edit</button>
									<button v-else @click="editMode = false"
										class="text-xs text-text/40 font-semibold hover:text-text">Cancel</button>
								</div>

								<div v-if="editMode" class="space-y-2">
									<div>
										<input v-model="editName" type="text" placeholder="Full name"
											class="w-full px-3 py-2 text-sm bg-heading/5 border border-transparent focus:border-accent/30 rounded-lg outline-none transition-all"
											:class="editErrors.name ? 'border-red-300 bg-red-50' : ''" />
										<p v-if="editErrors.name" class="text-xs text-red-500 mt-1">{{ editErrors.name
										}}</p>
									</div>
									<div>
										<input v-model="editEmail" type="email" placeholder="Email"
											class="w-full px-3 py-2 text-sm bg-heading/5 border border-transparent focus:border-accent/30 rounded-lg outline-none transition-all"
											:class="editErrors.email ? 'border-red-300 bg-red-50' : ''" />
										<p v-if="editErrors.email" class="text-xs text-red-500 mt-1">{{ editErrors.email
										}}</p>
									</div>
									<button @click="handleUpdateUser" :disabled="userStore.loading.save"
										class="w-full py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent/85 active:scale-95 transition-all disabled:opacity-40">
										{{ userStore.loading.save ? 'Saving…' : 'Save Changes' }}
									</button>
								</div>

								<!-- Read-only info card when not editing -->
								<div v-else
									class="bg-body/60 border border-heading/6 rounded-xl divide-y divide-heading/6">
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
										<span class="text-xs text-text/40 font-medium">Status</span>
										<span class="inline-flex items-center gap-1.5 text-xs font-semibold"
											:class="selectedUser.is_active ? 'text-emerald-600' : 'text-red-500'">
											<span class="w-1.5 h-1.5 rounded-full"
												:class="selectedUser.is_active ? 'bg-emerald-500' : 'bg-red-400'" />
											{{ selectedUser.is_active ? 'Active' : 'Inactive' }}
										</span>
									</div>
									<div class="px-4 py-3 flex items-center justify-between gap-2">
										<span class="text-xs text-text/40 font-medium">Member since</span>
										<span class="text-xs font-semibold text-heading">{{
											formatDate(selectedUser.created_at) }}</span>
									</div>
								</div>
							</div>

							<!-- ── Read-only info (no users.update) ── -->
							<div v-else>
								<p class="text-[11px] font-bold uppercase tracking-widest text-text/35 mb-2">User Info
								</p>
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
										<span class="text-xs text-text/40 font-medium">Status</span>
										<span class="inline-flex items-center gap-1.5 text-xs font-semibold"
											:class="selectedUser.is_active ? 'text-emerald-600' : 'text-red-500'">
											<span class="w-1.5 h-1.5 rounded-full"
												:class="selectedUser.is_active ? 'bg-emerald-500' : 'bg-red-400'" />
											{{ selectedUser.is_active ? 'Active' : 'Inactive' }}
										</span>
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
							</div>

							<!-- ── Activate / Deactivate (users.activate) ── -->
							<div
								v-if="canActivate && !isOwnAccount(selectedUser.id) && !selectedUser.roles?.some(r => r.name === 'super-admin')">
								<p class="text-[11px] font-bold uppercase tracking-widest text-text/35 mb-2">Account
									Status</p>
								<button @click="handleToggleActive(selectedUser)" :disabled="userStore.loading.activate"
									class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border active:scale-95 transition-all disabled:opacity-40"
									:class="selectedUser.is_active
										? 'bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-100'
										: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-100'">
									<svg v-if="selectedUser.is_active" xmlns="http://www.w3.org/2000/svg"
										class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
										stroke-width="2" stroke-linecap="round">
										<circle cx="12" cy="12" r="10" />
										<line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
									</svg>
									<svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24"
										fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
										<path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
										<polyline points="22 4 12 14.01 9 11.01" />
									</svg>
									{{ userStore.loading.activate ? 'Processing…' : (selectedUser.is_active ?
										'Deactivate User' : 'Activate User') }}
								</button>
							</div>

							<!-- ── Assign Role (users.role.assign) ── -->
							<div v-if="canAssignRole && !isOwnAccount(selectedUser.id)">
								<p class="text-[11px] font-bold uppercase tracking-widest text-text/35 mb-2">Assign Role
								</p>
								<div class="grid grid-cols-1 gap-1.5">
									<button v-for="role in roles" :key="role.id" @click="pendingRoleId = role.id"
										class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all"
										:class="pendingRoleId === role.id
											? 'border-accent/40 bg-accent/8 text-accent'
											: 'border-heading/10 hover:border-heading/20 hover:bg-heading/4 text-text/70'">
										<span class="w-2 h-2 rounded-full border-2 shrink-0 transition-colors"
											:class="pendingRoleId === role.id ? 'border-accent bg-accent' : 'border-text/20'" />
										{{ role.label }}
									</button>
								</div>
								<button @click="handleAssignRole"
									:disabled="userStore.loading.save || pendingRoleId === getPrimaryRole(selectedUser)?.id"
									class="mt-3 w-full py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/85 active:scale-95 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
									{{ userStore.loading.save ? 'Saving…' : 'Save Changes' }}
								</button>
							</div>

							<!-- ── Danger Zone: Delete (users.delete) ── -->
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

		<!-- ══ DELETE CONFIRM ════════════════════════════════════ -->
		<Teleport to="body">
			<Transition name="modal">
				<div v-if="showDeleteConfirm" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
					<div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showDeleteConfirm = false" />
					<div
						class="relative w-full max-w-sm bg-panel rounded-2xl shadow-2xl p-6 border border-heading/10 transition-all">
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

		<!-- ══ INVITE MODAL ══════════════════════════════════════ -->
		<Teleport to="body">
			<Transition name="modal">
				<div v-if="showInviteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeInviteModal" />
					<div
						class="relative w-full max-w-md bg-panel rounded-2xl shadow-2xl border border-heading/10 overflow-hidden transition-all">

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
								<div>
									<h3 class="text-sm font-bold text-heading">Invite User</h3>
									<p class="text-xs text-text/40 mt-0.5">Send an invitation by email</p>
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

						<div class="p-6 space-y-4">
							<div>
								<label class="block text-xs font-bold text-text/60 mb-1.5 uppercase tracking-wide">Full
									Name</label>
								<input v-model="newUser.name" type="text" placeholder="John Doe"
									class="w-full px-3.5 py-2.5 text-sm bg-heading/5 border border-transparent focus:border-accent/30 focus:bg-panel rounded-xl outline-none transition-all"
									:class="inviteErrors.name ? 'border-red-300 bg-red-50' : ''" />
								<p v-if="inviteErrors.name" class="text-xs text-red-500 mt-1">{{ inviteErrors.name }}
								</p>
							</div>
							<div>
								<label class="block text-xs font-bold text-text/60 mb-1.5 uppercase tracking-wide">Email
									Address</label>
								<input v-model="newUser.email" type="email" placeholder="john@example.com"
									class="w-full px-3.5 py-2.5 text-sm bg-heading/5 border border-transparent focus:border-accent/30 focus:bg-panel rounded-xl outline-none transition-all"
									:class="inviteErrors.email ? 'border-red-300 bg-red-50' : ''" />
								<p v-if="inviteErrors.email" class="text-xs text-red-500 mt-1">{{ inviteErrors.email }}
								</p>
							</div>
							<div>
								<label class="block text-xs font-bold text-text/60 mb-2 uppercase tracking-wide">Role
									(optional)</label>

								<div class="flex flex-wrap gap-2">
									<button v-for="role in roles" :key="role.id"
										@click="newUser.role_id = newUser.role_id === role.id ? null : role.id"
										class="flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all"
										:class="newUser.role_id === role.id
											? 'border-accent/50 bg-accent/8 text-accent'
											: 'border-heading/12 hover:border-heading/20 hover:bg-heading/4 text-text/60'">
										{{ role.label }}
									</button>
								</div>
							</div>
						</div>

						<div class="px-6 py-4 border-t border-heading/8 flex items-center justify-between gap-3">
							<p class="text-xs text-text/35">An invitation email will be sent.</p>
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