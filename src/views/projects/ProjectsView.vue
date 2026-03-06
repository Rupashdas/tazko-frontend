<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { addIcons } from 'oh-vue-icons'
import {
	BiPlusCircle, BiSearch, BiGrid3X3Gap, BiListUl,
	MdFolderspecialOutlined, BiPeople, BiCalendar3,
	BiThreeDotsVertical, BiArchive, BiPencil, BiTrash,
	BiFlag, BiCheckCircle, BiClock,
	BiChevronDown, BiArrowRight,
} from 'oh-vue-icons/icons'

addIcons(
	BiPlusCircle, BiSearch, BiGrid3X3Gap, BiListUl,
	MdFolderspecialOutlined, BiPeople, BiCalendar3,
	BiThreeDotsVertical, BiArchive, BiPencil, BiTrash,
	BiFlag, BiCheckCircle, BiClock,
	BiChevronDown, BiArrowRight,
)

const router = useRouter()
const viewMode = ref('grid') // 'grid' | 'list'
const searchQuery = ref('')
const statusFilter = ref('All')
const priorityFilter = ref('All')
const showCreateModal = ref(false)
const openMenuId = ref(null)

const statuses = ['All', 'Planning', 'In Progress', 'On Hold', 'Completed']
const priorities = ['All', 'Urgent', 'High', 'Medium', 'Low']

// ── Static project data ───────────────────────────────
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

// ── Filters ───────────────────────────────────────────
const filteredProjects = computed(() => {
	return projects.value.filter(p => {
		const matchSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
			p.description.toLowerCase().includes(searchQuery.value.toLowerCase())
		const matchStatus = statusFilter.value === 'All' || p.status === statusFilter.value
		const matchPriority = priorityFilter.value === 'All' || p.priority === priorityFilter.value
		return matchSearch && matchStatus && matchPriority
	})
})

// ── Config maps ───────────────────────────────────────
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

const progressColor = (p) => {
	if (p >= 100) return 'bg-emerald-500'
	if (p >= 60) return 'bg-accent'
	if (p >= 30) return 'bg-amber-500'
	return 'bg-red-400'
}

const formatDate = (d) => {
	const date = new Date(d)
	return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const toggleMenu = (id) => { openMenuId.value = openMenuId.value === id ? null : id }

// Summary stats
const totalProjects = computed(() => projects.value.length)
const activeCount = computed(() => projects.value.filter(p => p.status === 'In Progress').length)
const completedCount = computed(() => projects.value.filter(p => p.status === 'Completed').length)
</script>

<template>
	<div class="pb-20 pt-8 px-1" @click="openMenuId = null">

		<!-- ── Header ─────────────────────────────────── -->
		<div class="mb-7 flex items-end justify-between">
			<div>
				<p class="text-sm font-semibold text-accent/80 tracking-widest uppercase mb-1">Workspace</p>
				<h1 class="text-heading leading-none">Projects</h1>
				<p class="text-text/50 mt-2 text-sm">
					{{ totalProjects }} projects · {{ activeCount }} active · {{ completedCount }} completed
				</p>
			</div>
			<button @click.stop="showCreateModal = true"
				class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 active:scale-95 transition-all shadow-lg shadow-accent/20">
				<v-icon name="bi-plus-circle" scale="0.9" />
				New Project
			</button>
		</div>

		<!-- ── Toolbar ────────────────────────────────── -->
		<div class="flex flex-wrap items-center gap-3 mb-6">
			<!-- Search -->
			<div class="relative flex-1 min-w-48">
				<v-icon name="bi-search" class="absolute left-3 top-1/2 -translate-y-1/2 text-text/30" scale="0.85" />
				<input v-model="searchQuery" type="text" placeholder="Search projects…"
					class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-heading/10 bg-panel text-sm text-heading placeholder-text/30 focus:outline-none focus:border-accent/50 transition-colors" />
			</div>

			<!-- Status filter -->
			<div class="relative">
				<select v-model="statusFilter"
					class="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-heading/10 bg-panel text-sm text-text/70 focus:outline-none focus:border-accent/50 transition-colors cursor-pointer">
					<option v-for="s in statuses" :key="s">{{ s }}</option>
				</select>
				<v-icon name="bi-chevron-down" scale="0.75"
					class="absolute right-2.5 top-1/2 -translate-y-1/2 text-text/40 pointer-events-none" />
			</div>

			<!-- Priority filter -->
			<div class="relative">
				<select v-model="priorityFilter"
					class="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-heading/10 bg-panel text-sm text-text/70 focus:outline-none focus:border-accent/50 transition-colors cursor-pointer">
					<option v-for="p in priorities" :key="p">{{ p }}</option>
				</select>
				<v-icon name="bi-chevron-down" scale="0.75"
					class="absolute right-2.5 top-1/2 -translate-y-1/2 text-text/40 pointer-events-none" />
			</div>

			<!-- View toggle -->
			<div class="flex items-center gap-1 bg-panel border border-heading/10 rounded-xl p-1">
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

		<!-- ── Empty state ────────────────────────────── -->
		<div v-if="filteredProjects.length === 0" class="text-center py-24">
			<div class="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
				<v-icon name="md-folderspecial-outlined" class="text-accent" scale="1.8" />
			</div>
			<h3 class="text-lg font-bold text-heading mb-1">No projects found</h3>
			<p class="text-sm text-text/40">Try adjusting your filters or create a new project.</p>
		</div>

		<!-- ── GRID VIEW ──────────────────────────────── -->
		<div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
			<div v-for="project in filteredProjects" :key="project.id"
				class="bg-panel rounded-2xl border border-heading/5 hover:shadow-lg hover:border-accent/10 transition-all group overflow-hidden flex flex-col">

				<!-- Card top -->
				<div class="p-5 flex-1">
					<div class="flex items-start justify-between mb-4">
						<div class="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
							<v-icon name="md-folderspecial-outlined" class="text-accent" scale="1.1" />
						</div>
						<!-- 3-dot menu -->
						<div class="relative" @click.stop>
							<button @click="toggleMenu(project.id)"
								class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-heading/5 transition-colors text-text/30 hover:text-text/70">
								<v-icon name="bi-three-dots-vertical" scale="0.85" />
							</button>
							<Transition name="fade-drop">
								<div v-if="openMenuId === project.id"
									class="absolute right-0 top-full mt-1 w-40 bg-panel rounded-xl border border-heading/10 shadow-xl z-20 overflow-hidden">
									<button @click="router.push({ name: 'project-detail', params: { id: project.id } })"
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
									<button
										class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
										<v-icon name="bi-trash" scale="0.85" /> Delete
									</button>
								</div>
							</Transition>
						</div>
					</div>

					<h3 class="text-base font-bold text-heading mb-1 group-hover:text-accent transition-colors cursor-pointer"
						@click="router.push({ name: 'project-detail', params: { id: project.id } })">
						{{ project.name }}
					</h3>
					<p class="text-xs text-text/50 leading-relaxed line-clamp-2 mb-4">{{ project.description }}</p>

					<!-- Badges -->
					<div class="flex items-center gap-2 flex-wrap mb-4">
						<span
							:class="[statusConfig[project.status].cls, 'inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold']">
							<span :class="[statusConfig[project.status].dot, 'w-1.5 h-1.5 rounded-full']"></span>
							{{ project.status }}
						</span>
						<span
							:class="[priorityConfig[project.priority].cls, 'text-xs px-2.5 py-1 rounded-full font-semibold']">
							{{ project.priority }}
						</span>
					</div>

					<!-- Progress -->
					<div class="mb-4">
						<div class="flex items-center justify-between text-xs mb-1.5">
							<span class="text-text/40">Progress</span>
							<span class="font-bold text-heading">{{ project.progress }}%</span>
						</div>
						<div class="h-2 bg-heading/8 rounded-full overflow-hidden">
							<div :class="['h-full rounded-full transition-all', progressColor(project.progress)]"
								:style="{ width: project.progress + '%' }"></div>
						</div>
					</div>

					<!-- Task count -->
					<div class="flex items-center gap-1.5 text-xs text-text/40">
						<v-icon name="bi-check-circle" scale="0.85" />
						{{ project.taskCounts.done }}/{{ project.taskCounts.total }} tasks done
					</div>
				</div>

				<!-- Card footer -->
				<div class="px-5 py-3 border-t border-heading/5 flex items-center justify-between bg-heading/[0.01]">
					<!-- Member avatars -->
					<div class="flex -space-x-2">
						<div v-for="(m, i) in project.members.slice(0, 3)" :key="i"
							:class="[m.color, 'w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-panel']">
							{{ m.initials }}
						</div>
						<div v-if="project.members.length > 3"
							class="w-7 h-7 rounded-full bg-heading/10 flex items-center justify-center text-[10px] font-bold border-2 border-panel text-text/50">
							+{{ project.members.length - 3 }}
						</div>
					</div>
					<!-- Due date -->
					<div class="flex items-center gap-1.5 text-xs text-text/40">
						<v-icon name="bi-calendar3" scale="0.8" />
						{{ formatDate(project.endDate) }}
					</div>
				</div>
			</div>
		</div>

		<!-- ── LIST VIEW ──────────────────────────────── -->
		<div v-else class="bg-panel rounded-2xl border border-heading/5 overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b border-heading/5">
							<th class="text-left px-5 py-3.5 text-xs font-bold text-text/40 uppercase tracking-wider">
								Project</th>
							<th class="text-left px-4 py-3.5 text-xs font-bold text-text/40 uppercase tracking-wider">
								Status</th>
							<th class="text-left px-4 py-3.5 text-xs font-bold text-text/40 uppercase tracking-wider">
								Priority</th>
							<th class="text-left px-4 py-3.5 text-xs font-bold text-text/40 uppercase tracking-wider">
								Progress</th>
							<th class="text-left px-4 py-3.5 text-xs font-bold text-text/40 uppercase tracking-wider">
								Tasks</th>
							<th class="text-left px-4 py-3.5 text-xs font-bold text-text/40 uppercase tracking-wider">
								Team</th>
							<th class="text-left px-4 py-3.5 text-xs font-bold text-text/40 uppercase tracking-wider">
								Due</th>
							<th class="px-4 py-3.5"></th>
						</tr>
					</thead>
					<tbody class="divide-y divide-heading/5">
						<tr v-for="project in filteredProjects" :key="project.id"
							class="hover:bg-heading/[0.02] transition-colors group cursor-pointer"
							@click="router.push({ name: 'project-detail', params: { id: project.id } })">
							<td class="px-5 py-4">
								<div class="flex items-center gap-3">
									<div
										class="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
										<v-icon name="md-folderspecial-outlined" class="text-accent" scale="0.9" />
									</div>
									<div>
										<p
											class="text-sm font-bold text-heading group-hover:text-accent transition-colors">
											{{ project.name }}</p>
										<p class="text-xs text-text/40 max-w-48 truncate">{{ project.description }}</p>
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
							<td class="px-4 py-4 min-w-32">
								<div class="flex items-center gap-2">
									<div class="flex-1 h-1.5 bg-heading/10 rounded-full overflow-hidden">
										<div :class="['h-full rounded-full', progressColor(project.progress)]"
											:style="{ width: project.progress + '%' }"></div>
									</div>
									<span class="text-xs font-bold text-heading w-8 shrink-0">{{ project.progress
									}}%</span>
								</div>
							</td>
							<td class="px-4 py-4 text-xs text-text/50">
								{{ project.taskCounts.done }}/{{ project.taskCounts.total }}
							</td>
							<td class="px-4 py-4">
								<div class="flex -space-x-1.5">
									<div v-for="(m, i) in project.members.slice(0, 3)" :key="i"
										:class="[m.color, 'w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold border-2 border-panel']">
										{{ m.initials }}
									</div>
								</div>
							</td>
							<td class="px-4 py-4 text-xs text-text/40 whitespace-nowrap">
								{{ formatDate(project.endDate) }}
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

		<!-- ── Create Modal (basic) ───────────────────── -->
		<Transition name="modal">
			<div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4"
				@click.self="showCreateModal = false">
				<div class="absolute inset-0 bg-heading/40 backdrop-blur-sm"></div>
				<div class="relative bg-panel rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
					<h2 class="text-xl font-bold text-heading mb-1">New Project</h2>
					<p class="text-sm text-text/40 mb-5">Create a new project workspace.</p>

					<div class="space-y-4">
						<div>
							<label class="block text-xs font-bold text-text/50 uppercase tracking-wider mb-1.5">Project
								Name</label>
							<input type="text" placeholder="e.g. Marketing Website"
								class="input-field rounded-xl border-heading/15 focus:border-accent" />
						</div>
						<div>
							<label
								class="block text-xs font-bold text-text/50 uppercase tracking-wider mb-1.5">Description</label>
							<textarea rows="3" placeholder="Brief description…"
								class="input-field rounded-xl border-heading/15 focus:border-accent resize-none"></textarea>
						</div>
						<div class="grid grid-cols-2 gap-3">
							<div>
								<label
									class="block text-xs font-bold text-text/50 uppercase tracking-wider mb-1.5">Priority</label>
								<select class="input-field rounded-xl border-heading/15">
									<option>High</option>
									<option>Medium</option>
									<option>Low</option>
									<option>Urgent</option>
								</select>
							</div>
							<div>
								<label
									class="block text-xs font-bold text-text/50 uppercase tracking-wider mb-1.5">Status</label>
								<select class="input-field rounded-xl border-heading/15">
									<option>Planning</option>
									<option>In Progress</option>
									<option>On Hold</option>
								</select>
							</div>
						</div>
						<div class="grid grid-cols-2 gap-3">
							<div>
								<label
									class="block text-xs font-bold text-text/50 uppercase tracking-wider mb-1.5">Start
									Date</label>
								<input type="date" class="input-field rounded-xl border-heading/15" />
							</div>
							<div>
								<label class="block text-xs font-bold text-text/50 uppercase tracking-wider mb-1.5">End
									Date</label>
								<input type="date" class="input-field rounded-xl border-heading/15" />
							</div>
						</div>
					</div>

					<div class="flex items-center gap-3 mt-6">
						<button @click="showCreateModal = false"
							class="flex-1 py-2.5 rounded-xl border border-heading/15 text-sm font-semibold text-text/50 hover:bg-heading/5 transition-colors">
							Cancel
						</button>
						<button
							class="flex-1 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 active:scale-95 transition-all shadow-md shadow-accent/20">
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
	transform: scale(0.95);
}

.line-clamp-2 {
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
</style>