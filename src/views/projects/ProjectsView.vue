<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { addIcons } from 'oh-vue-icons'
import {
	BiPlusCircle, BiSearch, BiGrid3X3Gap, BiListUl,
	MdFolderspecialOutlined, BiPeople, BiCalendar3,
	BiThreeDotsVertical, BiArchive, BiPencil, BiTrash,
	BiFlag, BiCheckCircle, BiClock,
	BiChevronDown, BiArrowRight, BiBarChart,
	BiXCircle, BiLightningCharge, BiGraphUp,
} from 'oh-vue-icons/icons'

addIcons(
	BiPlusCircle, BiSearch, BiGrid3X3Gap, BiListUl,
	MdFolderspecialOutlined, BiPeople, BiCalendar3,
	BiThreeDotsVertical, BiArchive, BiPencil, BiTrash,
	BiFlag, BiCheckCircle, BiClock,
	BiChevronDown, BiArrowRight, BiBarChart,
	BiXCircle, BiLightningCharge, BiGraphUp,
)

const router = useRouter()
const viewMode = ref('grid')
const searchQuery = ref('')
const statusFilter = ref('All')
const priorityFilter = ref('All')
const showCreateModal = ref(false)
const openMenuId = ref(null)

// New project form state
const newProject = ref({ name: '', description: '', goal: '', priority: 'High', status: 'Planning', startDate: '', endDate: '' })

const statuses = ['All', 'Planning', 'In Progress', 'On Hold', 'Completed']
const priorities = ['All', 'Urgent', 'High', 'Medium', 'Low']

// Project accent colors — each project gets a unique stripe
const projectColors = [
	'from-violet-500 to-indigo-500',
	'from-rose-500 to-pink-500',
	'from-emerald-500 to-teal-500',
	'from-amber-500 to-orange-500',
	'from-sky-500 to-blue-500',
	'from-fuchsia-500 to-purple-500',
]

const projects = ref([
	{
		id: 1,
		name: 'Tazko App',
		description: 'Main project management SaaS — frontend and backend development.',
		status: 'In Progress',
		priority: 'High',
		progress: 62,
		startDate: '2026-01-15',
		endDate: '2026-06-30',
		members: [
			{ name: 'Arif H', initials: 'AH', color: 'bg-accent' },
			{ name: 'Sara K', initials: 'SK', color: 'bg-violet-500' },
			{ name: 'Noman R', initials: 'NR', color: 'bg-emerald-500' },
		],
		taskCounts: { total: 48, done: 30 },
	},
	{
		id: 2,
		name: 'Backend Core',
		description: 'Laravel API, authentication, role & permission system.',
		status: 'In Progress',
		priority: 'Urgent',
		progress: 45,
		startDate: '2026-02-01',
		endDate: '2026-05-15',
		members: [
			{ name: 'Arif H', initials: 'AH', color: 'bg-accent' },
			{ name: 'Noman R', initials: 'NR', color: 'bg-emerald-500' },
		],
		taskCounts: { total: 32, done: 14 },
	},
	{
		id: 3,
		name: 'Documentation',
		description: 'Technical docs, API reference, and onboarding guides.',
		status: 'Planning',
		priority: 'Low',
		progress: 12,
		startDate: '2026-03-01',
		endDate: '2026-07-31',
		members: [
			{ name: 'Sara K', initials: 'SK', color: 'bg-violet-500' },
		],
		taskCounts: { total: 15, done: 2 },
	},
	{
		id: 4,
		name: 'Mobile App',
		description: 'React Native mobile client for iOS and Android.',
		status: 'Planning',
		priority: 'Medium',
		progress: 5,
		startDate: '2026-04-01',
		endDate: '2026-12-01',
		members: [
			{ name: 'Noman R', initials: 'NR', color: 'bg-emerald-500' },
			{ name: 'Sara K', initials: 'SK', color: 'bg-violet-500' },
			{ name: 'Arif H', initials: 'AH', color: 'bg-accent' },
		],
		taskCounts: { total: 8, done: 0 },
	},
	{
		id: 5,
		name: 'Design System',
		description: 'Component library, style guide, and Figma design tokens.',
		status: 'On Hold',
		priority: 'Medium',
		progress: 38,
		startDate: '2026-01-20',
		endDate: '2026-05-01',
		members: [
			{ name: 'Sara K', initials: 'SK', color: 'bg-violet-500' },
		],
		taskCounts: { total: 22, done: 8 },
	},
	{
		id: 6,
		name: 'QA & Testing',
		description: 'End-to-end testing suite with Playwright and PHPUnit.',
		status: 'Completed',
		priority: 'High',
		progress: 100,
		startDate: '2026-01-10',
		endDate: '2026-02-28',
		members: [
			{ name: 'Arif H', initials: 'AH', color: 'bg-accent' },
			{ name: 'Noman R', initials: 'NR', color: 'bg-emerald-500' },
		],
		taskCounts: { total: 20, done: 20 },
	},
])

const filteredProjects = computed(() => {
	return projects.value.filter(p => {
		const matchSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
			p.description.toLowerCase().includes(searchQuery.value.toLowerCase())
		const matchStatus = statusFilter.value === 'All' || p.status === statusFilter.value
		const matchPriority = priorityFilter.value === 'All' || p.priority === priorityFilter.value
		return matchSearch && matchStatus && matchPriority
	})
})

// Stats
const totalProjects = computed(() => projects.value.length)
const activeCount = computed(() => projects.value.filter(p => p.status === 'In Progress').length)
const completedCount = computed(() => projects.value.filter(p => p.status === 'Completed').length)
const onHoldCount = computed(() => projects.value.filter(p => p.status === 'On Hold').length)
const avgProgress = computed(() => Math.round(projects.value.reduce((a, p) => a + p.progress, 0) / projects.value.length))

const statusConfig = {
	'Planning': { cls: 'bg-slate-400/15 text-slate-500', dot: 'bg-slate-400' },
	'In Progress': { cls: 'bg-accent/10 text-accent', dot: 'bg-accent' },
	'On Hold': { cls: 'bg-amber-500/15 text-amber-600', dot: 'bg-amber-500' },
	'Completed': { cls: 'bg-emerald-500/15 text-emerald-600', dot: 'bg-emerald-500' },
}
const priorityConfig = {
	Urgent: { cls: 'bg-red-500/15 text-red-500', icon: '🔴' },
	High: { cls: 'bg-amber-500/15 text-amber-600', icon: '🟠' },
	Medium: { cls: 'bg-blue-500/15 text-blue-500', icon: '🔵' },
	Low: { cls: 'bg-slate-400/15 text-slate-500', icon: '⚪' },
}

const progressColor = (p) => {
	if (p >= 100) return 'bg-emerald-500'
	if (p >= 60) return 'bg-accent'
	if (p >= 30) return 'bg-amber-500'
	return 'bg-red-400'
}

const daysLeft = (endDate) => {
	const diff = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24))
	if (diff < 0) return { label: 'Overdue', cls: 'text-red-500' }
	if (diff === 0) return { label: 'Due today', cls: 'text-red-500' }
	if (diff <= 7) return { label: `${diff}d left`, cls: 'text-amber-500' }
	return { label: `${diff}d left`, cls: 'text-text/40' }
}

const formatDate = (d) => {
	return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const toggleMenu = (id) => { openMenuId.value = openMenuId.value === id ? null : id }

const createProject = () => {
	if (!newProject.value.name.trim()) return
	projects.value.push({
		id: Date.now(),
		...newProject.value,
		progress: 0,
		members: [],
		taskCounts: { total: 0, done: 0 },
	})
	newProject.value = { name: '', description: '', goal: '', priority: 'High', status: 'Planning', startDate: '', endDate: '' }
	showCreateModal.value = false
}
</script>

<template>
	<div class="pb-20 pt-8 px-1" @click="openMenuId = null">

		<!-- ── Header ─────────────────────────────────── -->
		<div class="mb-8 flex items-end justify-between gap-4 flex-wrap">
			<div>
				<p class="text-xs font-bold text-accent/70 tracking-[0.2em] uppercase mb-1.5">Workspace</p>
				<h1 class="text-heading leading-none mb-2">Projects</h1>
				<p class="text-sm text-text/80">Manage your team's work across all active projects.</p>
			</div>
			<button @click.stop="showCreateModal = true"
				class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 active:scale-95 transition-all shadow-lg shadow-accent/25">
				<v-icon name="bi-plus-circle" scale="0.9" />
				New Project
			</button>
		</div>

		<!-- ── Stat Cards ─────────────────────────────── -->
		<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
			<div class="bg-panel rounded-2xl border border-heading/5 p-4 flex items-center gap-3">
				<div class="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
					<v-icon name="md-folderspecial-outlined" class="text-accent" scale="1.1" />
				</div>
				<div>
					<p class="text-2xl font-bold text-heading leading-none">{{ totalProjects }}</p>
					<p class="text-xs text-text/40 mt-0.5">Total</p>
				</div>
			</div>
			<div class="bg-panel rounded-2xl border border-heading/5 p-4 flex items-center gap-3">
				<div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
					<v-icon name="bi-lightning-charge" class="text-blue-500" scale="1.0" />
				</div>
				<div>
					<p class="text-2xl font-bold text-heading leading-none">{{ activeCount }}</p>
					<p class="text-xs text-text/40 mt-0.5">Active</p>
				</div>
			</div>
			<div class="bg-panel rounded-2xl border border-heading/5 p-4 flex items-center gap-3">
				<div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
					<v-icon name="bi-check-circle" class="text-emerald-500" scale="1.1" />
				</div>
				<div>
					<p class="text-2xl font-bold text-heading leading-none">{{ completedCount }}</p>
					<p class="text-xs text-text/40 mt-0.5">Completed</p>
				</div>
			</div>
			<div class="bg-panel rounded-2xl border border-heading/5 p-4 flex items-center gap-3">
				<div class="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
					<v-icon name="bi-graph-up" class="text-violet-500" scale="1.0" />
				</div>
				<div>
					<p class="text-2xl font-bold text-heading leading-none">{{ avgProgress }}<span
							class="text-sm font-medium text-text/40">%</span></p>
					<p class="text-xs text-text/40 mt-0.5">Avg Progress</p>
				</div>
			</div>
		</div>

		<!-- ── Toolbar ────────────────────────────────── -->
		<div class="flex flex-wrap items-center gap-3 mb-6">
			<div class="relative flex-1 min-w-48">
				<v-icon name="bi-search" class="absolute left-3 top-1/2 -translate-y-1/2 text-text/30" scale="0.85" />
				<input v-model="searchQuery" type="text" placeholder="Search projects…"
					class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-heading/10 bg-panel text-sm text-heading placeholder-text/30 focus:outline-none focus:border-accent/50 transition-colors" />
				<button v-if="searchQuery" @click="searchQuery = ''"
					class="absolute right-3 top-1/2 -translate-y-1/2 text-text/30 hover:text-text/70 transition-colors">
					<v-icon name="bi-x-circle" scale="0.85" />
				</button>
			</div>

			<div class="relative">
				<select v-model="statusFilter"
					class="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-heading/10 bg-panel text-sm text-text/70 focus:outline-none focus:border-accent/50 transition-colors cursor-pointer">
					<option v-for="s in statuses" :key="s">{{ s }}</option>
				</select>
				<v-icon name="bi-chevron-down" scale="0.75"
					class="absolute right-2.5 top-1/2 -translate-y-1/2 text-text/40 pointer-events-none" />
			</div>

			<div class="relative">
				<select v-model="priorityFilter"
					class="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-heading/10 bg-panel text-sm text-text/70 focus:outline-none focus:border-accent/50 transition-colors cursor-pointer">
					<option v-for="p in priorities" :key="p">{{ p }}</option>
				</select>
				<v-icon name="bi-chevron-down" scale="0.75"
					class="absolute right-2.5 top-1/2 -translate-y-1/2 text-text/40 pointer-events-none" />
			</div>

			<div class="flex items-center gap-1 bg-panel border border-heading/10 rounded-xl p-1 ml-auto">
				<button @click="viewMode = 'grid'"
					:class="['w-8 h-8 rounded-lg flex items-center justify-center transition-all', viewMode === 'grid' ? 'bg-accent text-white shadow-sm' : 'text-text/40 hover:text-text/70']">
					<v-icon name="bi-grid-3x3-gap" scale="0.9" />
				</button>
				<button @click="viewMode = 'list'"
					:class="['w-8 h-8 rounded-lg flex items-center justify-center transition-all', viewMode === 'list' ? 'bg-accent text-white shadow-sm' : 'text-text/40 hover:text-text/70']">
					<v-icon name="bi-list-ul" scale="0.9" />
				</button>
			</div>
		</div>

		<!-- ── Active Filters ────────────────────────── -->
		<div v-if="statusFilter !== 'All' || priorityFilter !== 'All'" class="flex items-center gap-2 mb-5 flex-wrap">
			<span class="text-xs text-text/40 font-medium">Filters:</span>
			<span v-if="statusFilter !== 'All'"
				class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
				{{ statusFilter }}
				<button @click="statusFilter = 'All'" class="hover:text-accent/60 transition-colors">
					<v-icon name="bi-x-circle" scale="0.75" />
				</button>
			</span>
			<span v-if="priorityFilter !== 'All'"
				class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-semibold">
				{{ priorityFilter }} Priority
				<button @click="priorityFilter = 'All'" class="hover:text-amber-500/60 transition-colors">
					<v-icon name="bi-x-circle" scale="0.75" />
				</button>
			</span>
			<span class="text-xs text-text/30">{{ filteredProjects.length }} result{{ filteredProjects.length !== 1 ?
				's' : '' }}</span>
		</div>

		<!-- ── Empty State ────────────────────────────── -->
		<div v-if="filteredProjects.length === 0" class="text-center py-24">
			<div class="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-5">
				<v-icon name="md-folderspecial-outlined" class="text-accent" scale="2" />
			</div>
			<h3 class="text-lg font-bold text-heading mb-2">No projects found</h3>
			<p class="text-sm text-text/40 mb-6">Try adjusting your filters or create a new project.</p>
			<button @click="statusFilter = 'All'; priorityFilter = 'All'; searchQuery = ''"
				class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-heading/10 text-sm font-semibold text-text/60 hover:bg-heading/5 transition-colors">
				Clear filters
			</button>
		</div>

		<!-- ── GRID VIEW ──────────────────────────────── -->
		<div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
			<div v-for="(project, idx) in filteredProjects" :key="project.id"
				class="bg-panel rounded-2xl border border-heading/5 hover:shadow-xl hover:shadow-heading/5 hover:-translate-y-0.5 hover:border-accent/15 transition-all duration-200 group overflow-hidden flex flex-col cursor-pointer"
				@click="router.push({ name: 'project-detail', params: { id: project.id } })">

				<!-- Color stripe -->
				<div :class="`h-1 w-full bg-gradient-to-r ${projectColors[idx % projectColors.length]}`"></div>

				<!-- Card body -->
				<div class="p-5 flex-1">
					<div class="flex items-start justify-between mb-3">
						<div
							:class="`w-10 h-10 rounded-xl bg-gradient-to-br ${projectColors[idx % projectColors.length]} flex items-center justify-center shrink-0 shadow-sm`">
							<v-icon name="md-folderspecial-outlined" class="text-white" scale="1.0" />
						</div>
						<div class="flex items-center gap-1.5" @click.stop>
							<span
								:class="[statusConfig[project.status].cls, 'inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold']">
								<span :class="[statusConfig[project.status].dot, 'w-1.5 h-1.5 rounded-full']"></span>
								{{ project.status }}
							</span>
							<div class="relative">
								<button @click="toggleMenu(project.id)"
									class="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-heading/5 transition-colors text-text/25 hover:text-text/60">
									<v-icon name="bi-three-dots-vertical" scale="0.8" />
								</button>
								<Transition name="fade-drop">
									<div v-if="openMenuId === project.id"
										class="absolute right-0 top-full mt-1 w-40 bg-panel rounded-xl border border-heading/10 shadow-xl z-20 overflow-hidden">
										<button
											@click="router.push({ name: 'project-detail', params: { id: project.id } })"
											class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-text/70 hover:bg-heading/5 transition-colors">
											<v-icon name="bi-arrow-right" scale="0.85" /> Open
										</button>
										<button
											class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-text/70 hover:bg-heading/5 transition-colors">
											<v-icon name="bi-pencil" scale="0.85" /> Edit
										</button>
										<button
											class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-text/70 hover:bg-heading/5 transition-colors">
											<v-icon name="bi-archive" scale="0.85" /> Archive
										</button>
										<div class="h-px bg-heading/5 mx-2"></div>
										<button
											class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
											<v-icon name="bi-trash" scale="0.85" /> Delete
										</button>
									</div>
								</Transition>
							</div>
						</div>
					</div>

					<h3 class="font-bold text-heading text-sm mb-1 group-hover:text-accent transition-colors">{{
						project.name }}</h3>
					<p class="text-xs text-text/45 leading-relaxed line-clamp-2 mb-4">{{ project.description }}</p>

					<!-- Progress -->
					<div class="mb-4">
						<div class="flex items-center justify-between mb-1.5">
							<span class="text-[10px] font-bold text-text/40 uppercase tracking-wider">Progress</span>
							<span class="text-xs font-bold"
								:class="project.progress >= 100 ? 'text-emerald-500' : project.progress >= 60 ? 'text-accent' : 'text-text/60'">
								{{ project.progress }}%
							</span>
						</div>
						<div class="h-1.5 bg-heading/8 rounded-full overflow-hidden">
							<div :class="[progressColor(project.progress), 'h-full rounded-full transition-all duration-500']"
								:style="`width: ${project.progress}%`"></div>
						</div>
					</div>

					<!-- Task + Priority row -->
					<div class="flex items-center gap-2 flex-wrap">
						<span class="inline-flex items-center gap-1 text-[10px] text-text/40 font-medium">
							<v-icon name="bi-check-circle" scale="0.75" class="text-emerald-500" />
							{{ project.taskCounts.done }}/{{ project.taskCounts.total }} tasks
						</span>
						<span
							:class="[priorityConfig[project.priority].cls, 'text-[10px] px-2 py-0.5 rounded-full font-bold']">
							{{ project.priority }}
						</span>
					</div>
				</div>

				<!-- Card footer -->
				<div class="px-5 py-3 border-t border-heading/5 flex items-center justify-between bg-heading/[0.015]">
					<div class="flex -space-x-2">
						<div v-for="(m, i) in project.members.slice(0, 3)" :key="i"
							:class="[m.color, 'w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold border-2 border-panel']"
							:title="m.name">
							{{ m.initials }}
						</div>
						<div v-if="project.members.length > 3"
							class="w-7 h-7 rounded-full bg-heading/10 flex items-center justify-center text-[9px] font-bold border-2 border-panel text-text/80">
							+{{ project.members.length - 3 }}
						</div>
					</div>
					<div class="flex items-center gap-1.5 text-[10px]" :class="daysLeft(project.endDate).cls">
						<v-icon name="bi-calendar3" scale="0.75" />
						{{ daysLeft(project.endDate).label }}
					</div>
				</div>
			</div>
		</div>

		<!-- ── LIST VIEW ──────────────────────────────── -->
		<div v-else class="bg-panel rounded-2xl border border-heading/5 overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b border-heading/5 bg-heading/[0.02]">
							<th
								class="text-left px-5 py-3.5 text-[10px] font-bold text-text/40 uppercase tracking-wider">
								Project</th>
							<th
								class="text-left px-4 py-3.5 text-[10px] font-bold text-text/40 uppercase tracking-wider">
								Status</th>
							<th
								class="text-left px-4 py-3.5 text-[10px] font-bold text-text/40 uppercase tracking-wider">
								Priority</th>
							<th
								class="text-left px-4 py-3.5 text-[10px] font-bold text-text/40 uppercase tracking-wider w-36">
								Progress</th>
							<th
								class="text-left px-4 py-3.5 text-[10px] font-bold text-text/40 uppercase tracking-wider">
								Tasks</th>
							<th
								class="text-left px-4 py-3.5 text-[10px] font-bold text-text/40 uppercase tracking-wider">
								Team</th>
							<th
								class="text-left px-4 py-3.5 text-[10px] font-bold text-text/40 uppercase tracking-wider">
								Due</th>
							<th class="px-4 py-3.5"></th>
						</tr>
					</thead>
					<tbody class="divide-y divide-heading/5">
						<tr v-for="(project, idx) in filteredProjects" :key="project.id"
							class="hover:bg-heading/[0.015] transition-colors cursor-pointer group"
							@click="router.push({ name: 'project-detail', params: { id: project.id } })">
							<td class="px-5 py-4">
								<div class="flex items-center gap-3">
									<div
										:class="`w-8 h-8 rounded-xl bg-gradient-to-br ${projectColors[idx % projectColors.length]} flex items-center justify-center shrink-0`">
										<v-icon name="md-folderspecial-outlined" class="text-white" scale="0.85" />
									</div>
									<div>
										<p
											class="text-sm font-semibold text-heading group-hover:text-accent transition-colors">
											{{ project.name }}</p>
										<p class="text-[10px] text-text/40 line-clamp-1 max-w-xs">{{ project.description
										}}</p>
									</div>
								</div>
							</td>
							<td class="px-4 py-4">
								<span
									:class="[statusConfig[project.status].cls, 'inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold']">
									<span
										:class="[statusConfig[project.status].dot, 'w-1.5 h-1.5 rounded-full']"></span>
									{{ project.status }}
								</span>
							</td>
							<td class="px-4 py-4">
								<span
									:class="[priorityConfig[project.priority].cls, 'text-xs px-2.5 py-1 rounded-full font-semibold']">
									{{ project.priority }}
								</span>
							</td>
							<td class="px-4 py-4">
								<div class="flex items-center gap-2">
									<div class="flex-1 h-1.5 bg-heading/8 rounded-full overflow-hidden min-w-16">
										<div :class="[progressColor(project.progress), 'h-full rounded-full transition-all']"
											:style="`width: ${project.progress}%`"></div>
									</div>
									<span class="text-[10px] font-bold text-text/80 w-8 text-right">{{ project.progress
									}}%</span>
								</div>
							</td>
							<td class="px-4 py-4">
								<span class="text-xs text-text/80 font-medium">{{ project.taskCounts.done }}/{{
									project.taskCounts.total }}</span>
							</td>
							<td class="px-4 py-4">
								<div class="flex -space-x-1.5">
									<div v-for="(m, i) in project.members.slice(0, 3)" :key="i"
										:class="[m.color, 'w-6 h-6 rounded-full border-2 border-panel flex items-center justify-center text-white text-[8px] font-bold']"
										:title="m.name">
										{{ m.initials }}
									</div>
									<div v-if="project.members.length > 3"
										class="w-6 h-6 rounded-full bg-heading/10 border-2 border-panel flex items-center justify-center text-[8px] font-bold text-text/80">
										+{{ project.members.length - 3 }}
									</div>
								</div>
							</td>
							<td class="px-4 py-4">
								<span class="text-xs font-medium" :class="daysLeft(project.endDate).cls">
									{{ daysLeft(project.endDate).label }}
								</span>
							</td>
							<td class="px-4 py-4" @click.stop>
								<div class="relative">
									<button @click="toggleMenu(project.id)"
										class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-heading/5 transition-colors text-text/30">
										<v-icon name="bi-three-dots-vertical" scale="0.85" />
									</button>
									<Transition name="fade-drop">
										<div v-if="openMenuId === project.id"
											class="absolute right-0 top-full mt-1 w-40 bg-panel rounded-xl border border-heading/10 shadow-xl z-20 overflow-hidden">
											<button
												class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-text/70 hover:bg-heading/5 transition-colors">
												<v-icon name="bi-pencil" scale="0.85" /> Edit
											</button>
											<button
												class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-text/70 hover:bg-heading/5 transition-colors">
												<v-icon name="bi-archive" scale="0.85" /> Archive
											</button>
											<button
												class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
												<v-icon name="bi-trash" scale="0.85" /> Delete
											</button>
										</div>
									</Transition>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<!-- ── Create Modal ───────────────────────────── -->
		<Transition name="modal">
			<div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4"
				@click.self="showCreateModal = false">
				<div class="absolute inset-0 bg-heading/50 backdrop-blur-sm"></div>
				<div class="relative bg-panel rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">

					<!-- Modal header with gradient -->
					<div
						class="bg-gradient-to-r from-accent/10 to-violet-500/10 border-b border-heading/8 px-6 pt-6 pb-5">
						<div class="flex items-center justify-between">
							<div>
								<h2 class="text-xl font-bold text-heading leading-none">New Project</h2>
								<p class="text-sm text-text/40 mt-1">Set up a new workspace for your team.</p>
							</div>
							<button @click="showCreateModal = false"
								class="w-8 h-8 rounded-lg flex items-center justify-center text-text/30 hover:text-text/70 hover:bg-heading/5 transition-colors">
								<v-icon name="bi-x-circle" scale="1" />
							</button>
						</div>
					</div>

					<!-- Modal body -->
					<div class="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
						<div>
							<label class="block text-xs font-bold text-text/80 uppercase tracking-wider mb-1.5">Project
								Name *</label>
							<input v-model="newProject.name" type="text" placeholder="e.g. Marketing Website"
								class="input-field rounded-xl border-heading/15 focus:border-accent" />
						</div>
						<div>
							<label
								class="block text-xs font-bold text-text/80 uppercase tracking-wider mb-1.5">Description</label>
							<textarea v-model="newProject.description" rows="2"
								placeholder="Brief description of the project…"
								class="input-field rounded-xl border-heading/15 focus:border-accent resize-none"></textarea>
						</div>
						<div>
							<label
								class="block text-xs font-bold text-text/80 uppercase tracking-wider mb-1.5">Goal</label>
							<input v-model="newProject.goal" type="text" placeholder="What does success look like?"
								class="input-field rounded-xl border-heading/15 focus:border-accent" />
						</div>
						<div class="grid grid-cols-2 gap-3">
							<div>
								<label
									class="block text-xs font-bold text-text/80 uppercase tracking-wider mb-1.5">Priority</label>
								<select v-model="newProject.priority" class="input-field rounded-xl border-heading/15">
									<option>Urgent</option>
									<option>High</option>
									<option>Medium</option>
									<option>Low</option>
								</select>
							</div>
							<div>
								<label
									class="block text-xs font-bold text-text/80 uppercase tracking-wider mb-1.5">Status</label>
								<select v-model="newProject.status" class="input-field rounded-xl border-heading/15">
									<option>Planning</option>
									<option>In Progress</option>
									<option>On Hold</option>
								</select>
							</div>
						</div>
						<div class="grid grid-cols-2 gap-3">
							<div>
								<label
									class="block text-xs font-bold text-text/80 uppercase tracking-wider mb-1.5">Start
									Date</label>
								<input v-model="newProject.startDate" type="date"
									class="input-field rounded-xl border-heading/15" />
							</div>
							<div>
								<label class="block text-xs font-bold text-text/80 uppercase tracking-wider mb-1.5">End
									Date</label>
								<input v-model="newProject.endDate" type="date"
									class="input-field rounded-xl border-heading/15" />
							</div>
						</div>
					</div>

					<!-- Modal footer -->
					<div class="px-6 py-4 border-t border-heading/8 flex items-center gap-3 bg-heading/[0.01]">
						<button @click="showCreateModal = false"
							class="flex-1 py-2.5 rounded-xl border border-heading/15 text-sm font-semibold text-text/80 hover:bg-heading/5 transition-colors">
							Cancel
						</button>
						<button @click="createProject" :disabled="!newProject.name.trim()"
							class="flex-1 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 active:scale-95 transition-all shadow-md shadow-accent/20 disabled:opacity-40 disabled:cursor-not-allowed">
							Create Project
						</button>
					</div>
				</div>
			</div>
		</Transition>
	</div>
</template>

<style scoped>
.fade-drop-enter-active,
.fade-drop-leave-active {
	transition: all 0.15s ease;
}

.fade-drop-enter-from,
.fade-drop-leave-to {
	opacity: 0;
	transform: translateY(-6px);
}

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
	transform: scale(0.96);
}

.line-clamp-2 {
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.line-clamp-1 {
	display: -webkit-box;
	-webkit-line-clamp: 1;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
</style>