<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import draggable from 'vuedraggable'
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
		{ initials: 'AH', name: 'Arif Hossain', role: 'Project Manager', color: 'bg-accent' },
		{ initials: 'SK', name: 'Sara Khan', role: 'Frontend Dev', color: 'bg-violet-500' },
		{ initials: 'NR', name: 'Noman Rahman', role: 'Backend Dev', color: 'bg-emerald-500' },
		{ initials: 'DM', name: 'Dina Malik', role: 'Designer', color: 'bg-amber-500' },
		{ initials: 'KU', name: 'Karim Uddin', role: 'QA Engineer', color: 'bg-rose-500' },
	],
})

// ── Tasks ─────────────────────────────────────────────
const tasks = ref([
	{ id: 1, title: 'Design system & component library', status: 'Done', priority: 'High', assignee: 'SK', due: '2025-03-01' },
	{ id: 2, title: 'JWT Authentication flow', status: 'Done', priority: 'Urgent', assignee: 'NR', due: '2025-03-10' },
	{ id: 3, title: 'Dashboard UI implementation', status: 'In Progress', priority: 'High', assignee: 'SK', due: '2025-04-15' },
	{ id: 4, title: 'Kanban board with drag & drop', status: 'In Progress', priority: 'High', assignee: 'AH', due: '2025-04-20' },
	{ id: 5, title: 'Role & permission system', status: 'Review', priority: 'Urgent', assignee: 'NR', due: '2025-04-10' },
	{ id: 6, title: 'File upload & management', status: 'Todo', priority: 'Medium', assignee: 'DM', due: '2025-05-01' },
	{ id: 7, title: 'Real-time notifications', status: 'Todo', priority: 'Medium', assignee: 'NR', due: '2025-05-15' },
	{ id: 8, title: 'Time tracking module', status: 'Todo', priority: 'Low', assignee: 'KU', due: '2025-06-01' },
	{ id: 9, title: 'Reports & analytics dashboard', status: 'Todo', priority: 'Low', assignee: 'AH', due: '2025-06-15' },
	{ id: 10, title: 'Mobile responsiveness audit', status: 'Review', priority: 'Medium', assignee: 'DM', due: '2025-04-25' },
])

// ── Config ────────────────────────────────────────────
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
	'Urgent': { cls: 'bg-red-500/10 text-red-500' },
	'High': { cls: 'bg-orange-500/10 text-orange-500' },
	'Medium': { cls: 'bg-amber-500/10 text-amber-600' },
	'Low': { cls: 'bg-slate-100 text-slate-500 dark:bg-slate-700/40' },
}
const memberColorMap = Object.fromEntries(project.value.members.map(m => [m.initials, m.color]))

// ── Filters & View ────────────────────────────────────
const searchQuery = ref('')
const statusFilter = ref('All')
const priorityFilter = ref('All')
const viewMode = ref('board')  // ← BOARD IS DEFAULT
const showAddTask = ref(false)
const newTaskTitle = ref('')
const sidebarCollapsed = ref(false)

const matchesFilter = (t) => {
	const s = !searchQuery.value || t.title.toLowerCase().includes(searchQuery.value.toLowerCase())
	const f = statusFilter.value === 'All' || t.status === statusFilter.value
	const p = priorityFilter.value === 'All' || t.priority === priorityFilter.value
	return s && f && p
}
const filteredTasks = computed(() => tasks.value.filter(matchesFilter))

// ── Stats ──────────────────────────────────────────────
const totalTasks = computed(() => tasks.value.length)
const doneCount = computed(() => tasks.value.filter(t => t.status === 'Done').length)
const inProgressCount = computed(() => tasks.value.filter(t => t.status === 'In Progress').length)
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
	return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)))
})
const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const formatShort = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

// ── Add task ───────────────────────────────────────────
const addTask = () => {
	if (!newTaskTitle.value.trim()) return
	const newTask = { id: Date.now(), title: newTaskTitle.value.trim(), status: 'Todo', priority: 'Medium', assignee: 'AH', due: '' }
	tasks.value.push(newTask)
	boardColumns.value['Todo'].push(newTask)
	newTaskTitle.value = ''
	showAddTask.value = false
}
const openTask = (taskId) => router.push({ name: 'task-detail', params: { id: route.params.id, taskId } })

// ── Recent activity ────────────────────────────────────
const recentActivity = [
	{ initials: 'SK', color: 'bg-violet-500', text: 'Updated Dashboard UI task to In Progress', time: '2h ago' },
	{ initials: 'NR', color: 'bg-emerald-500', text: 'Completed JWT auth implementation', time: '5h ago' },
	{ initials: 'AH', color: 'bg-accent', text: 'Added 3 new tasks to the board', time: '1d ago' },
	{ initials: 'DM', color: 'bg-amber-500', text: 'Uploaded new design mockups', time: '2d ago' },
]

// ══════════════════════════════════════════════════════
// BOARD — per-column reactive arrays for vuedraggable
// ══════════════════════════════════════════════════════
const columnStatuses = ['Todo', 'In Progress', 'Review', 'Done']

const buildColumns = () =>
	Object.fromEntries(columnStatuses.map(s => [s, tasks.value.filter(t => t.status === s)]))

const boardColumns = ref(buildColumns())

// Re-sync columns when tasks change externally (filters don't affect board columns)
watch(tasks, () => { boardColumns.value = buildColumns() }, { deep: false })

// On cross-column drag: update the task's status in the main array
const onBoardChange = (targetStatus, event) => {
	if (event.added) {
		const moved = tasks.value.find(t => t.id === event.added.element.id)
		if (moved) moved.status = targetStatus
	}
}
</script>

<template>
	<div class="min-h-screen pb-20">

		<!-- ════════════════════════════════════════════ -->
		<!-- PROJECT HERO HEADER                         -->
		<!-- ════════════════════════════════════════════ -->
		<div class="relative overflow-hidden rounded-2xl mb-6 mt-6">
			<div
				class="absolute inset-0 bg-gradient-to-br from-accent/20 via-violet-500/10 to-indigo-500/5 rounded-2xl" />
			<div class="absolute inset-0 bg-panel/80 backdrop-blur-sm rounded-2xl border border-heading/8" />
			<div class="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-accent/5 blur-2xl pointer-events-none" />
			<div
				class="absolute right-24 -bottom-8 w-32 h-32 rounded-full bg-violet-500/8 blur-xl pointer-events-none" />

			<div class="relative p-6 md:p-8">
				<div class="flex items-center gap-1.5 text-xs text-text/40 mb-5">
					<button @click="router.push({ name: 'projects' })"
						class="hover:text-accent transition-colors font-medium">Projects</button>
					<v-icon name="bi-chevron-right" scale="0.75" />
					<span class="text-text/60 font-semibold">{{ project.name }}</span>
				</div>

				<div class="flex flex-wrap gap-6 items-start justify-between">
					<div class="flex items-start gap-4 flex-1 min-w-0">
						<div
							class="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-violet-600 flex items-center justify-center shrink-0 shadow-xl shadow-accent/30">
							<v-icon name="md-folderspecial-outlined" class="text-white" scale="1.5" />
						</div>
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-2.5 flex-wrap mb-2">
								<h1 class="text-2xl sm:text-3xl font-bold text-heading leading-tight">{{ project.name }}
								</h1>
								<span
									:class="[statusConfig[project.status]?.cls, 'inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-bold border border-current/10']">
									<span :class="[statusConfig[project.status]?.dot, 'w-1.5 h-1.5 rounded-full']" />
									{{ project.status }}
								</span>
								<span
									:class="[priorityConfig[project.priority]?.cls, 'text-xs px-2.5 py-1 rounded-full font-bold border border-current/10']">
									{{ project.priority }}
								</span>
							</div>
							<p class="text-sm text-text/50 leading-relaxed max-w-2xl mb-4">{{ project.description }}</p>
							<div class="flex flex-wrap items-center gap-5">
								<div class="flex items-center gap-3 min-w-48">
									<div class="flex-1 h-1.5 bg-heading/10 rounded-full overflow-hidden">
										<div class="h-full bg-gradient-to-r from-accent to-violet-500 rounded-full transition-all duration-700"
											:style="`width:${project.progress}%`" />
									</div>
									<span class="text-xs font-bold text-heading tabular-nums">{{ project.progress
									}}%</span>
								</div>
								<div class="flex items-center gap-1.5 text-xs text-text/40">
									<v-icon name="bi-calendar3" scale="0.8" />
									<span>{{ formatDate(project.startDate) }}</span>
									<span class="text-text/20 mx-0.5">→</span>
									<span>{{ formatDate(project.endDate) }}</span>
								</div>
								<div class="flex items-center gap-1.5 text-xs"
									:class="daysLeft <= 14 ? 'text-amber-500 font-semibold' : 'text-text/40'">
									<v-icon name="bi-clock" scale="0.8" />
									{{ daysLeft > 0 ? `${daysLeft} days remaining` : 'Past deadline' }}
								</div>
							</div>
						</div>
					</div>
					<div class="flex items-center gap-2 shrink-0">
						<button
							class="p-2.5 rounded-xl border border-heading/10 text-text/50 hover:text-heading hover:bg-heading/5 transition-all">
							<v-icon name="bi-pencil" scale="0.9" />
						</button>
						<button
							class="p-2.5 rounded-xl border border-heading/10 text-text/50 hover:text-heading hover:bg-heading/5 transition-all">
							<v-icon name="bi-three-dots-vertical" scale="0.9" />
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- ════════════════════════════════════════════ -->
		<!-- BODY: SIDEBAR + MAIN                        -->
		<!-- ════════════════════════════════════════════ -->
		<div class="flex gap-5 items-start">

			<!-- SIDEBAR -->
			<aside :class="[sidebarCollapsed ? 'w-10' : 'w-64 xl:w-72', 'shrink-0 transition-all duration-300']">
				<button @click="sidebarCollapsed = !sidebarCollapsed"
					class="w-full flex items-center justify-end mb-3 text-text/30 hover:text-text/60 transition-colors">
					<v-icon name="bi-layout-wtf" scale="0.9" />
				</button>

				<template v-if="!sidebarCollapsed">
					<div class="bg-panel rounded-2xl border border-heading/5 p-4 mb-3">
						<h3
							class="text-[10px] font-bold uppercase tracking-widest text-text/35 mb-3 flex items-center gap-1.5">
							<v-icon name="bi-bar-chart" scale="0.75" class="text-accent" />
							Details
						</h3>
						<div class="space-y-2.5">
							<div class="flex items-center justify-between">
								<span class="text-[11px] text-text/40">Tasks</span>
								<span class="text-[11px] font-semibold text-heading">{{ doneCount }}/{{ totalTasks }}
									done</span>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-[11px] text-text/40">In Progress</span>
								<span class="text-[11px] font-semibold text-accent">{{ inProgressCount }}</span>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-[11px] text-text/40">Overdue</span>
								<span :class="overdueCount ? 'text-red-500' : 'text-text/30'"
									class="text-[11px] font-semibold">{{ overdueCount }}</span>
							</div>
						</div>
					</div>

					<div class="bg-panel rounded-2xl border border-heading/5 p-4 mb-3">
						<h3
							class="text-[10px] font-bold uppercase tracking-widest text-text/35 mb-3 flex items-center gap-1.5">
							<v-icon name="bi-calendar3" scale="0.75" class="text-violet-500" />
							Timeline
						</h3>
						<div class="text-[11px] text-text/50 mb-2 flex justify-between">
							<span>{{ formatShort(project.startDate) }}</span>
							<span>{{ formatShort(project.endDate) }}</span>
						</div>
						<div class="h-2 bg-heading/8 rounded-full overflow-hidden relative">
							<div class="h-full bg-gradient-to-r from-accent to-violet-500 rounded-full"
								:style="`width: ${todayPercent}%`" />
							<div class="absolute top-0 h-full w-0.5 bg-heading/40" :style="`left: ${todayPercent}%`" />
						</div>
						<p class="text-[10px] text-text/30 mt-1.5 text-center">
							{{ daysLeft > 0 ? `${daysLeft} days remaining` : 'Past deadline' }}
						</p>
					</div>

					<div class="bg-panel rounded-2xl border border-heading/5 p-4 mb-3">
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
								class="flex items-center gap-2.5 cursor-pointer group">
								<div
									:class="[m.color, 'w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm']">
									{{ m.initials }}</div>
								<div class="min-w-0 flex-1">
									<p class="text-xs font-semibold text-heading/80 truncate">{{ m.name }}</p>
									<p class="text-[10px] text-text/35 truncate">{{ m.role }}</p>
								</div>
							</div>
						</div>
					</div>

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
									{{ item.initials }}</div>
								<div class="min-w-0">
									<p class="text-[11px] text-text/60 leading-relaxed">{{ item.text }}</p>
									<p class="text-[10px] text-text/30 mt-0.5">{{ item.time }}</p>
								</div>
							</div>
						</div>
					</div>
				</template>
			</aside>

			<!-- MAIN -->
			<div class="flex-1 min-w-0">

				<!-- Stats row -->
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
					<div v-for="stat in [
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

						<select v-model="statusFilter"
							:class="['appearance-none pl-3 pr-7 py-2 rounded-xl border text-sm focus:outline-none transition-colors cursor-pointer',
								statusFilter !== 'All' ? 'border-accent/30 bg-accent/8 text-accent font-semibold' : 'border-heading/8 bg-heading/3 text-text/80']">
							<option v-for="s in ['All', 'Todo', 'In Progress', 'Review', 'Done']" :key="s" :value="s">{{
								s === 'All'
									? 'All Status' : s }}</option>
						</select>

						<select v-model="priorityFilter"
							:class="['appearance-none pl-3 pr-7 py-2 rounded-xl border text-sm focus:outline-none transition-colors cursor-pointer',
								priorityFilter !== 'All' ? 'border-accent/30 bg-accent/8 text-accent font-semibold' : 'border-heading/8 bg-heading/3 text-text/80']">
							<option v-for="p in ['All', 'Urgent', 'High', 'Medium', 'Low']" :key="p" :value="p">{{ p ===
								'All' ?
								'All Priority' : p }}</option>
						</select>

						<div class="flex-1 hidden sm:block" />

						<!-- ── View Toggle: BOARD first, LIST last ── -->
						<div class="flex items-center gap-1 bg-heading/5 rounded-xl p-1">
							<button @click="viewMode = 'board'" :class="[
								viewMode === 'board' ? 'bg-panel text-heading shadow-sm' : 'text-text/40 hover:text-text/70',
								'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5'
							]">
								<v-icon name="bi-kanban" scale="0.85" />
								Board
							</button>
							<button @click="viewMode = 'list'" :class="[
								viewMode === 'list' ? 'bg-panel text-heading shadow-sm' : 'text-text/40 hover:text-text/70',
								'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5'
							]">
								<v-icon name="bi-list-task" scale="0.85" />
								List
							</button>
						</div>

						<button @click="showAddTask = true"
							class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 active:scale-95 transition-all shadow-md shadow-accent/20">
							<v-icon name="bi-plus-circle" scale="0.9" />
							Add Task
						</button>
					</div>

					<div v-if="showAddTask" class="mt-3 pt-3 border-t border-heading/5 flex items-center gap-2.5">
						<input v-model="newTaskTitle" @keydown.enter="addTask" @keydown.esc="showAddTask = false"
							type="text" placeholder="Task title… (Enter to save, Esc to cancel)"
							class="flex-1 px-3.5 py-2 rounded-xl border border-accent/30 bg-accent/5 text-sm text-heading placeholder-text/30 focus:outline-none focus:border-accent/60 transition-colors"
							autofocus />
						<button @click="addTask"
							class="px-4 py-2 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors">Save</button>
						<button @click="showAddTask = false; newTaskTitle = ''"
							class="px-3 py-2 rounded-xl border border-heading/10 text-text/80 text-sm hover:text-heading transition-colors">Cancel</button>
					</div>
				</div>

				<!-- ══════════════════════════════════════ -->
				<!-- BOARD VIEW (default)                  -->
				<!-- ══════════════════════════════════════ -->
				<div v-if="viewMode === 'board'" class="grid grid-cols-2 xl:grid-cols-4 gap-4">
					<div v-for="status in columnStatuses" :key="status"
						class="bg-panel rounded-2xl border border-heading/5 overflow-hidden flex flex-col">

						<!-- Column header -->
						<div class="px-4 py-3 border-b border-heading/5 flex items-center justify-between">
							<div class="flex items-center gap-2">
								<span :class="[taskStatusConfig[status]?.dot, 'w-2 h-2 rounded-full flex-shrink-0',
								status === 'In Progress' ? 'animate-pulse' : '']" />
								<span class="text-xs font-bold text-heading">{{ status }}</span>
							</div>
							<span
								class="text-[10px] font-bold text-text/40 bg-heading/5 px-1.5 py-0.5 rounded-md tabular-nums">
								{{ boardColumns[status]?.length ?? 0 }}
							</span>
						</div>

						<!-- Draggable card list -->
						<div class="p-3 flex-1">
							<draggable :list="boardColumns[status]" item-key="id" :group="{ name: 'board-tasks' }"
								animation="250" :ghost-class="['opacity-20', '!bg-accent/10', '!border-accent/30']"
								:drag-class="[
									'!opacity-100',
									'!rotate-1',
									'!shadow-2xl',
									'!shadow-black/20',
									'!scale-[1.02]',
									'!cursor-grabbing',
									'!rounded-xl'
								]" handle=".card-handle" @change="(e) => onBoardChange(status, e)" class="flex flex-col gap-2.5 min-h-[3rem]">
								<template #item="{ element: task }">
									<div class="bg-heading/[0.025] hover:bg-heading/[0.05] border border-heading/5 rounded-xl p-3 cursor-pointer transition-all duration-150 hover:border-accent/20 hover:shadow-sm group select-none"
										:class="task.status === 'Done' ? 'opacity-60' : ''" @click="openTask(task.id)">
										<div class="flex items-start gap-1.5 mb-2.5">
											<div class="card-handle mt-0.5 text-text/10 group-hover:text-text/30 transition-colors cursor-grab shrink-0"
												@click.stop>
												<v-icon name="bi-grip-vertical" scale="0.8" />
											</div>
											<p class="text-xs font-semibold leading-snug flex-1 transition-colors"
												:class="task.status === 'Done' ? 'line-through text-text/35' : 'text-heading group-hover:text-accent'">
												{{ task.title }}
											</p>
										</div>
										<div class="flex items-center justify-between gap-2 pl-[18px]">
											<span
												:class="[priorityConfig[task.priority]?.cls, 'text-[10px] px-1.5 py-0.5 rounded-md font-bold']">
												{{ task.priority }}
											</span>
											<div class="flex items-center gap-1.5">
												<span v-if="task.due" class="text-[10px] text-text/30 tabular-nums">{{
													formatShort(task.due) }}</span>
												<div
													:class="[memberColorMap[task.assignee] || 'bg-accent', 'w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0']">
													{{ task.assignee }}
												</div>
											</div>
										</div>
									</div>
								</template>

								<template #footer>
									<div v-if="boardColumns[status]?.length === 0"
										class="h-16 rounded-xl border-2 border-dashed border-heading/8 flex items-center justify-center text-[11px] text-text/20 font-medium">
										Drop here
									</div>
								</template>
							</draggable>
						</div>
					</div>
				</div>

				<!-- ══════════════════════════════════════ -->
				<!-- LIST VIEW (draggable reorder)         -->
				<!-- ══════════════════════════════════════ -->
				<div v-else>
					<div v-if="filteredTasks.length === 0"
						class="bg-panel rounded-2xl border border-heading/5 p-12 text-center">
						<v-icon name="bi-list-task" class="text-text/15 mx-auto mb-3" scale="2.5" />
						<p class="text-sm font-semibold text-text/40">No tasks found</p>
						<p class="text-xs text-text/25 mt-1">Try adjusting your filters</p>
					</div>

					<div v-else class="bg-panel rounded-2xl border border-heading/5 overflow-hidden">
						<!-- Header -->
						<div
							class="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-2.5 border-b border-heading/5 bg-heading/[0.02]">
							<div class="w-5" />
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

						<draggable v-model="tasks" item-key="id" handle=".row-handle" animation="200"
							:ghost-class="['opacity-30', '!bg-accent/5']"
							:drag-class="['!opacity-95', '!shadow-lg', '!shadow-heading/10', '!bg-panel', 'z-50']"
							class="divide-y divide-heading/[0.04]">
							<template #item="{ element: task }">
								<div v-if="matchesFilter(task)"
									class="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-heading/[0.02] transition-colors group select-none cursor-pointer"
									@click="openTask(task.id)">
									<!-- Drag handle -->
									<div class="row-handle text-text/15 group-hover:text-text/40 transition-colors cursor-grab active:cursor-grabbing"
										@click.stop>
										<v-icon name="bi-grip-vertical" scale="0.85" />
									</div>

									<!-- Title -->
									<p class="text-sm font-medium min-w-0 truncate transition-colors"
										:class="task.status === 'Done' ? 'line-through text-text/35' : 'text-heading group-hover:text-accent'">
										{{ task.title }}
									</p>

									<!-- Status -->
									<div class="w-20 flex justify-center">
										<span
											:class="[taskStatusConfig[task.status]?.cls, 'text-[10px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 whitespace-nowrap']">
											<span
												:class="[taskStatusConfig[task.status]?.dot, 'w-1 h-1 rounded-full', task.status === 'In Progress' ? 'animate-pulse' : '']" />
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

									<!-- Assignee -->
									<div class="w-8 flex justify-center">
										<div :class="[memberColorMap[task.assignee] || 'bg-accent', 'w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shadow-sm']"
											:title="task.assignee">
											{{ task.assignee }}
										</div>
									</div>

									<!-- Due -->
									<div class="w-16 text-right">
										<span v-if="task.due" class="text-[10px] text-text/35 tabular-nums">{{
											formatShort(task.due) }}</span>
										<span v-else class="text-[10px] text-text/20">—</span>
									</div>
								</div>
							</template>
						</draggable>
					</div>

					<p class="text-center text-xs text-text/30 mt-3">
						Showing {{ filteredTasks.length }} of {{ totalTasks }} tasks
					</p>
				</div>

			</div>
		</div>
	</div>
</template>