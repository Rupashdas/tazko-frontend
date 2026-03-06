<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { addIcons } from 'oh-vue-icons'
import {
	BiArrowLeft, BiPencil, BiThreeDotsVertical, BiArchive,
	BiTrash, BiPlusCircle, BiCheckCircle, BiClock, BiPeople,
	BiCalendar3, BiFlag, BiArrowRight,
	MdFolderspecialOutlined, BiCardList, BiLayoutWtf,
	BiChevronDown, BiPersonPlus, BiXCircle, BiBarChart,
	BiLightningCharge, BiChat, BiActivity, BiBoxArrowUpRight
} from 'oh-vue-icons/icons'

addIcons(
	BiArrowLeft, BiPencil, BiThreeDotsVertical, BiArchive,
	BiTrash, BiPlusCircle, BiCheckCircle, BiClock, BiPeople,
	BiCalendar3, BiFlag, BiArrowRight,
	MdFolderspecialOutlined, BiCardList, BiLayoutWtf,
	BiChevronDown, BiPersonPlus, BiXCircle, BiBarChart,
	BiLightningCharge, BiChat, BiActivity, BiBoxArrowUpRight
)

const router = useRouter()
const route = useRoute()

const activeTab = ref('overview')
const tabs = [
	{ key: 'overview', label: 'Overview', icon: 'md-folderspecial-outlined' },
	{ key: 'tasks', label: 'Tasks', icon: 'bi-card-list' },
	{ key: 'members', label: 'Members', icon: 'bi-people' },
]

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

const recentActivity = [
	{ text: 'Sara Khan updated task "Dashboard UI & analytics widgets"', time: '4h ago', color: 'bg-accent', initials: 'SK' },
	{ text: 'Arif Hossain added task "Project management CRUD module"', time: 'Yesterday', color: 'bg-violet-500', initials: 'AH' },
	{ text: 'Dina Malik joined the project', time: '2 days ago', color: 'bg-amber-500', initials: 'DM' },
	{ text: 'Noman Rahman completed "Build role & permission RBAC"', time: '3 days ago', color: 'bg-emerald-500', initials: 'NR' },
]

const taskFilter = ref('All')
const taskStatuses = ['All', 'Todo', 'In Progress', 'Done']

const filteredTasks = computed(() => {
	if (taskFilter.value === 'All') return tasks.value
	return tasks.value.filter(t => t.status === taskFilter.value)
})

// Stats
const doneCount = computed(() => tasks.value.filter(t => t.status === 'Done').length)
const inProgressCount = computed(() => tasks.value.filter(t => t.status === 'In Progress').length)
const todoCount = computed(() => tasks.value.filter(t => t.status === 'Todo').length)
const daysLeft = computed(() => {
	const diff = Math.ceil((new Date(project.endDate) - new Date()) / (1000 * 60 * 60 * 24))
	return diff
})

const statusConfig = {
	'Planning': { cls: 'bg-slate-400/15 text-slate-500', dot: 'bg-slate-400' },
	'In Progress': { cls: 'bg-accent/10 text-accent', dot: 'bg-accent' },
	'On Hold': { cls: 'bg-amber-500/15 text-amber-600', dot: 'bg-amber-500' },
	'Completed': { cls: 'bg-emerald-500/15 text-emerald-600', dot: 'bg-emerald-500' },
}
const priorityConfig = {
	Urgent: { cls: 'bg-red-500/15 text-red-500' },
	High: { cls: 'bg-amber-500/15 text-amber-600' },
	Medium: { cls: 'bg-blue-500/15 text-blue-500' },
	Low: { cls: 'bg-slate-400/15 text-slate-500' },
}
const taskStatusConfig = {
	'Done': { cls: 'bg-emerald-500/15 text-emerald-600', dot: 'bg-emerald-500' },
	'In Progress': { cls: 'bg-accent/10 text-accent', dot: 'bg-accent' },
	'Todo': { cls: 'bg-slate-400/15 text-slate-500', dot: 'bg-slate-400' },
	'Review': { cls: 'bg-violet-500/15 text-violet-600', dot: 'bg-violet-500' },
}

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

// SVG progress ring
const radius = 36
const circumference = 2 * Math.PI * radius
const strokeDash = computed(() => (project.progress / 100) * circumference)

const openTasksView = () => router.push({ name: 'project-tasks', params: { id: project.id } })

</script>

<template>
	<div class="pb-20 pt-8 px-1">

		<!-- ── Back ───────────────────────────────────── -->
		<button @click="router.push({ name: 'projects' })"
			class="inline-flex items-center gap-2 text-sm text-text/50 hover:text-accent transition-colors mb-5 group">
			<v-icon name="bi-arrow-left" scale="0.85" class="group-hover:-translate-x-0.5 transition-transform" />
			Back to Projects
		</button>

		<!-- ── Hero Banner ────────────────────────────── -->
		<div class="relative bg-panel rounded-2xl border border-heading/5 overflow-hidden mb-6">
			<!-- Gradient top strip -->
			<div class="h-1.5 w-full bg-gradient-to-r from-accent via-violet-500 to-indigo-500"></div>

			<div class="p-6 flex flex-wrap gap-6 items-start justify-between">
				<!-- Left: title + meta -->
				<div class="flex items-start gap-4 flex-1 min-w-0">
					<div
						class="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-accent/25">
						<v-icon name="md-folderspecial-outlined" class="text-white" scale="1.6" />
					</div>
					<div class="min-w-0">
						<div class="flex items-center gap-2.5 flex-wrap mb-1.5">
							<h1 class="text-heading leading-none">{{ project.name }}</h1>
							<span
								:class="[statusConfig[project.status].cls, 'inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-bold']">
								<span
									:class="[statusConfig[project.status].dot, 'w-1.5 h-1.5 rounded-full animate-pulse']"></span>
								{{ project.status }}
							</span>
							<span
								:class="[priorityConfig[project.priority].cls, 'text-xs px-2.5 py-1 rounded-full font-bold']">
								{{ project.priority }}
							</span>
						</div>
						<p class="text-sm text-text/50 leading-relaxed max-w-2xl">{{ project.description }}</p>

						<!-- Date row -->
						<div class="flex items-center gap-4 mt-3 flex-wrap">
							<div class="flex items-center gap-1.5 text-xs text-text/40">
								<v-icon name="bi-calendar3" scale="0.8" />
								<span>{{ formatDate(project.startDate) }}</span>
								<span class="text-text/20">→</span>
								<span>{{ formatDate(project.endDate) }}</span>
							</div>
							<div class="flex items-center gap-1.5 text-xs"
								:class="daysLeft <= 7 ? 'text-amber-500 font-semibold' : 'text-text/40'">
								<v-icon name="bi-clock" scale="0.8" />
								{{ daysLeft > 0 ? `${daysLeft} days remaining` : 'Overdue' }}
							</div>
						</div>
					</div>
				</div>

				<!-- Right: Actions + Progress Ring -->
				<div class="flex items-center gap-4 shrink-0">
					<!-- Progress ring -->
					<div class="relative w-20 h-20">
						<svg width="80" height="80" viewBox="0 0 80 80" class="-rotate-90">
							<circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" stroke-width="6"
								class="text-heading/8" />
							<circle cx="40" cy="40" r="36" fill="none" stroke="url(#progressGrad)" stroke-width="6"
								stroke-linecap="round" :stroke-dasharray="`${strokeDash} ${circumference}`" />
							<defs>
								<linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
									<stop offset="0%" stop-color="#6c63ff" />
									<stop offset="100%" stop-color="#8b5cf6" />
								</linearGradient>
							</defs>
						</svg>
						<div class="absolute inset-0 flex flex-col items-center justify-center">
							<span class="text-lg font-bold text-heading leading-none">{{ project.progress }}%</span>
							<span class="text-[8px] text-text/40 uppercase tracking-wider">done</span>
						</div>
					</div>

					<!-- Action buttons -->
					<div class="flex flex-col gap-2">
						<button
							class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-heading/10 text-sm font-semibold text-text/60 hover:bg-heading/5 transition-colors whitespace-nowrap">
							<v-icon name="bi-pencil" scale="0.85" />
							Edit
						</button>
						<button
							class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/8 text-accent text-sm font-semibold hover:bg-accent/15 transition-colors whitespace-nowrap">
							<v-icon name="bi-person-plus" scale="0.85" />
							Add Member
						</button>
					</div>
				</div>
			</div>

			<!-- Goal banner -->
			<div v-if="project.goal"
				class="mx-6 mb-5 px-4 py-3 rounded-xl bg-accent/5 border border-accent/10 flex items-center gap-3">
				<v-icon name="bi-lightning-charge" class="text-accent shrink-0" scale="0.9" />
				<p class="text-xs text-text/60"><span class="font-bold text-accent">Goal:</span> {{ project.goal }}</p>
			</div>
		</div>

		<!-- ── Quick Stats Row ────────────────────────── -->
		<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
			<div class="bg-panel rounded-xl border border-heading/5 px-4 py-3.5 flex items-center gap-3">
				<div class="w-8 h-8 rounded-lg bg-heading/5 flex items-center justify-center shrink-0">
					<v-icon name="bi-card-list" class="text-text/50" scale="0.9" />
				</div>
				<div>
					<p class="text-xl font-bold text-heading leading-none">{{ tasks.length }}</p>
					<p class="text-[10px] text-text/40 mt-0.5">Total Tasks</p>
				</div>
			</div>
			<div class="bg-panel rounded-xl border border-heading/5 px-4 py-3.5 flex items-center gap-3">
				<div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
					<v-icon name="bi-check-circle" class="text-emerald-500" scale="0.9" />
				</div>
				<div>
					<p class="text-xl font-bold text-heading leading-none">{{ doneCount }}</p>
					<p class="text-[10px] text-text/40 mt-0.5">Completed</p>
				</div>
			</div>
			<div class="bg-panel rounded-xl border border-heading/5 px-4 py-3.5 flex items-center gap-3">
				<div class="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
					<v-icon name="bi-lightning-charge" class="text-accent" scale="0.9" />
				</div>
				<div>
					<p class="text-xl font-bold text-heading leading-none">{{ inProgressCount }}</p>
					<p class="text-[10px] text-text/40 mt-0.5">In Progress</p>
				</div>
			</div>
			<div class="bg-panel rounded-xl border border-heading/5 px-4 py-3.5 flex items-center gap-3">
				<div class="w-8 h-8 rounded-lg bg-slate-400/10 flex items-center justify-center shrink-0">
					<v-icon name="bi-clock" class="text-slate-400" scale="0.9" />
				</div>
				<div>
					<p class="text-xl font-bold text-heading leading-none">{{ todoCount }}</p>
					<p class="text-[10px] text-text/40 mt-0.5">To Do</p>
				</div>
			</div>
		</div>

		<!-- ── Tabs ───────────────────────────────────── -->
		<div class="flex items-center gap-1 mb-6 bg-panel border border-heading/5 rounded-xl p-1 w-fit">
			<button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key" :class="['inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
				activeTab === tab.key
					? 'bg-accent text-white shadow-sm shadow-accent/30'
					: 'text-text/50 hover:text-text/80 hover:bg-heading/5']">
				<v-icon :name="tab.icon" scale="0.85" />
				{{ tab.label }}
			</button>
		</div>

		<!-- ──────────────────────────────────────────── -->
		<!-- TAB: Overview                               -->
		<!-- ──────────────────────────────────────────── -->
		<div v-if="activeTab === 'overview'" class="grid grid-cols-1 lg:grid-cols-3 gap-5">

			<!-- Progress breakdown -->
			<div class="lg:col-span-2 bg-panel rounded-2xl border border-heading/5 p-5">
				<h3 class="font-bold text-heading text-sm mb-4 flex items-center gap-2">
					<v-icon name="bi-bar-chart" class="text-accent" scale="0.9" />
					Task Breakdown
				</h3>
				<div class="space-y-3.5">
					<div v-for="(st, label) in { 'Done': doneCount, 'In Progress': inProgressCount, 'To Do': todoCount }"
						:key="label">
						<div class="flex items-center justify-between mb-1.5">
							<span class="text-xs font-semibold text-text/60">{{ label }}</span>
							<span class="text-xs text-text/40">{{ st }} task{{ st !== 1 ? 's' : '' }}</span>
						</div>
						<div class="h-2 bg-heading/8 rounded-full overflow-hidden">
							<div class="h-full rounded-full transition-all duration-500" :class="{
								'bg-emerald-500': label === 'Done',
								'bg-accent': label === 'In Progress',
								'bg-slate-300': label === 'To Do',
							}" :style="`width: ${tasks.length ? (st / tasks.length) * 100 : 0}%`">
							</div>
						</div>
					</div>
				</div>

				<!-- Timeline -->
				<div class="mt-6 pt-5 border-t border-heading/5">
					<h4 class="text-xs font-bold text-text/40 uppercase tracking-wider mb-3">Timeline</h4>
					<div class="relative">
						<div class="flex items-center justify-between text-xs text-text/40 mb-2">
							<span>{{ formatDate(project.startDate) }}</span>
							<span>{{ formatDate(project.endDate) }}</span>
						</div>
						<div class="h-3 bg-heading/8 rounded-full overflow-hidden relative">
							<div class="h-full bg-gradient-to-r from-accent to-violet-500 rounded-full transition-all"
								:style="`width: ${project.progress}%`"></div>
							<!-- Today indicator -->
							<div class="absolute top-0 bottom-0 w-0.5 bg-amber-500" style="left: 40%" title="Today">
								<div
									class="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] text-amber-500 font-bold whitespace-nowrap">
									Today</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Activity Feed -->
			<div class="bg-panel rounded-2xl border border-heading/5 p-5">
				<h3 class="font-bold text-heading text-sm mb-4 flex items-center gap-2">
					<v-icon name="bi-activity" class="text-accent" scale="0.9" />
					Recent Activity
				</h3>
				<div class="space-y-4">
					<div v-for="(item, i) in recentActivity" :key="i" class="flex items-start gap-3">
						<div
							:class="[item.color, 'w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 mt-0.5']">
							{{ item.initials }}
						</div>
						<div class="min-w-0 flex-1">
							<p class="text-xs text-text/70 leading-relaxed">{{ item.text }}</p>
							<p class="text-[10px] text-text/35 mt-0.5">{{ item.time }}</p>
						</div>
					</div>
				</div>
				<button
					class="mt-4 w-full text-xs text-accent/70 hover:text-accent font-semibold py-2 rounded-lg hover:bg-accent/5 transition-colors">
					View all activity →
				</button>
			</div>
		</div>

		<!-- ──────────────────────────────────────────── -->
		<!-- TAB: Tasks                                  -->
		<!-- ──────────────────────────────────────────── -->
		<div v-else-if="activeTab === 'tasks'">

			<!-- Tab header -->
			<div class="flex items-center justify-between mb-5">
				<div>
					<h3 class="font-bold text-heading text-sm">Recent Tasks</h3>
					<p class="text-xs text-text/40 mt-0.5">Showing {{ tasks.slice(0, 5).length }} of {{ tasks.length }}
						tasks</p>
				</div>
				<button @click="openTasksView"
					class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 active:scale-95 transition-all shadow-md shadow-accent/20">
					<v-icon name="bi-box-arrow-up-right" scale="0.85" />
					Full Task View
				</button>
			</div>

			<!-- Preview: first 5 tasks -->
			<div class="bg-panel rounded-2xl border border-heading/5 overflow-hidden mb-4">
				<div class="divide-y divide-heading/5">
					<div v-for="task in tasks.slice(0, 5)" :key="task.id"
						class="flex items-center gap-4 px-5 py-3.5 hover:bg-heading/[0.015] transition-colors group cursor-pointer"
						@click="openTasksView">

						<!-- Status dot -->
						<div
							:class="[taskStatusConfig[task.status]?.dot || 'bg-slate-300', 'w-2 h-2 rounded-full shrink-0']">
						</div>

						<!-- Title -->
						<p class="flex-1 text-sm font-medium min-w-0 group-hover:text-accent transition-colors"
							:class="task.status === 'Done' ? 'line-through text-text/35' : 'text-heading'">
							{{ task.title }}
						</p>

						<!-- Badges -->
						<div class="flex items-center gap-2 shrink-0">
							<span
								:class="[priorityConfig[task.priority]?.cls, 'text-[10px] px-2 py-0.5 rounded-full font-bold hidden sm:inline-flex']">
								{{ task.priority }}
							</span>
							<span
								:class="[taskStatusConfig[task.status]?.cls, 'text-[10px] px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1']">
								<span :class="[taskStatusConfig[task.status]?.dot, 'w-1 h-1 rounded-full']"></span>
								{{ task.status }}
							</span>
							<div
								class="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white text-[9px] font-bold">
								{{ task.assignee }}
							</div>
							<span class="text-[10px] text-text/35 hidden md:flex items-center gap-1">
								<v-icon name="bi-calendar3" scale="0.7" />
								{{ task.due }}
							</span>
						</div>
					</div>
				</div>
			</div>

			<!-- View all button -->
			<button @click="openTasksView"
				class="w-full py-3 rounded-xl border border-dashed border-heading/15 text-sm font-semibold text-text/40 hover:text-accent hover:border-accent/30 hover:bg-accent/5 transition-all flex items-center justify-center gap-2">
				<v-icon name="bi-card-list" scale="0.9" />
				View all {{ tasks.length }} tasks →
			</button>
		</div>

		<!-- ──────────────────────────────────────────── -->
		<!-- TAB: Members                                -->
		<!-- ──────────────────────────────────────────── -->
		<div v-else-if="activeTab === 'members'">
			<div class="flex items-center justify-between mb-4">
				<p class="text-sm text-text/40">{{ project.members.length }} team member{{ project.members.length !== 1
					? 's' : '' }}</p>
				<button
					class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent/90 active:scale-95 transition-all shadow-md shadow-accent/20">
					<v-icon name="bi-person-plus" scale="0.85" />
					Add Member
				</button>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				<div v-for="member in project.members" :key="member.email"
					class="bg-panel rounded-2xl border border-heading/5 p-5 flex items-center gap-4 hover:shadow-md hover:border-accent/10 transition-all group">
					<div
						:class="[member.color, 'w-12 h-12 rounded-2xl flex items-center justify-center text-white text-base font-bold shrink-0 shadow-sm group-hover:scale-105 transition-transform']">
						{{ member.initials }}
					</div>
					<div class="min-w-0 flex-1">
						<p class="font-bold text-heading text-sm leading-tight">{{ member.name }}</p>
						<p class="text-xs text-accent/80 font-medium mt-0.5">{{ member.role }}</p>
						<p class="text-[10px] text-text/35 mt-1 truncate">{{ member.email }}</p>
					</div>
					<button
						class="w-7 h-7 rounded-lg border border-heading/10 flex items-center justify-center text-text/25 hover:text-red-500 hover:border-red-200 transition-colors opacity-0 group-hover:opacity-100">
						<v-icon name="bi-x-circle" scale="0.8" />
					</button>
				</div>
			</div>
		</div>

	</div>
</template>

<style scoped>
.line-clamp-1 {
	display: -webkit-box;
	-webkit-line-clamp: 1;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
</style>