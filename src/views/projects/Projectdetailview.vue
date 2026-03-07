<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { addIcons } from 'oh-vue-icons'
import {
	BiArrowLeft, BiPencil, BiThreeDotsVertical, BiArchive,
	BiTrash, BiPlusCircle, BiCheckCircle, BiClock, BiPeople,
	BiCalendar3, BiFlag, BiSearch, BiXCircle, BiLayoutWtf,
	BiCardList, BiChevronDown, BiPersonPlus, BiBarChart,
	BiLightningCharge, BiActivity, BiFilter, BiCircle,
	BiArrowRepeat, BiCheck2Circle, BiExclamationCircle,
	MdFolderspecialOutlined, BiChevronRight, BiStar,
	BiListTask, BiKanban, BiGripVertical,
} from 'oh-vue-icons/icons'

addIcons(
	BiArrowLeft, BiPencil, BiThreeDotsVertical, BiArchive,
	BiTrash, BiPlusCircle, BiCheckCircle, BiClock, BiPeople,
	BiCalendar3, BiFlag, BiSearch, BiXCircle, BiLayoutWtf,
	BiCardList, BiChevronDown, BiPersonPlus, BiBarChart,
	BiLightningCharge, BiActivity, BiFilter, BiCircle,
	BiArrowRepeat, BiCheck2Circle, BiExclamationCircle,
	MdFolderspecialOutlined, BiChevronRight, BiStar,
	BiListTask, BiKanban, BiGripVertical,
)

const router = useRouter()
const route = useRoute()

// ── Project data ──────────────────────────────────────
const project = ref({
	id: route.params.id,
	name: 'Tazko App',
	description: 'Main project management SaaS — full-stack development including Vue.js frontend, Laravel API backend, authentication, role & permission system, and task management.',
	status: 'In Progress',
	priority: 'High',
	progress: 62,
	startDate: '2026-01-15',
	endDate: '2026-06-30',
	goal: 'Build a complete, production-ready project management platform for teams of all sizes.',
	members: [
		{ name: 'Arif Hossain', initials: 'AH', color: 'bg-accent', role: 'Project Manager', email: 'arif@tazko.io' },
		{ name: 'Sara Khan', initials: 'SK', color: 'bg-violet-500', role: 'Frontend Developer', email: 'sara@tazko.io' },
		{ name: 'Noman Rahman', initials: 'NR', color: 'bg-emerald-500', role: 'Backend Developer', email: 'noman@tazko.io' },
		{ name: 'Dina Malik', initials: 'DM', color: 'bg-amber-500', role: 'UI/UX Designer', email: 'dina@tazko.io' },
		{ name: 'Karim Uddin', initials: 'KU', color: 'bg-red-400', role: 'QA Engineer', email: 'karim@tazko.io' },
	],
})

// ── Tasks ─────────────────────────────────────────────
const tasks = ref([
	{ id: 1, title: 'Set up project scaffolding and repo', status: 'Done', priority: 'High', assignee: 'AH', due: '2026-01-18' },
	{ id: 2, title: 'Design authentication flow (Login/Register)', status: 'Done', priority: 'High', assignee: 'SK', due: '2026-01-22' },
	{ id: 3, title: 'Implement JWT/Sanctum backend auth', status: 'Done', priority: 'Urgent', assignee: 'NR', due: '2026-01-25' },
	{ id: 4, title: 'Build role & permission RBAC system', status: 'Done', priority: 'High', assignee: 'NR', due: '2026-02-05' },
	{ id: 5, title: 'Dashboard UI & analytics widgets', status: 'In Progress', priority: 'High', assignee: 'SK', due: '2026-03-10' },
	{ id: 6, title: 'Project management CRUD module', status: 'In Progress', priority: 'Urgent', assignee: 'AH', due: '2026-03-15' },
	{ id: 7, title: 'Task management with Kanban board', status: 'Todo', priority: 'High', assignee: 'SK', due: '2026-03-25' },
	{ id: 8, title: 'File upload and preview system', status: 'Todo', priority: 'Medium', assignee: 'DM', due: '2026-04-05' },
	{ id: 9, title: 'In-app notification system', status: 'Todo', priority: 'Medium', assignee: 'NR', due: '2026-04-15' },
	{ id: 10, title: 'Time tracking module', status: 'Todo', priority: 'Low', assignee: 'KU', due: '2026-05-01' },
])

// ── Config maps ───────────────────────────────────────
const statusConfig = {
	'Planning': { cls: 'bg-slate-100 text-slate-600 dark:bg-slate-700/40 dark:text-slate-400', dot: 'bg-slate-400' },
	'In Progress': { cls: 'bg-accent/10 text-accent', dot: 'bg-accent animate-pulse' },
	'On Hold': { cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-amber-500' },
	'Completed': { cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dot: 'bg-emerald-500' },
}

const taskStatusConfig = {
	'Done': { cls: 'bg-emerald-500/10 text-emerald-600', dot: 'bg-emerald-500', icon: 'bi-check2-circle' },
	'In Progress': { cls: 'bg-accent/10 text-accent', dot: 'bg-accent', icon: 'bi-arrow-repeat' },
	'Review': { cls: 'bg-violet-500/10 text-violet-600', dot: 'bg-violet-500', icon: 'bi-exclamation-circle' },
	'Todo': { cls: 'bg-slate-100 text-slate-600 dark:bg-slate-700/40 dark:text-slate-400', dot: 'bg-slate-400', icon: 'bi-circle' },
}

const priorityConfig = {
	'Urgent': { cls: 'bg-red-500/10 text-red-500', dot: '🔴' },
	'High': { cls: 'bg-orange-500/10 text-orange-500', dot: '🟠' },
	'Medium': { cls: 'bg-amber-500/10 text-amber-600', dot: '🟡' },
	'Low': { cls: 'bg-slate-100 text-slate-500 dark:bg-slate-700/40', dot: '⚪' },
}

const memberColorMap = Object.fromEntries(
	project.value.members.map(m => [m.initials, m.color])
)

// ── Task filtering ─────────────────────────────────────
const searchQuery = ref('')
const statusFilter = ref('All')
const priorityFilter = ref('All')
const viewMode = ref('list') // 'list' | 'board'
const showAddTask = ref(false)
const newTaskTitle = ref('')

const filteredTasks = computed(() => {
	return tasks.value.filter(t => {
		const matchSearch = !searchQuery.value || t.title.toLowerCase().includes(searchQuery.value.toLowerCase())
		const matchStatus = statusFilter.value === 'All' || t.status === statusFilter.value
		const matchPriority = priorityFilter.value === 'All' || t.priority === priorityFilter.value
		return matchSearch && matchStatus && matchPriority
	})
})

const tasksByStatus = computed(() => {
	const groups = { 'Todo': [], 'In Progress': [], 'Review': [], 'Done': [] }
	filteredTasks.value.forEach(t => {
		if (groups[t.status]) groups[t.status].push(t)
	})
	return groups
})

// ── Stats ──────────────────────────────────────────────
const totalTasks = computed(() => tasks.value.length)
const doneCount = computed(() => tasks.value.filter(t => t.status === 'Done').length)
const inProgressCount = computed(() => tasks.value.filter(t => t.status === 'In Progress').length)
const todoCount = computed(() => tasks.value.filter(t => t.status === 'Todo').length)
const overdueCount = computed(() => {
	const now = new Date()
	return tasks.value.filter(t => t.status !== 'Done' && new Date(t.due) < now).length
})

// ── Timeline ───────────────────────────────────────────
const daysLeft = computed(() => {
	const end = new Date(project.value.endDate)
	const now = new Date()
	return Math.ceil((end - now) / (1000 * 60 * 60 * 24))
})

const todayPercent = computed(() => {
	const start = new Date(project.value.startDate)
	const end = new Date(project.value.endDate)
	const now = new Date()
	const total = end - start
	const elapsed = now - start
	return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
})

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const formatShort = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

// ── Actions ────────────────────────────────────────────
const addTask = () => {
	if (!newTaskTitle.value.trim()) return
	tasks.value.push({
		id: Date.now(),
		title: newTaskTitle.value.trim(),
		status: 'Todo',
		priority: 'Medium',
		assignee: 'AH',
		due: '',
	})
	newTaskTitle.value = ''
	showAddTask.value = false
}

const openTask = (taskId) => {
	router.push({ name: 'task-detail', params: { id: route.params.id, taskId } })
}

// ── Sidebar collapse ───────────────────────────────────
const sidebarCollapsed = ref(false)

// ── Recent activity ────────────────────────────────────
const recentActivity = [
	{ initials: 'SK', color: 'bg-violet-500', text: 'Updated Dashboard UI task to In Progress', time: '2h ago' },
	{ initials: 'NR', color: 'bg-emerald-500', text: 'Completed JWT auth implementation', time: '5h ago' },
	{ initials: 'AH', color: 'bg-accent', text: 'Added 3 new tasks to the board', time: '1d ago' },
	{ initials: 'DM', color: 'bg-amber-500', text: 'Uploaded new design mockups', time: '2d ago' },
]
</script>

<template>
	<div class="min-h-screen pb-20">

		<!-- ════════════════════════════════════════════ -->
		<!-- PROJECT HERO HEADER                         -->
		<!-- ════════════════════════════════════════════ -->
		<div class="relative overflow-hidden rounded-2xl mb-6 mt-6">
			<!-- Gradient background -->
			<div
				class="absolute inset-0 bg-gradient-to-br from-accent/20 via-violet-500/10 to-indigo-500/5 rounded-2xl" />
			<div class="absolute inset-0 bg-panel/80 backdrop-blur-sm rounded-2xl border border-heading/8" />

			<!-- Decorative circles -->
			<div class="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-accent/5 blur-2xl pointer-events-none" />
			<div
				class="absolute right-24 -bottom-8 w-32 h-32 rounded-full bg-violet-500/8 blur-xl pointer-events-none" />

			<div class="relative p-6 md:p-8">
				<!-- Breadcrumb -->
				<div class="flex items-center gap-1.5 text-xs text-text/40 mb-5">
					<button @click="router.push({ name: 'projects' })"
						class="hover:text-accent transition-colors font-medium">Projects</button>
					<v-icon name="bi-chevron-right" scale="0.75" />
					<span class="text-text/60 font-semibold">{{ project.name }}</span>
				</div>

				<div class="flex flex-wrap gap-6 items-start justify-between">
					<!-- Left: Icon + Title + Meta -->
					<div class="flex items-start gap-4 flex-1 min-w-0">
						<div
							class="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-violet-600 flex items-center justify-center shrink-0 shadow-xl shadow-accent/30">
							<v-icon name="md-folderspecial-outlined" class="text-white" scale="1.5" />
						</div>
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-2.5 flex-wrap mb-2">
								<h1 class="text-2xl font-bold text-heading leading-none">{{ project.name }}</h1>
								<span
									:class="[statusConfig[project.status]?.cls, 'inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-bold border border-current/10']">
									<span
										:class="[statusConfig[project.status]?.dot, 'w-1.5 h-1.5 rounded-full']"></span>
									{{ project.status }}
								</span>
								<span
									:class="[priorityConfig[project.priority]?.cls, 'text-xs px-2.5 py-1 rounded-full font-bold border border-current/10']">
									{{ project.priority }}
								</span>
							</div>
							<p class="text-sm text-text/80 leading-relaxed max-w-2xl mb-4">{{ project.description }}</p>

							<!-- Progress + dates row -->
							<div class="flex flex-wrap items-center gap-5">
								<!-- Progress bar -->
								<div class="flex items-center gap-3 min-w-48">
									<div class="flex-1 h-1.5 bg-heading/10 rounded-full overflow-hidden">
										<div class="h-full bg-gradient-to-r from-accent to-violet-500 rounded-full transition-all duration-700"
											:style="`width:${project.progress}%`" />
									</div>
									<span class="text-xs font-bold text-heading tabular-nums">{{ project.progress
									}}%</span>
								</div>

								<!-- Dates -->
								<div class="flex items-center gap-1.5 text-xs text-text/40">
									<v-icon name="bi-calendar3" scale="0.8" />
									<span>{{ formatDate(project.startDate) }}</span>
									<span class="text-text/20 mx-0.5">→</span>
									<span>{{ formatDate(project.endDate) }}</span>
								</div>

								<!-- Days left -->
								<div class="flex items-center gap-1.5 text-xs"
									:class="daysLeft <= 14 ? 'text-amber-500 font-semibold' : 'text-text/40'">
									<v-icon name="bi-clock" scale="0.8" />
									{{ daysLeft > 0 ? `${daysLeft} days left` : 'Overdue' }}
								</div>

								<!-- Member avatars -->
								<div class="flex items-center -space-x-1.5">
									<div v-for="m in project.members.slice(0, 4)" :key="m.initials"
										:class="[m.color, 'w-6 h-6 rounded-full border-2 border-panel flex items-center justify-center text-white text-[9px] font-bold shadow-sm']"
										:title="m.name">
										{{ m.initials }}
									</div>
									<div v-if="project.members.length > 4"
										class="w-6 h-6 rounded-full border-2 border-panel bg-heading/10 flex items-center justify-center text-text/80 text-[9px] font-bold">
										+{{ project.members.length - 4 }}
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Right: Actions -->
					<div class="flex items-center gap-2 shrink-0">
						<button
							class="p-2 rounded-xl hover:bg-heading/8 text-text/40 hover:text-heading transition-colors">
							<v-icon name="bi-pencil" scale="0.9" />
						</button>
						<button
							class="p-2 rounded-xl hover:bg-heading/8 text-text/40 hover:text-heading transition-colors">
							<v-icon name="bi-archive" scale="0.9" />
						</button>
						<button
							class="p-2 rounded-xl hover:bg-red-500/10 text-text/40 hover:text-red-500 transition-colors">
							<v-icon name="bi-trash" scale="0.9" />
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- ════════════════════════════════════════════ -->
		<!-- BODY: SIDEBAR + TASKS                       -->
		<!-- ════════════════════════════════════════════ -->
		<div class="flex gap-5 items-start">

			<!-- ══════════════════════════════════════ -->
			<!-- SIDEBAR                               -->
			<!-- ══════════════════════════════════════ -->
			<aside
				:class="[sidebarCollapsed ? 'w-10' : 'w-72', 'shrink-0 transition-all duration-300 self-start sticky top-24 space-y-4']">

				<!-- Collapse toggle -->
				<button @click="sidebarCollapsed = !sidebarCollapsed"
					class="w-full flex items-center justify-between text-xs font-semibold text-text/40 hover:text-accent transition-colors mb-1 group">
					<span v-if="!sidebarCollapsed" class="uppercase tracking-widest">Project Info</span>
					<span
						:class="[sidebarCollapsed ? 'rotate-180' : '', 'transition-transform duration-300 w-6 h-6 rounded-lg bg-heading/5 group-hover:bg-accent/10 flex items-center justify-center']">
						<v-icon name="bi-chevron-right" scale="0.75"
							:class="sidebarCollapsed ? 'text-accent' : 'text-text/40'" />
					</span>
				</button>

				<template v-if="!sidebarCollapsed">
					<!-- Goal -->
					<div class="bg-panel rounded-2xl border border-heading/5 p-4">
						<h3
							class="text-[10px] font-bold uppercase tracking-widest text-text/35 mb-2.5 flex items-center gap-1.5">
							<v-icon name="bi-star" scale="0.75" class="text-amber-500" />
							Goal
						</h3>
						<p class="text-xs text-text/60 leading-relaxed">{{ project.goal }}</p>
					</div>

					<!-- Task stats -->
					<div class="bg-panel rounded-2xl border border-heading/5 p-4">
						<h3
							class="text-[10px] font-bold uppercase tracking-widest text-text/35 mb-3 flex items-center gap-1.5">
							<v-icon name="bi-bar-chart" scale="0.75" class="text-accent" />
							Progress
						</h3>
						<div class="space-y-2.5">
							<div v-for="(count, label, i) in { 'Done': doneCount, 'In Progress': inProgressCount, 'To Do': todoCount }"
								:key="label">
								<div class="flex items-center justify-between mb-1">
									<span class="text-[11px] font-semibold text-text/80">{{ label }}</span>
									<span class="text-[11px] text-text/35 tabular-nums">{{ count }}/{{ totalTasks
									}}</span>
								</div>
								<div class="h-1.5 bg-heading/8 rounded-full overflow-hidden">
									<div class="h-full rounded-full transition-all duration-500" :class="{
										'bg-emerald-500': label === 'Done',
										'bg-accent': label === 'In Progress',
										'bg-slate-300 dark:bg-slate-600': label === 'To Do',
									}" :style="`width: ${totalTasks ? (count / totalTasks) * 100 : 0}%`" />
								</div>
							</div>
						</div>
						<div class="mt-3 pt-3 border-t border-heading/5 flex items-center justify-between">
							<span class="text-[11px] text-text/40">Overall progress</span>
							<span class="text-sm font-bold text-heading tabular-nums">{{ project.progress }}%</span>
						</div>
					</div>

					<!-- Timeline -->
					<div class="bg-panel rounded-2xl border border-heading/5 p-4">
						<h3
							class="text-[10px] font-bold uppercase tracking-widest text-text/35 mb-3 flex items-center gap-1.5">
							<v-icon name="bi-calendar3" scale="0.75" class="text-violet-500" />
							Timeline
						</h3>
						<div class="flex items-center justify-between text-[10px] text-text/40 mb-2">
							<span>{{ formatShort(project.startDate) }}</span>
							<span>{{ formatShort(project.endDate) }}</span>
						</div>
						<div class="relative h-2 bg-heading/8 rounded-full overflow-visible mb-3">
							<div class="h-full bg-gradient-to-r from-accent to-violet-500 rounded-full"
								:style="`width:${project.progress}%`" />
							<!-- Today marker -->
							<div class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
								:style="`left:${todayPercent}%`">
								<div class="w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-panel shadow-sm" />
							</div>
						</div>
						<div class="flex items-center gap-1.5 text-[10px] text-amber-500 font-semibold">
							<span class="w-2 h-2 rounded-full bg-amber-400 inline-block" />
							Today · {{ daysLeft > 0 ? `${daysLeft} days remaining` : 'Past deadline' }}
						</div>
					</div>

					<!-- Members -->
					<div class="bg-panel rounded-2xl border border-heading/5 p-4">
						<div class="flex items-center justify-between mb-3">
							<h3
								class="text-[10px] font-bold uppercase tracking-widest text-text/35 flex items-center gap-1.5">
								<v-icon name="bi-people" scale="0.75" class="text-emerald-500" />
								Team ({{ project.members.length }})
							</h3>
							<button class="text-text/30 hover:text-accent transition-colors">
								<v-icon name="bi-person-plus" scale="0.85" />
							</button>
						</div>
						<div class="space-y-2">
							<div v-for="m in project.members" :key="m.initials"
								class="flex items-center gap-2.5 group cursor-pointer">
								<div
									:class="[m.color, 'w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm']">
									{{ m.initials }}
								</div>
								<div class="min-w-0 flex-1">
									<p class="text-xs font-semibold text-heading/80 truncate">{{ m.name }}</p>
									<p class="text-[10px] text-text/35 truncate">{{ m.role }}</p>
								</div>
							</div>
						</div>
					</div>

					<!-- Recent Activity -->
					<div class="bg-panel rounded-2xl border border-heading/5 p-4">
						<h3
							class="text-[10px] font-bold uppercase tracking-widest text-text/35 mb-3 flex items-center gap-1.5">
							<v-icon name="bi-activity" scale="0.75" class="text-accent" />
							Activity
						</h3>
						<div class="space-y-3">
							<div v-for="(item, i) in recentActivity" :key="i" class="flex items-start gap-2.5">
								<div
									:class="[item.color, 'w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 mt-0.5']">
									{{ item.initials }}
								</div>
								<div class="min-w-0">
									<p class="text-[11px] text-text/60 leading-relaxed">{{ item.text }}</p>
									<p class="text-[10px] text-text/30 mt-0.5">{{ item.time }}</p>
								</div>
							</div>
						</div>
					</div>
				</template>
			</aside>

			<!-- ══════════════════════════════════════ -->
			<!-- MAIN: TASKS                           -->
			<!-- ══════════════════════════════════════ -->
			<div class="flex-1 min-w-0">

				<!-- Task stats row -->
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
					<div v-for="(stat, i) in [
						{ label: 'Total', value: totalTasks, icon: 'bi-list-task', cls: 'text-heading', bg: 'bg-heading/5' },
						{ label: 'In Progress', value: inProgressCount, icon: 'bi-lightning-charge', cls: 'text-accent', bg: 'bg-accent/10' },
						{ label: 'Done', value: doneCount, icon: 'bi-check-circle', cls: 'text-emerald-500', bg: 'bg-emerald-500/10' },
						{ label: 'Overdue', value: overdueCount, icon: 'bi-clock', cls: overdueCount ? 'text-red-500' : 'text-text/40', bg: overdueCount ? 'bg-red-500/10' : 'bg-heading/5' },
					]" :key="stat.label" class="bg-panel rounded-xl border border-heading/5 px-4 py-3 flex items-center gap-3">
						<div :class="[stat.bg, 'w-8 h-8 rounded-lg flex items-center justify-center shrink-0']">
							<v-icon :name="stat.icon" :class="stat.cls" scale="0.9" />
						</div>
						<div>
							<p :class="[stat.cls, 'text-xl font-bold leading-none tabular-nums']">{{ stat.value }}</p>
							<p class="text-[10px] text-text/35 mt-0.5">{{ stat.label }}</p>
						</div>
					</div>
				</div>

				<!-- Toolbar -->
				<div class="bg-panel rounded-2xl border border-heading/5 p-3.5 mb-4">
					<div class="flex flex-wrap items-center gap-2.5">
						<!-- Search -->
						<div class="relative flex-1 min-w-40">
							<v-icon name="bi-search"
								class="absolute left-3 top-1/2 -translate-y-1/2 text-text/30 pointer-events-none"
								scale="0.85" />
							<input v-model="searchQuery" type="text" placeholder="Search tasks…"
								class="w-full pl-9 pr-8 py-2 rounded-xl border border-heading/8 bg-heading/3 text-sm text-heading placeholder-text/30 focus:outline-none focus:border-accent/40 transition-colors" />
							<button v-if="searchQuery" @click="searchQuery = ''"
								class="absolute right-2.5 top-1/2 -translate-y-1/2 text-text/30 hover:text-text/60">
								<v-icon name="bi-x-circle" scale="0.8" />
							</button>
						</div>

						<!-- Status filter -->
						<select v-model="statusFilter"
							:class="['appearance-none pl-3 pr-7 py-2 rounded-xl border text-sm focus:outline-none transition-colors cursor-pointer',
								statusFilter !== 'All' ? 'border-accent/30 bg-accent/8 text-accent font-semibold' : 'border-heading/8 bg-heading/3 text-text/80 hover:text-text/80']">
							<option v-for="s in ['All', 'Todo', 'In Progress', 'Review', 'Done']" :key="s" :value="s">
								{{ s === 'All' ? 'All Status' : s }}
							</option>
						</select>

						<!-- Priority filter -->
						<select v-model="priorityFilter"
							:class="['appearance-none pl-3 pr-7 py-2 rounded-xl border text-sm focus:outline-none transition-colors cursor-pointer',
								priorityFilter !== 'All' ? 'border-accent/30 bg-accent/8 text-accent font-semibold' : 'border-heading/8 bg-heading/3 text-text/80 hover:text-text/80']">
							<option v-for="p in ['All', 'Urgent', 'High', 'Medium', 'Low']" :key="p" :value="p">
								{{ p === 'All' ? 'All Priority' : p }}
							</option>
						</select>

						<!-- Spacer -->
						<div class="flex-1 hidden sm:block" />

						<!-- View toggle -->
						<div class="flex items-center gap-1 bg-heading/5 rounded-xl p-1">
							<button @click="viewMode = 'list'" :class="[
								viewMode === 'list' ? 'bg-panel text-heading shadow-sm' : 'text-text/40 hover:text-text/70',
								'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5'
							]">
								<v-icon name="bi-list-task" scale="0.85" />
								List
							</button>
							<button @click="viewMode = 'board'" :class="[
								viewMode === 'board' ? 'bg-panel text-heading shadow-sm' : 'text-text/40 hover:text-text/70',
								'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5'
							]">
								<v-icon name="bi-kanban" scale="0.85" />
								Board
							</button>
						</div>

						<!-- Add task -->
						<button @click="showAddTask = true"
							class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 active:scale-95 transition-all shadow-md shadow-accent/20">
							<v-icon name="bi-plus-circle" scale="0.9" />
							Add Task
						</button>
					</div>

					<!-- Inline add task row -->
					<div v-if="showAddTask" class="mt-3 pt-3 border-t border-heading/5 flex items-center gap-2.5">
						<input v-model="newTaskTitle" @keydown.enter="addTask" @keydown.esc="showAddTask = false"
							type="text" placeholder="Task title… (Enter to save, Esc to cancel)"
							class="flex-1 px-3.5 py-2 rounded-xl border border-accent/30 bg-accent/5 text-sm text-heading placeholder-text/30 focus:outline-none focus:border-accent/60 transition-colors"
							autofocus />
						<button @click="addTask"
							class="px-4 py-2 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors">
							Save
						</button>
						<button @click="showAddTask = false; newTaskTitle = ''"
							class="px-3 py-2 rounded-xl border border-heading/10 text-text/80 text-sm hover:text-heading transition-colors">
							Cancel
						</button>
					</div>
				</div>

				<!-- ── LIST VIEW ──────────────────────────── -->
				<div v-if="viewMode === 'list'">
					<div v-if="filteredTasks.length === 0"
						class="bg-panel rounded-2xl border border-heading/5 p-12 text-center">
						<v-icon name="bi-list-task" class="text-text/15 mx-auto mb-3" scale="2.5" />
						<p class="text-sm font-semibold text-text/40">No tasks found</p>
						<p class="text-xs text-text/25 mt-1">Try adjusting your filters</p>
					</div>

					<div v-else class="bg-panel rounded-2xl border border-heading/5 overflow-hidden">
						<!-- Column header -->
						<div
							class="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-2.5 border-b border-heading/5 bg-heading/[0.02]">
							<div class="w-4" />
							<span class="text-[10px] font-bold uppercase tracking-widest text-text/30">Task</span>
							<span
								class="text-[10px] font-bold uppercase tracking-widest text-text/30 w-20 text-center">Status</span>
							<span
								class="text-[10px] font-bold uppercase tracking-widest text-text/30 w-16 text-center">Priority</span>
							<span
								class="text-[10px] font-bold uppercase tracking-widest text-text/30 w-8 text-center">Who</span>
							<span
								class="text-[10px] font-bold uppercase tracking-widest text-text/30 w-16 text-right">Due</span>
						</div>

						<!-- Task rows -->
						<div class="divide-y divide-heading/[0.04]">
							<div v-for="task in filteredTasks" :key="task.id" @click="openTask(task.id)"
								class="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-heading/[0.02] transition-colors cursor-pointer group">

								<!-- Drag handle -->
								<div class="text-text/15 group-hover:text-text/30 transition-colors cursor-grab">
									<v-icon name="bi-grip-vertical" scale="0.85" />
								</div>

								<!-- Title -->
								<p class="text-sm font-medium min-w-0 truncate transition-colors"
									:class="[task.status === 'Done' ? 'line-through text-text/35' : 'text-heading group-hover:text-accent']">
									{{ task.title }}
								</p>

								<!-- Status -->
								<div class="w-20 flex justify-center">
									<span
										:class="[taskStatusConfig[task.status]?.cls, 'text-[10px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 whitespace-nowrap']">
										<span :class="[taskStatusConfig[task.status]?.dot, 'w-1 h-1 rounded-full']" />
										{{ task.status }}
									</span>
								</div>

								<!-- Priority -->
								<div class="w-16 flex justify-center">
									<span
										:class="[priorityConfig[task.priority]?.cls, 'text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap']">
										{{ task.priority }}
									</span>
								</div>

								<!-- Assignee avatar -->
								<div class="w-8 flex justify-center">
									<div :class="[memberColorMap[task.assignee] || 'bg-accent', 'w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shadow-sm']"
										:title="task.assignee">
										{{ task.assignee }}
									</div>
								</div>

								<!-- Due date -->
								<div class="w-16 text-right">
									<span v-if="task.due" class="text-[10px] text-text/35 tabular-nums">
										{{ formatShort(task.due) }}
									</span>
									<span v-else class="text-[10px] text-text/20">—</span>
								</div>
							</div>
						</div>
					</div>

					<!-- Shown count -->
					<p class="text-center text-xs text-text/30 mt-3">
						Showing {{ filteredTasks.length }} of {{ totalTasks }} tasks
					</p>
				</div>

				<!-- ── BOARD VIEW ─────────────────────────── -->
				<div v-else class="grid grid-cols-2 xl:grid-cols-4 gap-4">
					<div v-for="(columnTasks, status) in tasksByStatus" :key="status"
						class="bg-panel rounded-2xl border border-heading/5 overflow-hidden">

						<!-- Column header -->
						<div class="px-4 py-3 border-b border-heading/5 flex items-center justify-between">
							<div class="flex items-center gap-2">
								<span :class="[taskStatusConfig[status]?.dot, 'w-2 h-2 rounded-full']" />
								<span class="text-xs font-bold text-heading">{{ status }}</span>
							</div>
							<span
								class="text-[10px] font-bold text-text/40 bg-heading/5 px-1.5 py-0.5 rounded-md tabular-nums">
								{{ columnTasks.length }}
							</span>
						</div>

						<!-- Cards -->
						<div class="p-3 space-y-2.5 min-h-24">
							<div v-for="task in columnTasks" :key="task.id" @click="openTask(task.id)"
								class="bg-heading/[0.025] hover:bg-heading/[0.05] border border-heading/5 rounded-xl p-3 cursor-pointer transition-all hover:border-accent/20 group">
								<p class="text-xs font-semibold text-heading group-hover:text-accent transition-colors leading-snug mb-2"
									:class="task.status === 'Done' ? 'line-through text-text/35' : ''">
									{{ task.title }}
								</p>
								<div class="flex items-center justify-between gap-2">
									<span
										:class="[priorityConfig[task.priority]?.cls, 'text-[10px] px-1.5 py-0.5 rounded-md font-bold']">
										{{ task.priority }}
									</span>
									<div class="flex items-center gap-1.5">
										<span v-if="task.due" class="text-[10px] text-text/30 tabular-nums">
											{{ formatShort(task.due) }}
										</span>
										<div
											:class="[memberColorMap[task.assignee] || 'bg-accent', 'w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold']">
											{{ task.assignee }}
										</div>
									</div>
								</div>
							</div>

							<!-- Empty state -->
							<div v-if="columnTasks.length === 0"
								class="py-6 text-center text-[11px] text-text/25 font-medium">
								No tasks
							</div>
						</div>
					</div>
				</div>

			</div>
			<!-- /MAIN -->

		</div>
		<!-- /BODY -->

	</div>
</template>