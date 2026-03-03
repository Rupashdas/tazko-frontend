import { defineStore } from 'pinia'
import axios from '@/axios'

export const useUserStore = defineStore('users', {
	state: () => ({
		users: [],
		roles: [],
		loading: {
			page: false,
			save: false,
			delete: false,
			invite: false,
		},
		loaded: false,
	}),

	actions: {
		async init() {
			if (this.loaded) return
			this.loading.page = true
			try {
				const [usersRes, rolesRes] = await Promise.all([
					axios.get('/api/users'),
					axios.get('/api/roles'),
				])
				this.users = usersRes.data.data ?? []
				this.roles = rolesRes.data.data ?? []
				this.loaded = true
			} catch (err) {
				console.error('[UserStore] init:', err)
			} finally {
				this.loading.page = false
			}
		},

		async inviteUser({ name, email, role_id }) {
			this.loading.invite = true
			try {
				const { data } = await axios.post('/api/users', { name, email, role_id })
				this.users.unshift(data.data)
				return { success: true, message: data.message }
			} catch (err) {
				const errors = err.response?.data?.errors ?? {}
				const message = err.response?.data?.message ?? 'Failed to invite user.'
				return { success: false, message, errors }
			} finally {
				this.loading.invite = false
			}
		},

		async assignRole(userId, roleId) {
			this.loading.save = true
			try {
				const { data } = await axios.patch(`/api/users/${userId}/role`, { role_id: roleId })
				this._replaceUser(data.data)
				return { success: true, message: data.message }
			} catch (err) {
				return { success: false, message: err.response?.data?.message ?? 'Failed to assign role.' }
			} finally {
				this.loading.save = false
			}
		},

		async deleteUser(userId) {
			this.loading.delete = true
			try {
				const { data } = await axios.delete(`/api/users/${userId}`)
				this.users = this.users.filter(u => u.id !== userId)
				return { success: true, message: data.message }
			} catch (err) {
				return { success: false, message: err.response?.data?.message ?? 'Failed to delete user.' }
			} finally {
				this.loading.delete = false
			}
		},

		// internal
		_replaceUser(updated) {
			const idx = this.users.findIndex(u => u.id === updated.id)
			if (idx !== -1) this.users[idx] = updated
		},
	},
})