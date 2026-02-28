import { defineStore } from 'pinia'
import axios from '@/axios'

export const useRoleStore = defineStore('roles', {
	state: () => ({
		roles: [],
		capabilities: {}
	}),

	actions: {
		async fetchRoles() {
			const { data } = await axios.get('/api/roles')
			this.roles = data
		},

		async fetchCapabilities() {
			const { data } = await axios.get('/api/capabilities')
			this.capabilities = data
		}
	}
})