<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { addIcons } from 'oh-vue-icons'
import {
	BiPlusCircle, BiSearch, BiXCircle,
	BiCheckCircle, BiClock, BiCalendar3,
	BiChevronDown, BiArrowLeft,
	MdFolderspecialOutlined, BiThreeDotsVertical,
	BiPencil, BiTrash, BiLayoutWtf, BiArrowRepeat,
} from 'oh-vue-icons/icons'

addIcons(
	BiPlusCircle, BiSearch, BiXCircle,
	BiCheckCircle, BiClock, BiCalendar3,
	BiChevronDown, BiArrowLeft,
	MdFolderspecialOutlined, BiThreeDotsVertical,
	BiPencil, BiTrash, BiLayoutWtf, BiArrowRepeat,
)

const router = useRouter()
const route = useRoute()

// ── Filters / UI state ────────────────────────────────
const searchQuery = ref('')
const statusFilter = ref('All')
const priorityFilter = ref('All')
const assigneeFilter = ref('All')
const groupBy = ref('status')
const openMenuId = ref(null)
const showCreateModal = ref(false)
const newTask = ref({ title: '', description: '', status: 'Todo', priority: 'Medium', due: '', assignee: 'AH' })

const statuses = ['All', 'Todo', 'In Progress', 'Review', 'Done']
const priorities = ['All', 'Urgent', 'High', 'Medium', 'Low']

const members = [
	{ initials: 'AH', name: 'Arif Hossain', color: 'bg-accent' },
	{ initials: 'SK', name: 'Sara Khan', color: 'bg-violet-500' },
	{ initials: 'NR', name: 'Noman Rahman', color: 'bg-emerald-500' },
	{ initials: 'DM', name: 'Dina Malik', color: 'bg-amber-500' },
	{ initials: 'KU', name: 'Karim Uddin', color: 'bg-red-400' },
]
const memberMap = Object.fromEntries(members.map(m => [m.initials, m]))

const tasks = ref([
	{ id: 1, title: 'Set up project scaffolding and repo', description: 'Initialize monorepo, configure Vite + Vue, set up Tailwind CSS v4 and base routing.', status: 'Done', priority: 'High', assignee: 'AH', due: '2026-01-18', project: 'Tazko App' },
	{ id: 2, title: 'Design authentication flow', description: 'Create Login, Register pages with validation, JWT storage, and redirect logic.', status: 'Done', priority: 'High', assignee: 'SK', due: '2026-01-22', project: 'Tazko App' },
	{ id: 3, title: 'Implement JWT/Sanctum backend auth', description: 'Set up Sanctum, login/logout/register endpoints, token refresh strategy.', status: 'Done', priority: 'Urgent', assignee: 'NR', due: '2026-01-25', project: 'Backend Core' },
	{ id: 4, title: 'Build role & permission RBAC system', description: 'Define roles, capabilities table, middleware for route-level authorization.', status: 'Done', priority: 'High', assignee: 'NR', due: '2026-02-05', project: 'Backend Core' },
	{ id: 5, title: 'Dashboard UI & analytics widgets', description: 'Build home dashboard with task summary, project stats, recent activity feed.', status: 'In Progress', priority: 'High', assignee: 'SK', due: '2026-03-10', project: 'Tazko App' },
	{ id: 6, title: 'Project management CRUD module', description: 'Create, edit, delete projects — modal forms, status tracking, member assignment.', status: 'In Progress', priority: 'Urgent', assignee: 'AH', due: '2026-03-15', project: 'Tazko App' },
	{ id: 7, title: 'Task management with Kanban board', description: 'Build Kanban board with drag-and-drop columns.', status: 'Todo', priority: 'High', assignee: 'SK', due: '2026-03-25', project: 'Tazko App' },
	{ id: 8, title: 'File upload and preview system', description: 'Support image + PDF uploads per task/project with preview modal.', status: 'Todo', priority: 'Medium', assignee: 'DM', due: '2026-04-05', project: 'Tazko App' },
	{ id: 9, title: 'In-app notification system', description: 'Build in-app bell notifications with read/unread state.', status: 'Todo', priority: 'Medium', assignee: 'NR', due: '2026-04-15', project: 'Backend Core' },
	{ id: 10, title: 'End-to-end testing & QA', description: 'Write Playwright tests for auth flow, project CRUD, task management.', status: 'Todo', priority: 'High', assignee: 'KU', due: '2026-05-01', project: 'QA & Testing' },
	{ id: 11, title: 'Review PR #42 – role permissions', description: 'Code review for the RBAC middleware refactor.', status: 'Review', priority: 'High', assignee: 'AH', due: '2026-03-08', project: 'Backend Core' },
	{ id: 12, title: 'Design system tokens & component library', description: 'Define color tokens, typography scale, spacing system.', status: 'In Progress', priority: 'Medium', assignee: 'DM', due: '2026-04-01', project: 'Design System' },
])

const priorityConfig = {
	Urgent: { cls: 'text-red-500 bg-red-500/10', dot: 'bg-red-500' },
	High: { cls: 'text-amber-600 bg-amber-500/10', dot: 'bg-amber-500' },
	Medium: { cls: 'text-blue-500 bg-blue-500/10', dot: 'bg-blue-500' },
	Low: { cls: 'text-slate-500 bg-slate-100', dot: 'bg-slate-400' },
}
const statusConfig = {
	'Todo': { cls: 'text-slate-500 bg-slate-100', dot: 'bg-slate-400', ring: 'border-slate-300' },
	'In Progress': { cls: 'text-accent bg-accent/10', dot: 'bg-accent', ring: 'border-accent/40' },
	'Review': { cls: 'text-violet-600 bg-violet-500/10', dot: 'bg-violet-500', ring: 'border-violet-300' },
	'Done': { cls: 'text-emerald-600 bg-emerald-500/10', dot: 'bg-emerald-500', ring: 'border-emerald-300' },
}
const groupColors = {
	'Todo': 'border-l-slate-300',
	'In Progress': 'border-l-accent',
	'Review': 'border-l-violet-500',
	'Done': 'border-l-emerald-500',
	'Urgent': 'border-l-red-500',
	'High': 'border-l-amber-500',
	'Medium': 'border-l-blue-500',
	'Low': 'border-l-slate-300',
}

const filteredTasks = computed(() => tasks.value.filter(t => {
	const q = searchQuery.value.toLowerCase()
	return (!q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
		&& (statusFilter.value === 'All' || t.status === statusFilter.value)
		&& (priorityFilter.value === 'All' || t.priority === priorityFilter.value)
		&& (assigneeFilter.value === 'All' || t.assignee === assigneeFilter.value)
}))

const groupedTasks = computed(() => {
	if (groupBy.value === 'none') return { 'All Tasks': filteredTasks.value }
	const key = groupBy.value === 'status' ? 'status' : 'priority'
	const order = groupBy.value === 'status'
		? ['Todo', 'In Progress', 'Review', 'Done']
		: ['Urgent', 'High', 'Medium', 'Low']
	const groups = {}
	order.forEach(o => { groups[o] = [] })
	filteredTasks.value.forEach(t => { groups[t[key]]?.push(t) })
	return groups
})

const totalTasks = computed(() => tasks.value.length)
const doneCount = computed(() => tasks.value.filter(t => t.status === 'Done').length)
const activeCount = computed(() => tasks.value.filter(t => t.status === 'In Progress').length)
const overdueCount = computed(() => tasks.value.filter(t => new Date(t.due) < new Date() && t.status !== 'Done').length)

const daysLeft = (due) => {
	const diff = Math.ceil((new Date(due) - new Date()) / 86400000)
	if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, cls: 'text-red-500 font-semibold' }
	if (diff === 0) return { label: 'Due today', cls: 'text-red-500 font-semibold' }
	if (diff <= 3) return { label: `${diff}d left`, cls: 'text-amber-500 font-semibold' }
	return { label: new Date(due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), cls: 'text-text/35' }
}

const activeFilterCount = computed(() =>
	[statusFilter.value !== 'All', priorityFilter.value !== 'All', assigneeFilter.value !== 'All'].filter(Boolean).length
)
const clearFilters = () => { statusFilter.value = 'All'; priorityFilter.value = 'All'; assigneeFilter.value = 'All'; searchQuery.value = '' }

const createTask = () => {
	if (!newTask.value.title.trim()) return
	tasks.value.push({ id: Date.now(), ...newTask.value, project: 'Tazko App' })
	newTask.value = { title: '', description: '', status: 'Todo', priority: 'Medium', due: '', assignee: 'AH' }
	showCreateModal.value = false
}

// ✅ Navigate to full task detail page
const openTask = (task) => {
	router.push({ name: 'task-detail', params: { id: route.params.id, taskId: task.id } })
}
</script>

<template>
	<div class="pb-20 pt-8 px-1" @click="openMenuId = null">

		<!-- ── Breadcrumb + Header ─────────────────────── -->
		<div class="mb-7">
			<div class="flex items-center gap-2 text-xs text-text/40 mb-3">
				<button @click="router.push({ name: 'projects' })"
					class="hover:text-accent transition-colors">Projects</button>
				<span>/</span>
				<button @click="router.push({ name: 'project-detail', params: { id: route.params.id } })"
					class="hover:text-accent transition-colors">Tazko App</button>
				<span>/</span>
				<span class="text-text/60 font-medium">Tasks</span>
			</div>
			<div class="flex items-end justify-between gap-4 flex-wrap">
				<div>
					<h1 class="text-heading leading-none mb-1.5">Tasks</h1>
					<p class="text-sm text-text/45">{{ filteredTasks.length }} of {{ totalTasks }} tasks</p>
				</div>
				<button @click.stop="showCreateModal = true"
					class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 active:scale-95 transition-all shadow-lg shadow-accent/25">
					<v-icon name="bi-plus-circle" scale="0.9" />
					New Task
				</button>
			</div>
		</div>

		<!-- ── Stat Cards ─────────────────────────────── -->
		<div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
			<div class="bg-panel rounded-xl border border-heading/5 px-4 py-3.5 flex items-center gap-3">
				<div class="w-8 h-8 rounded-lg bg-heading/5 flex items-center justify-center shrink-0">
					<v-icon name="bi-layout-wtf" class="text-text/40" scale="0.9" />
				</div>
				<div>
					<p class="text-xl font-bold text-heading leading-none">{{ totalTasks }}</p>
					<p class="text-[10px] text-text/35 mt-0.5">Total</p>
				</div>
			</div>
			<div class="bg-panel rounded-xl border border-heading/5 px-4 py-3.5 flex items-center gap-3">
				<div class="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
					<v-icon name="bi-arrow-repeat" class="text-accent" scale="0.9" />
				</div>
				<div>
					<p class="text-xl font-bold text-heading leading-none">{{ activeCount }}</p>
					<p class="text-[10px] text-text/35 mt-0.5">In Progress</p>
				</div>
			</div>
			<div class="bg-panel rounded-xl border border-heading/5 px-4 py-3.5 flex items-center gap-3">
				<div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
					<v-icon name="bi-check-circle" class="text-emerald-500" scale="0.9" />
				</div>
				<div>
					<p class="text-xl font-bold text-heading leading-none">{{ doneCount }}</p>
					<p class="text-[10px] text-text/35 mt-0.5">Done</p>
				</div>
			</div>
			<div class="bg-panel rounded-xl border border-heading/5 px-4 py-3.5 flex items-center gap-3">
				<div
					:class="['w-8 h-8 rounded-lg flex items-center justify-center shrink-0', overdueCount ? 'bg-red-500/10' : 'bg-heading/5']">
					<v-icon name="bi-clock" :class="overdueCount ? 'text-red-500' : 'text-text/35'" scale="0.9" />
				</div>
				<div>
					<p :class="['text-xl font-bold leading-none', overdueCount ? 'text-red-500' : 'text-heading']">{{
						overdueCount }}</p>
					<p class="text-[10px] text-text/35 mt-0.5">Overdue</p>
				</div>
			</div>
		</div>

		<!-- ── Toolbar ────────────────────────────────── -->
		<div class="flex flex-wrap items-center gap-2.5 mb-4">
			<!-- Search -->
			<div class="relative flex-1 min-w-48">
				<v-icon name="bi-search" class="absolute left-3 top-1/2 -translate-y-1/2 text-text/30" scale="0.85" />
				<input v-model="searchQuery" type="text" placeholder="Search tasks…"
					class="w-full pl-9 pr-9 py-2.5 rounded-xl border border-heading/10 bg-panel text-sm text-heading placeholder-text/30 focus:outline-none focus:border-accent/50 transition-colors" />
				<button v-if="searchQuery" @click="searchQuery = ''"
					class="absolute right-3 top-1/2 -translate-y-1/2 text-text/30 hover:text-text/70">
					<v-icon name="bi-x-circle" scale="0.85" />
				</button>
			</div>

			<!-- Status filter -->
			<div class="relative">
				<select v-model="statusFilter"
					:class="['appearance-none pl-3 pr-8 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors cursor-pointer',
						statusFilter !== 'All' ? 'border-accent/40 bg-accent/5 text-accent font-semibold' : 'border-heading/10 bg-panel text-text/70']">
					<option v-for="s in statuses" :key="s">{{ s }}</option>
				</select>
				<v-icon name="bi-chevron-down" scale="0.75"
					class="absolute right-2.5 top-1/2 -translate-y-1/2 text-text/40 pointer-events-none" />
			</div>

			<!-- Priority filter -->
			<div class="relative">
				<select v-model="priorityFilter"
					:class="['appearance-none pl-3 pr-8 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors cursor-pointer',
						priorityFilter !== 'All' ? 'border-amber-400/40 bg-amber-500/5 text-amber-600 font-semibold' : 'border-heading/10 bg-panel text-text/70']">
					<option v-for="p in priorities" :key="p">{{ p }}</option>
				</select>
				<v-icon name="bi-chevron-down" scale="0.75"
					class="absolute right-2.5 top-1/2 -translate-y-1/2 text-text/40 pointer-events-none" />
			</div>

			<!-- Assignee filter -->
			<div class="relative">
				<select v-model="assigneeFilter"
					:class="['appearance-none pl-3 pr-8 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors cursor-pointer',
						assigneeFilter !== 'All' ? 'border-violet-400/40 bg-violet-500/5 text-violet-600 font-semibold' : 'border-heading/10 bg-panel text-text/70']">
					<option value="All">All Members</option>
					<option v-for="m in members" :key="m.initials" :value="m.initials">{{ m.name }}</option>
				</select>
				<v-icon name="bi-chevron-down" scale="0.75"
					class="absolute right-2.5 top-1/2 -translate-y-1/2 text-text/40 pointer-events-none" />
			</div>

			<!-- Group by -->
			<div class="flex items-center gap-1 bg-panel border border-heading/10 rounded-xl p-1 ml-auto">
				<button
					v-for="g in [{ key: 'status', label: 'Status' }, { key: 'priority', label: 'Priority' }, { key: 'none', label: 'Flat' }]"
					:key="g.key" @click="groupBy = g.key" :class="['px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
						groupBy === g.key ? 'bg-accent text-white shadow-sm' : 'text-text/40 hover:text-text/70']">
					{{ g.label }}
				</button>
			</div>
		</div>

		<!-- Filter chips -->
		<div v-if="activeFilterCount > 0 || searchQuery" class="flex items-center gap-2 mb-4 flex-wrap">
			<span class="text-xs text-text/35">{{ filteredTasks.length }} result{{ filteredTasks.length !== 1 ? 's' : ''
				}}</span>
			<button @click="clearFilters"
				class="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent/70 transition-colors">
				<v-icon name="bi-x-circle" scale="0.7" /> Clear filters
			</button>
		</div>

		<!-- ── Task Groups ────────────────────────────── -->
		<div v-if="filteredTasks.length" class="space-y-5">
			<div v-for="(groupTasks, groupName) in groupedTasks" :key="groupName">
				<template v-if="groupTasks.length">

					<!-- Group header -->
					<div v-if="groupBy !== 'none'" class="flex items-center gap-3 mb-2.5">
						<span
							:class="[(groupBy === 'status' ? statusConfig[groupName]?.dot : priorityConfig[groupName]?.dot) || 'bg-slate-400', 'w-2 h-2 rounded-full shrink-0']"></span>
						<span class="text-sm font-bold text-heading">{{ groupName }}</span>
						<span class="text-xs text-text/30 font-medium bg-heading/5 px-2 py-0.5 rounded-full">{{
							groupTasks.length }}</span>
						<div class="flex-1 h-px bg-heading/6"></div>
					</div>

					<!-- Task rows -->
					<div
						:class="['bg-panel rounded-2xl border border-heading/5 overflow-hidden border-l-2', groupColors[groupName] || 'border-l-heading/10']">
						<div class="divide-y divide-heading/[0.04]">
							<div v-for="task in groupTasks" :key="task.id"
								class="flex items-center gap-3 px-4 py-3 hover:bg-heading/[0.02] transition-colors group cursor-pointer"
								@click="openTask(task)">

								<!-- Checkbox (done toggle, stops propagation) -->
								<div :class="['w-4 h-4 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-all',
									task.status === 'Done' ? 'bg-emerald-500 border-emerald-500' : `${statusConfig[task.status]?.ring || 'border-heading/20'} group-hover:border-accent/60`]"
									@click.stop="task.status = task.status === 'Done' ? 'Todo' : 'Done'">
									<svg v-if="task.status === 'Done'" viewBox="0 0 24 24" fill="none" class="w-2 h-2">
										<path d="M5 13l4 4L19 7" stroke="white" stroke-width="3.5"
											stroke-linecap="round" stroke-linejoin="round" />
									</svg>
								</div>

								<!-- Title + project label -->
								<div class="flex-1 min-w-0">
									<p :class="['text-sm font-semibold truncate transition-colors',
										task.status === 'Done' ? 'text-text/30 line-through' : 'text-heading group-hover:text-accent']">
										{{ task.title }}
									</p>
									<p class="text-[10px] text-text/30 mt-0.5">{{ task.project }}</p>
								</div>

								<!-- Meta -->
								<div class="flex items-center gap-2 shrink-0">
									<span
										:class="[priorityConfig[task.priority]?.cls, 'text-[10px] px-2 py-0.5 rounded-full font-bold hidden sm:inline-flex']">
										{{ task.priority }}
									</span>
									<span v-if="groupBy !== 'status'"
										:class="[statusConfig[task.status]?.cls, 'text-[10px] px-2 py-0.5 rounded-full font-bold hidden md:inline-flex']">
										{{ task.status }}
									</span>
									<div :class="[memberMap[task.assignee]?.color || 'bg-accent', 'w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0']"
										:title="memberMap[task.assignee]?.name">
										{{ task.assignee }}
									</div>
									<span
										:class="['text-[10px] hidden md:flex items-center gap-1', daysLeft(task.due).cls]">
										<v-icon name="bi-calendar3" scale="0.7" />
										{{ daysLeft(task.due).label }}
									</span>
									<!-- 3-dot -->
									<div class="relative" @click.stop>
										<button @click="openMenuId = openMenuId === task.id ? null : task.id"
											class="w-6 h-6 rounded-lg flex items-center justify-center text-text/20 hover:text-text/60 hover:bg-heading/5 transition-colors opacity-0 group-hover:opacity-100">
											<v-icon name="bi-three-dots-vertical" scale="0.8" />
										</button>
										<Transition name="fade-drop">
											<div v-if="openMenuId === task.id"
												class="absolute right-0 top-full mt-1 w-36 bg-panel rounded-xl border border-heading/10 shadow-xl z-20 overflow-hidden">
												<button
													class="w-full flex items-center gap-2 px-3 py-2 text-xs text-text/60 hover:bg-heading/5 transition-colors">
													<v-icon name="bi-pencil" scale="0.8" /> Edit
												</button>
												<button
													class="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors">
													<v-icon name="bi-trash" scale="0.8" /> Delete
												</button>
											</div>
										</Transition>
									</div>
								</div>
							</div>
						</div>

						<!-- Inline add -->
						<div class="px-4 py-2 border-t border-heading/[0.04]">
							<button @click="showCreateModal = true"
								class="flex items-center gap-2 text-xs text-text/25 hover:text-accent transition-colors">
								<v-icon name="bi-plus-circle" scale="0.8" /> Add task
							</button>
						</div>
					</div>
				</template>
			</div>
		</div>

		<!-- Empty state -->
		<div v-else class="text-center py-24">
			<div class="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
				<v-icon name="bi-check-circle" class="text-accent" scale="1.8" />
			</div>
			<p class="text-base font-bold text-heading mb-1">No tasks found</p>
			<p class="text-sm text-text/40 mb-5">Adjust filters or create a new task.</p>
			<button @click="clearFilters"
				class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-heading/10 text-sm font-semibold text-text/60 hover:bg-heading/5 transition-colors">
				Clear filters
			</button>
		</div>

		<!-- ── Create Task Modal ──────────────────────── -->
		<Transition name="modal">
			<div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
				<!-- ✅ FIX 2: click handler on backdrop itself, not parent with .self -->
				<div class="absolute inset-0 bg-heading/50 backdrop-blur-sm" @click="showCreateModal = false"></div>
				<div class="relative bg-panel rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
					<div
						class="bg-gradient-to-r from-accent/10 to-violet-500/10 border-b border-heading/8 px-6 pt-5 pb-4">
						<div class="flex items-center justify-between">
							<div>
								<h2 class="text-lg font-bold text-heading">New Task</h2>
								<p class="text-xs text-text/40 mt-0.5">Add a task to Tazko App</p>
							</div>
							<button @click="showCreateModal = false"
								class="w-8 h-8 rounded-lg text-text/30 hover:text-text/70 hover:bg-heading/5 transition-colors flex items-center justify-center">
								<v-icon name="bi-x-circle" scale="1" />
							</button>
						</div>
					</div>
					<div class="p-5 space-y-4">
						<div>
							<label class="block text-[10px] font-bold text-text/45 uppercase tracking-wider mb-1.5">Task
								Title
								*</label>
							<input v-model="newTask.title" type="text" placeholder="What needs to be done?"
								class="input-field rounded-xl border-heading/15 focus:border-accent" autofocus />
						</div>
						<div>
							<label
								class="block text-[10px] font-bold text-text/45 uppercase tracking-wider mb-1.5">Description</label>
							<textarea v-model="newTask.description" rows="2" placeholder="More details…"
								class="input-field rounded-xl border-heading/15 focus:border-accent resize-none"></textarea>
						</div>
						<div class="grid grid-cols-2 gap-3">
							<div>
								<label
									class="block text-[10px] font-bold text-text/45 uppercase tracking-wider mb-1.5">Status</label>
								<select v-model="newTask.status" class="input-field rounded-xl border-heading/15">
									<option>Todo</option>
									<option>In Progress</option>
									<option>Review</option>
									<option>Done</option>
								</select>
							</div>
							<div>
								<label
									class="block text-[10px] font-bold text-text/45 uppercase tracking-wider mb-1.5">Priority</label>
								<select v-model="newTask.priority" class="input-field rounded-xl border-heading/15">
									<option>Urgent</option>
									<option>High</option>
									<option>Medium</option>
									<option>Low</option>
								</select>
							</div>
						</div>
						<div class="grid grid-cols-2 gap-3">
							<div>
								<label
									class="block text-[10px] font-bold text-text/45 uppercase tracking-wider mb-1.5">Assignee</label>
								<select v-model="newTask.assignee" class="input-field rounded-xl border-heading/15">
									<option v-for="m in members" :key="m.initials" :value="m.initials">{{ m.name }}
									</option>
								</select>
							</div>
							<div>
								<label
									class="block text-[10px] font-bold text-text/45 uppercase tracking-wider mb-1.5">Due
									Date</label>
								<input v-model="newTask.due" type="date"
									class="input-field rounded-xl border-heading/15" />
							</div>
						</div>
					</div>
					<div class="px-5 py-4 border-t border-heading/8 flex gap-3 bg-heading/[0.01]">
						<button @click="showCreateModal = false"
							class="flex-1 py-2.5 rounded-xl border border-heading/15 text-sm font-semibold text-text/50 hover:bg-heading/5 transition-colors">
							Cancel
						</button>
						<button @click="createTask" :disabled="!newTask.title.trim()"
							class="flex-1 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 active:scale-95 transition-all shadow-md shadow-accent/20 disabled:opacity-40 disabled:cursor-not-allowed">
							Create Task
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
	transform: translateY(-5px);
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
</style>