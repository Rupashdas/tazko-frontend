import { defineStore } from 'pinia'
import axios from '@/axios'

export const useRoleStore = defineStore('roles', {
	/*-----------------------
	| STATE
	------------------------*/
	state: () => ({
		roles: [],
		capabilities: {},
		selectedRole: null,
		selectedPermissions: {},
		collapsedModules: {},
		loaded: false,
		loading: {
			roles: false,
			capabilities: false,
			save: false,
			delete: false,
			create: false,
		},
		errors: {},
	}),

	/*-----------------------
	| GETTERS
	------------------------*/
	getters: {
		isPageLoading: (state) => state.loading.roles || state.loading.capabilities,

		isSuperAdmin: (state) => state.selectedRole?.name === 'super-admin',

		filteredCapabilities: (state) => (searchQuery = '') => {
			if (!searchQuery.trim()) return state.capabilities

			return Object.fromEntries(
				Object.entries(state.capabilities).map(([module, caps]) => [
					module,
					caps.filter(c =>
						c.label.toLowerCase().includes(searchQuery.toLowerCase())
					),
				]).filter(([, caps]) => caps.length > 0)
			)
		},

		selectedCapabilityIds: (state) =>
			Object.values(state.selectedPermissions).flat(),
	},

	/*-----------------------
	| ACTIONS
	------------------------*/
	actions: {
		// ── Fetch ──────────────────────────────────────────────
		async fetchRoles() {
			this.loading.roles = true
			try {
				const { data } = await axios.get('/api/roles')
				this.roles = data
				if (this.roles.length) this.selectRole(this.roles[0])
			} catch (err) {
				console.error('[RoleStore] fetchRoles:', err)
			} finally {
				this.loading.roles = false
			}
		},

		async fetchCapabilities() {
			this.loading.capabilities = true
			try {
				const { data } = await axios.get('/api/capabilities')
				this.capabilities = data

				// Initialise collapsed & permission buckets
				Object.keys(this.capabilities).forEach(module => {
					this.collapsedModules[module] = false
					if (!this.selectedPermissions[module])
						this.selectedPermissions[module] = []
				})
			} catch (err) {
				console.error('[RoleStore] fetchCapabilities:', err)
			} finally {
				this.loading.capabilities = false
			}
		},

		async init() {
			if (this.loaded) return
			await Promise.all([this.fetchCapabilities(), this.fetchRoles()])
			this.loaded = true
		},

		// ── Select role ────────────────────────────────────────
		selectRole(role) {
			this.selectedRole = role

			Object.keys(this.capabilities).forEach(module => {
				this.selectedPermissions[module] = []
			})

			role.capabilities.forEach(roleCap => {
				const entry = Object.entries(this.capabilities).find(([, caps]) =>
					caps.some(c => c.id === roleCap.id)
				)
				if (entry) {
					const [module] = entry
					this.selectedPermissions[module].push(roleCap.id)
				}
			})
		},

		// ── Create ─────────────────────────────────────────────
		async createRole({ name, label }) {
			this.errors = {}
			this.loading.create = true
			try {
				const { data } = await axios.post('/api/roles', {
					name,
					label,
					capabilities: [],
				})

				const newRole = { ...data, capabilities: data.capabilities ?? [] }

				this.roles.push(newRole)
				this.selectRole(newRole)
				return { success: true }
			} catch (err) {
				if (err.response?.status === 422) {
					this.errors = err.response.data.errors
				}
				return { success: false, errors: this.errors }
			} finally {
				this.loading.create = false
			}
		},

		// ── Save ───────────────────────────────────────────────
		async saveChanges() {
			if (!this.selectedRole) return
			this.loading.save = true
			try {
				await axios.put(`/api/roles/${this.selectedRole.id}`, {
					name: this.selectedRole.name,
					label: this.selectedRole.label,
					capabilities: this.selectedCapabilityIds,
				})

				const allCaps = Object.values(this.capabilities).flat()
				const updatedCaps = allCaps.filter(c =>
					this.selectedCapabilityIds.includes(c.id)
				)

				this.selectedRole.capabilities = updatedCaps

				const idx = this.roles.findIndex(r => r.id === this.selectedRole.id)
				if (idx > -1) {
					this.roles[idx].capabilities = updatedCaps
				}

				return { success: true }
			} catch (err) {
				console.error('[RoleStore] saveChanges:', err)
				return { success: false }
			} finally {
				this.loading.save = false
			}
		},

		// ── Delete ─────────────────────────────────────────────
		async deleteRole() {
			if (!this.selectedRole) return
			this.loading.delete = true
			try {
				await axios.delete(`/api/roles/${this.selectedRole.id}`)
				this.roles = this.roles.filter(r => r.id !== this.selectedRole.id)
				this.selectedRole = this.roles[0] ?? null
				if (this.selectedRole) this.selectRole(this.selectedRole)
				return { success: true }
			} catch (err) {
				console.error('[RoleStore] deleteRole:', err)
				return { success: false }
			} finally {
				this.loading.delete = false
			}
		},
	},
})
