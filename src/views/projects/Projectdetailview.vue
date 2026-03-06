<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { addIcons } from 'oh-vue-icons'
import {
	BiArrowLeft, BiPencil, BiThreeDotsVertical, BiArchive,
	BiTrash, BiPlusCircle, BiCheckCircle, BiClock, BiPeople,
	BiCalendar3, BiFlag, BiArrowRight,
	MdFolderspecialOutlined, BiCardList, BiLayoutWtf,
	BiChevronDown, BiPersonPlus, BiXCircle,
} from 'oh-vue-icons/icons'

addIcons(
	BiArrowLeft, BiPencil, BiThreeDotsVertical, BiArchive,
	BiTrash, BiPlusCircle, BiCheckCircle, BiClock, BiPeople,
	BiCalendar3, BiFlag, BiArrowRight,
	MdFolderspecialOutlined, BiCardList, BiLayoutWtf,
	BiChevronDown, BiPersonPlus, BiXCircle,
)

const router = useRouter()
const route = useRoute()

const activeTab = ref('overview') // overview | tasks | members
const tabs = [
	{ key: 'overview', label: 'Overview', icon: 'md-folderspecial-outlined' },
	{ key: 'tasks', label: 'Tasks', icon: 'bi-card-list' },
	{ key: 'members', label: 'Members', icon: 'bi-people' },
]

// ── Static project data ───────────────────────────────
const project = {
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
}

// ── Tasks (static) ────────────────────────────────────
const tasks = ref([
	{ id: 1, title: 'Set up project scaffolding and repo', status: 'Done', priority: 'High', assignee: 'AH', due: 'Jan 18' },
	{ id: 2, title: 'Design authentication flow (Login/Register)', status: 'Done', priority: 'High', assignee: 'SK', due: 'Jan 22' },
	{ id: 3, title: 'Implement JWT/Sanctum backend auth', status: 'Done', priority: 'Urgent', assignee: 'NR', due: 'Jan 25' },
	{ id: 4, title: 'Build role & permission RBAC system', status: 'Done', priority: 'High', assignee: 'NR', due: 'Feb 05' },
	{ id: 5, title: 'Dashboard UI & analytics widgets', status: 'In Progress', priority: 'High', assignee: 'SK', due: 'Mar 10' },
	{ id: 6, title: 'Project management CRUD module', status: 'In Progress', priority: 'Urgent', assignee: 'AH', due: 'Mar 15' },
	{ id: 7, title: 'Task management with Kanban board', status: 'Todo', priority: 'High', assignee: 'SK', due: 'Mar 25' },
	{ id: 8, title: 'File upload and preview system', status: 'Todo', priority: 'Medium', assignee: 'DM', due: 'Apr 05' },
	{ id: 9, title: 'In-app notification system', status: 'Todo', priority: 'Medium', assignee: 'NR', due: 'Apr 15' },
	{ id: 10, title: 'End-to-end testing & QA', status: 'Todo', priority: 'High', assignee: 'KU', due: 'May 01' },
])

const taskFilter = ref('All')
const taskStatuses = ['All', 'Todo', 'In Progress', 'Review', 'Done']

const filteredTasks = computed(() => {
	if (taskFilter.value === 'All') return tasks.value
	return tasks.value.filter(t => t.status === taskFilter.value)
})

const taskCounts = computed(() => ({
	total: tasks.value.length,
	done: tasks.value.filter(t => t.status === 'Done').length,
	inProgress: tasks.value.filter(t => t.status === 'In Progress').length,
	todo: tasks.value.filter(t => t.status === 'Todo').length,
}))

// ── Config ────────────────────────────────────────────
const statusConfig = {
	'Planning': { cls: 'bg-slate-400/15 text-slate-500', dot: 'bg-slate-400' },
	'In Progress': { cls: 'bg-accent/10 text-accent', dot: 'bg-accent' },
	'On Hold': { cls: 'bg-amber-500/15 text-amber-600', dot: 'bg-amber-500' },
	'Completed': { cls: 'bg-emerald-500/15 text-emerald-600', dot: 'bg-emerald-500' },
	'Review': { cls: 'bg-violet-500/15 text-violet-500', dot: 'bg-violet-500' },
	'Done': { cls: 'bg-emerald-500/15 text-emerald-600', dot: 'bg-emerald-500' },
	'Todo': { cls: 'bg-slate-400/15 text-slate-500', dot: 'bg-slate-400' },
}
const priorityConfig = {
	Urgent: { cls: 'bg-red-500/15 text-red-500' },
	High: { cls: 'bg-amber-500/15 text-amber-600' },
	Medium: { cls: 'bg-blue-500/15 text-blue-500' },
	Low: { cls: 'bg-slate-400/15 text-slate-500' },
}

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

// Milestone / activity (static)
const milestones = [
	{ label: 'Auth & Roles', done: true, date: 'Feb 10' },
	{ label: 'Dashboard UI', done: false, date: 'Mar 10' },
	{ label: 'Project Module', done: false, date: 'Mar 30' },
	{ label: 'Task & Kanban', done: false, date: 'Apr 20' },
	{ label: 'Launch Beta', done: false, date: 'Jun 30' },
]

const recentActivity = [
	{ text: 'Noman Rahman completed task "Implement JWT/Sanctum backend auth"', time: '2h ago', color: 'bg-emerald-500' },
	{ text: 'Sara Khan updated progress on "Dashboard UI & analytics widgets"', time: '4h ago', color: 'bg-accent' },
	{ text: 'Arif Hossain added task "Project management CRUD module"', time: 'Yesterday', color: 'bg-violet-500' },
	{ text: 'Dina Malik joined the project', time: '2 days ago', color: 'bg-amber-500' },
]
</script>

<template>
	<div class="pb-20 pt-8 px-1">

		<!-- ── Back + Header ──────────────────────────── -->
		<div class="mb-6">
			<button @click="router.push({ name: 'projects' })"
				class="inline-flex items-center gap-2 text-sm text-text/50 hover:text-accent transition-colors mb-4 group">
				<v-icon name="bi-arrow-left" scale="0.85" class="group-hover:-translate-x-0.5 transition-transform" />
				Back to Projects
			</button>

			<div class="flex items-start justify-between gap-4 flex-wrap">
				<div class="flex items-start gap-4">
					<div class="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
						<v-icon name="md-folderspecial-outlined" class="text-accent" scale="1.4" />
					</div>
					<div>
						<div class="flex items-center gap-3 flex-wrap mb-1">
							<h1 class="text-heading leading-none">{{ project.name }}</h1>
							<span
								:class="[statusConfig[project.status].cls, 'inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold']">
								<span
									:class="[statusConfig[project.status].dot, 'w-1.5 h-1.5 rounded-full animate-pulse']"></span>
								{{ project.status }}
							</span>
							<span
								:class="[priorityConfig[project.priority].cls, 'text-xs px-2.5 py-1 rounded-full font-semibold']">
								{{ project.priority }}
							</span>
						</div>
						<p class="text-sm text-text/50 max-w-xl">{{ project.description }}</p>
					</div>
				</div>

				<!-- Actions -->
				<div class="flex items-center gap-2">
					<button
						class="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-heading/10 text-sm font-semibold text-text/60 hover:bg-heading/5 transition-colors">
						<v-icon name="bi-pencil" scale="0.85" /> Edit
					</button>
					<button
						class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 active:scale-95 transition-all shadow-lg shadow-accent/20">
						<v-icon name="bi-plus-circle" scale="0.9" /> Add Task
					</button>
				</div>
			</div>
		</div>

		<!-- ── Quick Stats ────────────────────────────── -->
		<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
			<div class="bg-panel rounded-2xl p-4 border border-heading/5">
				<p class="text-2xl font-display font-bold text-heading">{{ project.progress }}%</p>
				<p class="text-xs text-text/40 mt-0.5">Progress</p>
				<div class="mt-2 h-1.5 bg-heading/8 rounded-full overflow-hidden">
					<div class="h-full rounded-full bg-accent" :style="{ width: project.progress + '%' }"></div>
				</div>
			</div>
			<div class="bg-panel rounded-2xl p-4 border border-heading/5">
				<p class="text-2xl font-display font-bold text-heading">{{ taskCounts.done }}<span
						class="text-base text-text/30">/{{ taskCounts.total }}</span></p>
				<p class="text-xs text-text/40 mt-0.5">Tasks Done</p>
			</div>
			<div class="bg-panel rounded-2xl p-4 border border-heading/5">
				<p class="text-2xl font-display font-bold text-heading">{{ project.members.length }}</p>
				<p class="text-xs text-text/40 mt-0.5">Team Members</p>
			</div>
			<div class="bg-panel rounded-2xl p-4 border border-heading/5">
				<p class="text-sm font-bold text-heading">{{ formatDate(project.endDate).split(',')[0] }}</p>
				<p class="text-xs text-text/40 mt-0.5">Deadline</p>
			</div>
		</div>

		<!-- ── Tabs ───────────────────────────────────── -->
		<div class="flex items-center gap-1 border-b border-heading/8 mb-6">
			<button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key" :class="[
				'flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all border-b-2 -mb-px',
				activeTab === tab.key
					? 'border-accent text-accent'
					: 'border-transparent text-text/40 hover:text-text/70'
			]">
				<v-icon :name="tab.icon" scale="0.9" />
				{{ tab.label }}
			</button>
		</div>

		<!-- ════════════════════════════════════════════ -->
		<!-- TAB: OVERVIEW -->
		<!-- ════════════════════════════════════════════ -->
		<div v-if="activeTab === 'overview'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">

			<!-- Left: Goal + Milestones -->
			<div class="lg:col-span-2 flex flex-col gap-5">

				<!-- Project Goal -->
				<div class="bg-panel rounded-2xl border border-heading/5 p-5">
					<h3 class="text-sm font-bold text-heading mb-2">Project Goal</h3>
					<p class="text-sm text-text/60 leading-relaxed">{{ project.goal }}</p>
					<div class="mt-4 grid grid-cols-2 gap-3 text-sm">
						<div class="flex items-center gap-2 text-text/40">
							<v-icon name="bi-calendar3" scale="0.85" />
							<span>Start: <span class="text-heading font-semibold">{{ formatDate(project.startDate)
							}}</span></span>
						</div>
						<div class="flex items-center gap-2 text-text/40">
							<v-icon name="bi-flag" scale="0.85" />
							<span>End: <span class="text-heading font-semibold">{{ formatDate(project.endDate)
							}}</span></span>
						</div>
					</div>
				</div>

				<!-- Milestones -->
				<div class="bg-panel rounded-2xl border border-heading/5 p-5">
					<h3 class="text-sm font-bold text-heading mb-4">Milestones</h3>
					<div class="relative">
						<!-- Vertical line -->
						<div class="absolute left-3.5 top-4 bottom-4 w-px bg-heading/10"></div>
						<div class="flex flex-col gap-4">
							<div v-for="m in milestones" :key="m.label" class="flex items-center gap-4 relative">
								<div :class="[
									'w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border-2',
									m.done ? 'bg-emerald-500 border-emerald-500' : 'bg-panel border-heading/15'
								]">
									<v-icon v-if="m.done" name="bi-check-circle" class="text-white" scale="0.7" />
									<div v-else class="w-2 h-2 rounded-full bg-heading/20"></div>
								</div>
								<div class="flex-1 flex items-center justify-between">
									<p
										:class="['text-sm font-semibold', m.done ? 'text-text/40 line-through' : 'text-heading']">
										{{ m.label }}
									</p>
									<span class="text-xs text-text/30">{{ m.date }}</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Recent Activity -->
				<div class="bg-panel rounded-2xl border border-heading/5 p-5">
					<h3 class="text-sm font-bold text-heading mb-4">Recent Activity</h3>
					<div class="flex flex-col gap-3">
						<div v-for="activity in recentActivity" :key="activity.text" class="flex items-start gap-3">
							<div :class="[activity.color, 'w-2 h-2 rounded-full mt-1.5 shrink-0']"></div>
							<div>
								<p class="text-xs text-text/60 leading-relaxed">{{ activity.text }}</p>
								<p class="text-[11px] text-text/30 mt-0.5">{{ activity.time }}</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Right: Team + Task breakdown -->
			<div class="flex flex-col gap-5">
				<!-- Team -->
				<div class="bg-panel rounded-2xl border border-heading/5 p-5">
					<div class="flex items-center justify-between mb-4">
						<h3 class="text-sm font-bold text-heading">Team</h3>
						<button class="text-xs text-accent font-semibold flex items-center gap-1">
							<v-icon name="bi-person-plus" scale="0.8" /> Add
						</button>
					</div>
					<div class="flex flex-col gap-3">
						<div v-for="m in project.members" :key="m.name" class="flex items-center gap-3">
							<div
								:class="[m.color, 'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0']">
								{{ m.initials }}
							</div>
							<div class="flex-1 min-w-0">
								<p class="text-xs font-bold text-heading">{{ m.name }}</p>
								<p class="text-[11px] text-text/40 truncate">{{ m.role }}</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Task Breakdown -->
				<div class="bg-panel rounded-2xl border border-heading/5 p-5">
					<h3 class="text-sm font-bold text-heading mb-4">Task Breakdown</h3>
					<div class="space-y-3">
						<div v-for="(count, label) in { 'Done': taskCounts.done, 'In Progress': taskCounts.inProgress, 'Todo': taskCounts.todo }"
							:key="label" class="flex items-center gap-3">
							<span class="text-xs text-text/40 w-20 shrink-0">{{ label }}</span>
							<div class="flex-1 h-2 bg-heading/8 rounded-full overflow-hidden">
								<div class="h-full rounded-full transition-all"
									:class="label === 'Done' ? 'bg-emerald-500' : label === 'In Progress' ? 'bg-accent' : 'bg-slate-300'"
									:style="{ width: (count / taskCounts.total * 100) + '%' }">
								</div>
							</div>
							<span class="text-xs font-bold text-heading w-4 shrink-0">{{ count }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- ════════════════════════════════════════════ -->
		<!-- TAB: TASKS -->
		<!-- ════════════════════════════════════════════ -->
		<div v-else-if="activeTab === 'tasks'">
			<!-- Task toolbar -->
			<div class="flex items-center gap-3 mb-5 flex-wrap">
				<div class="flex items-center gap-1 bg-panel border border-heading/10 rounded-xl p-1">
					<button v-for="s in taskStatuses" :key="s" @click="taskFilter = s" :class="['px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
						taskFilter === s ? 'bg-accent text-white shadow-sm' : 'text-text/40 hover:text-text/70']">
						{{ s }}
					</button>
				</div>
				<button
					class="ml-auto inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent/90 active:scale-95 transition-all shadow-md shadow-accent/20">
					<v-icon name="bi-plus-circle" scale="0.85" /> Add Task
				</button>
			</div>

			<!-- Task list -->
			<div class="bg-panel rounded-2xl border border-heading/5 overflow-hidden">
				<div class="divide-y divide-heading/5">
					<div v-for="task in filteredTasks" :key="task.id"
						class="flex items-center gap-4 px-5 py-4 hover:bg-heading/[0.02] transition-colors group cursor-pointer">
						<!-- Status circle -->
						<div :class="[
							'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
							task.status === 'Done' ? 'border-emerald-500 bg-emerald-500' : 'border-heading/20 group-hover:border-accent'
						]">
							<v-icon v-if="task.status === 'Done'" name="bi-check-circle" class="text-white"
								scale="0.55" />
						</div>
						<!-- Title -->
						<p
							:class="['flex-1 text-sm font-semibold', task.status === 'Done' ? 'text-text/30 line-through' : 'text-heading']">
							{{ task.title }}
						</p>
						<!-- Meta -->
						<div class="flex items-center gap-3 shrink-0">
							<span
								:class="[statusConfig[task.status]?.cls, 'text-xs px-2 py-0.5 rounded-full font-semibold hidden sm:inline-flex']">
								{{ task.status }}
							</span>
							<span
								:class="[priorityConfig[task.priority]?.cls, 'text-xs px-2 py-0.5 rounded-full font-semibold hidden md:inline-flex']">
								{{ task.priority }}
							</span>
							<div
								class="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white text-[9px] font-bold">
								{{ task.assignee }}
							</div>
							<span class="text-xs text-text/30 hidden sm:block">{{ task.due }}</span>
						</div>
					</div>
				</div>
				<div v-if="filteredTasks.length === 0" class="text-center py-12 text-sm text-text/30">
					No tasks in this category.
				</div>
			</div>
		</div>

		<!-- ════════════════════════════════════════════ -->
		<!-- TAB: MEMBERS -->
		<!-- ════════════════════════════════════════════ -->
		<div v-else-if="activeTab === 'members'">
			<div class="flex justify-end mb-5">
				<button
					class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 active:scale-95 transition-all shadow-lg shadow-accent/20">
					<v-icon name="bi-person-plus" scale="0.9" /> Add Member
				</button>
			</div>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				<div v-for="m in project.members" :key="m.name"
					class="bg-panel rounded-2xl border border-heading/5 p-5 flex items-center gap-4 hover:shadow-md transition-all">
					<div
						:class="[m.color, 'w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm font-bold shrink-0']">
						{{ m.initials }}
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-sm font-bold text-heading">{{ m.name }}</p>
						<p class="text-xs text-text/40">{{ m.role }}</p>
						<p class="text-xs text-accent mt-0.5 truncate">{{ m.email }}</p>
					</div>
					<button
						class="w-7 h-7 rounded-lg flex items-center justify-center text-text/20 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0">
						<v-icon name="bi-x-circle" scale="0.85" />
					</button>
				</div>
			</div>
		</div>

	</div>
</template>