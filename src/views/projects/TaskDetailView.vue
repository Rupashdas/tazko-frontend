<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { addIcons } from 'oh-vue-icons'
import {
	BiPencil, BiTrash, BiArchive,
	BiCheckCircle, BiClock, BiCalendar3,
	BiPlusCircle, BiSend,
	BiXCircle, BiChat, BiActivity,
} from 'oh-vue-icons/icons'

addIcons(
	BiPencil, BiTrash, BiArchive,
	BiCheckCircle, BiClock, BiCalendar3,
	BiPlusCircle, BiSend,
	BiXCircle, BiChat, BiActivity,
)

const router = useRouter()
const route = useRoute()

const task = ref({
	id: route.params.taskId,
	title: 'Dashboard UI & analytics widgets',
	description: 'Build the main dashboard with task summary cards, project progress bars, recent activity feed, and quick action shortcuts. The layout should be responsive and load data progressively. Pay attention to empty states — each widget needs a graceful fallback.',
	status: 'In Progress',
	priority: 'High',
	assignee: { initials: 'SK', name: 'Sara Khan', color: 'bg-violet-500', role: 'Frontend Developer' },
	due: '2026-03-10',
	project: { id: route.params.id, name: 'Tazko App' },
	createdAt: '2026-02-20',
	labels: [
		{ id: 1, name: 'Frontend', color: 'bg-accent/15 text-accent border-accent/20' },
		{ id: 2, name: 'UI', color: 'bg-violet-500/15 text-violet-600 border-violet-200' },
	],
})

// ── Subtasks ──────────────────────────────────────────
const subtasks = ref([
	{ id: 1, title: 'Design widget layout in Figma', done: true },
	{ id: 2, title: 'Build stat card components', done: true },
	{ id: 3, title: 'Integrate project progress bars', done: false },
	{ id: 4, title: 'Build recent activity feed', done: false },
	{ id: 5, title: 'Add empty states for each widget', done: false },
])
const newSubtask = ref('')
const showSubtaskInput = ref(false)

const subtaskProgress = computed(() => {
	if (!subtasks.value.length) return 0
	return Math.round((subtasks.value.filter(s => s.done).length / subtasks.value.length) * 100)
})

// ✅ FIX 1: method to remove subtask (not inline ref reassignment in template)
const removeSubtask = (id) => {
	subtasks.value = subtasks.value.filter(s => s.id !== id)
}
const addSubtaskItem = () => {
	if (!newSubtask.value.trim()) return
	subtasks.value.push({ id: Date.now(), title: newSubtask.value.trim(), done: false })
	newSubtask.value = ''
	showSubtaskInput.value = false
}

// ── Comments ──────────────────────────────────────────
const comments = ref([
	{
		id: 1, author: 'Arif Hossain', initials: 'AH', color: 'bg-accent',
		text: "Sara, the empty states are critical — make sure each widget has a proper illustration or message when there's no data yet.",
		time: 'Feb 21, 2:30 PM'
	},
	{
		id: 2, author: 'Sara Khan', initials: 'SK', color: 'bg-violet-500',
		text: "Understood! I'll use the same icon style we have in the project overview page. Will also add a subtle shimmer loader while data is fetching.",
		time: 'Feb 22, 10:15 AM'
	},
	{
		id: 3, author: 'Noman Rahman', initials: 'NR', color: 'bg-emerald-500',
		text: 'API endpoints for the stats cards are ready. Check /api/dashboard/summary — it returns project count, task counts, and recent activity.',
		time: 'Feb 24, 4:00 PM'
	},
])
const newComment = ref('')

const sendComment = () => {
	if (!newComment.value.trim()) return
	comments.value.push({ id: Date.now(), author: 'You', initials: 'YO', color: 'bg-accent', text: newComment.value.trim(), time: 'Just now' })
	newComment.value = ''
}

// ── Activity ──────────────────────────────────────────
const activity = [
	{ text: 'Sara Khan changed status to In Progress', time: '4h ago', initials: 'SK', color: 'bg-violet-500' },
	{ text: 'Arif Hossain changed priority to High', time: '2 days ago', initials: 'AH', color: 'bg-accent' },
	{ text: 'Sara Khan was assigned to this task', time: '3 days ago', initials: 'AH', color: 'bg-accent' },
	{ text: 'Task was created by Arif Hossain', time: 'Feb 20', initials: 'AH', color: 'bg-accent' },
]

// ── Config ────────────────────────────────────────────
const priorityConfig = {
	Urgent: { cls: 'text-red-500 bg-red-500/10 border-red-200', dot: 'bg-red-500' },
	High: { cls: 'text-amber-600 bg-amber-500/10 border-amber-200', dot: 'bg-amber-500' },
	Medium: { cls: 'text-blue-500 bg-blue-500/10 border-blue-200', dot: 'bg-blue-500' },
	Low: { cls: 'text-slate-500 bg-slate-100 border-slate-200', dot: 'bg-slate-400' },
}
const statusConfig = {
	'Todo': { cls: 'text-slate-500 bg-slate-100 border-slate-200', dot: 'bg-slate-400', ring: 'border-slate-300' },
	'In Progress': { cls: 'text-accent bg-accent/10 border-accent/20', dot: 'bg-accent', ring: 'border-accent/50' },
	'Review': { cls: 'text-violet-600 bg-violet-500/10 border-violet-200', dot: 'bg-violet-500', ring: 'border-violet-400' },
	'Done': { cls: 'text-emerald-600 bg-emerald-500/10 border-emerald-200', dot: 'bg-emerald-500', ring: 'border-emerald-400' },
}

const daysLeft = computed(() => {
	const diff = Math.ceil((new Date(task.value.due) - new Date()) / 86400000)
	if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, cls: 'text-red-500' }
	if (diff === 0) return { label: 'Due today', cls: 'text-red-500' }
	if (diff <= 3) return { label: `${diff}d left`, cls: 'text-amber-500' }
	return { label: `${diff}d left`, cls: 'text-text/50' }
})

const formatDate = (d) =>
	new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

// ── Title editing ─────────────────────────────────────
const editingTitle = ref(false)
const titleDraft = ref('')
const startEditTitle = () => { editingTitle.value = true; titleDraft.value = task.value.title }
const saveTitle = () => {
	if (titleDraft.value.trim()) task.value.title = titleDraft.value.trim()
	editingTitle.value = false
}

const activeSection = ref('comments')
</script>

<template>
	<div class="pb-24 pt-8 px-1 max-w-5xl">

		<!-- Breadcrumb -->
		<div class="flex items-center gap-2 text-xs text-text/40 mb-6 flex-wrap">
			<button @click="router.push({ name: 'projects' })"
				class="hover:text-accent transition-colors">Projects</button>
			<span>/</span>
			<button @click="router.push({ name: 'project-detail', params: { id: task.project.id } })"
				class="hover:text-accent transition-colors">{{ task.project.name }}</button>
			<span>/</span>
			<button @click="router.push({ name: 'project-tasks', params: { id: task.project.id } })"
				class="hover:text-accent transition-colors">Tasks</button>
			<span>/</span>
			<span class="text-text/60 font-medium truncate max-w-xs">{{ task.title }}</span>
		</div>

		<!-- TOP: Details -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">

			<!-- LEFT -->
			<div class="lg:col-span-2 space-y-5">

				<!-- Title card -->
				<div class="bg-panel rounded-2xl border border-heading/5 overflow-hidden">
					<div class="h-1 bg-gradient-to-r from-accent to-violet-500"></div>
					<div class="p-6">
						<div class="flex items-center gap-2 mb-4 flex-wrap">
							<span
								:class="[statusConfig[task.status].cls, 'inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-bold border']">
								<span
									:class="[statusConfig[task.status].dot, 'w-1.5 h-1.5 rounded-full animate-pulse']"></span>
								{{ task.status }}
							</span>
							<span
								:class="[priorityConfig[task.priority].cls, 'text-xs px-2.5 py-1 rounded-full font-bold border']">
								{{ task.priority }} Priority
							</span>
							<span v-for="label in task.labels" :key="label.id"
								:class="[label.color, 'text-xs px-2.5 py-1 rounded-full font-bold border']">
								{{ label.name }}
							</span>
						</div>

						<div v-if="!editingTitle" class="group">
							<h1 class="text-heading font-bold text-xl leading-snug cursor-pointer hover:text-accent transition-colors"
								@click="startEditTitle">{{ task.title }}</h1>
							<button @click="startEditTitle"
								class="mt-1 inline-flex items-center gap-1 text-[10px] text-text/30 hover:text-accent transition-colors opacity-0 group-hover:opacity-100">
								<v-icon name="bi-pencil" scale="0.7" /> Edit title
							</button>
						</div>
						<div v-else>
							<input v-model="titleDraft" type="text"
								class="w-full text-xl font-bold text-heading bg-heading/5 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent/30 border border-heading/10"
								@keyup.enter="saveTitle" @keyup.escape="editingTitle = false" @blur="saveTitle"
								autofocus />
						</div>

						<div class="mt-4">
							<p class="text-[10px] font-bold text-text/30 uppercase tracking-wider mb-2">Description</p>
							<div class="bg-heading/[0.025] rounded-xl p-4 hover:bg-heading/5 transition-colors">
								<p class="text-sm text-text/65 leading-relaxed" v-if="task.description">{{
									task.description }}</p>
								<p class="text-sm text-text/25 italic" v-else>Click to add a description…</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Subtasks -->
				<div class="bg-panel rounded-2xl border border-heading/5 p-5">
					<div class="flex items-center justify-between mb-3">
						<div class="flex items-center gap-2.5">
							<h3 class="text-sm font-bold text-heading">Subtasks</h3>
							<span class="text-xs text-text/35 bg-heading/5 px-2 py-0.5 rounded-full">
								{{subtasks.filter(s => s.done).length}}/{{ subtasks.length }}
							</span>
						</div>
						<button @click="showSubtaskInput = !showSubtaskInput"
							class="inline-flex items-center gap-1 text-xs font-bold text-accent hover:text-accent/70 px-2.5 py-1 rounded-lg hover:bg-accent/8 transition-colors">
							<v-icon name="bi-plus-circle" scale="0.8" /> Add
						</button>
					</div>

					<div class="h-1.5 bg-heading/8 rounded-full mb-4 overflow-hidden">
						<div class="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
							:style="`width: ${subtaskProgress}%`"></div>
					</div>

					<div class="space-y-1">
						<div v-for="sub in subtasks" :key="sub.id"
							class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-heading/[0.03] transition-colors group">
							<button @click="sub.done = !sub.done" :class="['w-4 h-4 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-all',
								sub.done ? 'bg-emerald-500 border-emerald-500' : 'border-heading/20 hover:border-accent']">
								<svg v-if="sub.done" viewBox="0 0 24 24" fill="none" class="w-2.5 h-2.5">
									<path d="M5 13l4 4L19 7" stroke="white" stroke-width="3" stroke-linecap="round"
										stroke-linejoin="round" />
								</svg>
							</button>
							<span
								:class="['text-sm flex-1', sub.done ? 'text-text/30 line-through' : 'text-heading/80']">
								{{ sub.title }}
							</span>
							<!-- ✅ FIX 1: method call instead of reactive ref reassignment -->
							<button @click="removeSubtask(sub.id)"
								class="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded flex items-center justify-center text-text/20 hover:text-red-400">
								<v-icon name="bi-x-circle" scale="0.7" />
							</button>
						</div>
					</div>

					<div v-if="showSubtaskInput" class="flex items-center gap-2 mt-2 pt-2 border-t border-heading/5">
						<input v-model="newSubtask" type="text" placeholder="New subtask…"
							class="flex-1 text-sm px-3 py-2 rounded-xl border border-heading/10 bg-body focus:border-accent focus:outline-none"
							@keyup.enter="addSubtaskItem" @keyup.escape="showSubtaskInput = false" autofocus />
						<button @click="addSubtaskItem"
							class="px-3 py-2 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent/90 transition-colors active:scale-95">
							Add
						</button>
					</div>
				</div>
			</div>

			<!-- RIGHT: Meta -->
			<div class="space-y-4">
				<div class="bg-panel rounded-2xl border border-heading/5 p-4 space-y-2">
					<button
						class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-heading hover:bg-heading/5 transition-colors group">
						<div
							class="w-7 h-7 rounded-lg bg-heading/5 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
							<v-icon name="bi-pencil" scale="0.8" />
						</div>
						Edit Task
					</button>
					<button
						class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-heading hover:bg-heading/5 transition-colors group">
						<div
							class="w-7 h-7 rounded-lg bg-heading/5 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all">
							<v-icon name="bi-archive" scale="0.8" />
						</div>
						Archive
					</button>
					<button
						class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors group">
						<div class="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
							<v-icon name="bi-trash" scale="0.8" />
						</div>
						Delete Task
					</button>
				</div>

				<div class="bg-panel rounded-2xl border border-heading/5 p-4 space-y-4">
					<h3 class="text-xs font-bold text-text/35 uppercase tracking-wider">Details</h3>

					<div>
						<p class="text-[10px] font-bold text-text/30 uppercase tracking-wider mb-1.5">Assignee</p>
						<div class="flex items-center gap-2.5">
							<div
								:class="[task.assignee.color, 'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0']">
								{{ task.assignee.initials }}
							</div>
							<div>
								<p class="text-sm font-semibold text-heading leading-tight">{{ task.assignee.name }}</p>
								<p class="text-[10px] text-text/35">{{ task.assignee.role }}</p>
							</div>
						</div>
					</div>

					<div>
						<p class="text-[10px] font-bold text-text/30 uppercase tracking-wider mb-1.5">Status</p>
						<div class="flex flex-wrap gap-1">
							<button v-for="st in ['Todo', 'In Progress', 'Review', 'Done']" :key="st"
								@click="task.status = st"
								:class="['text-[10px] px-2 py-1 rounded-lg font-bold border transition-all',
									task.status === st ? statusConfig[st].cls : 'bg-heading/5 text-text/35 border-transparent hover:border-heading/15']">
								{{ st }}
							</button>
						</div>
					</div>

					<div>
						<p class="text-[10px] font-bold text-text/30 uppercase tracking-wider mb-1.5">Priority</p>
						<div class="flex flex-wrap gap-1">
							<button v-for="pr in ['Low', 'Medium', 'High', 'Urgent']" :key="pr"
								@click="task.priority = pr"
								:class="['text-[10px] px-2 py-1 rounded-lg font-bold border transition-all',
									task.priority === pr ? priorityConfig[pr].cls : 'bg-heading/5 text-text/35 border-transparent hover:border-heading/15']">
								{{ pr }}
							</button>
						</div>
					</div>

					<div>
						<p class="text-[10px] font-bold text-text/30 uppercase tracking-wider mb-1.5">Due Date</p>
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-1.5 text-sm">
								<v-icon name="bi-calendar3" class="text-text/35" scale="0.85" />
								<span class="font-semibold text-heading">{{ formatDate(task.due) }}</span>
							</div>
							<span :class="[daysLeft.cls, 'text-xs font-bold']">{{ daysLeft.label }}</span>
						</div>
					</div>

					<div>
						<p class="text-[10px] font-bold text-text/30 uppercase tracking-wider mb-1.5">Labels</p>
						<div class="flex flex-wrap gap-1.5">
							<span v-for="label in task.labels" :key="label.id"
								:class="[label.color, 'text-xs px-2 py-0.5 rounded-full font-bold border flex items-center gap-1']">
								{{ label.name }}
								<button @click="task.labels = task.labels.filter(l => l.id !== label.id)"
									class="hover:opacity-50">×</button>
							</span>
							<button
								class="text-xs px-2 py-0.5 rounded-full border border-dashed border-heading/20 text-text/30 hover:border-accent hover:text-accent transition-colors">
								+ Add
							</button>
						</div>
					</div>

					<div class="pt-2 border-t border-heading/5">
						<p class="text-[10px] text-text/25">Created {{ formatDate(task.createdAt) }}</p>
					</div>
				</div>
			</div>
		</div>

		<!-- BOTTOM: Comments & Activity -->
		<div class="bg-panel rounded-2xl border border-heading/5 overflow-hidden">
			<div class="flex items-center gap-0.5 px-5 py-3 border-b border-heading/5 bg-heading/[0.01]">
				<button @click="activeSection = 'comments'" :class="['inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
					activeSection === 'comments' ? 'bg-accent text-white shadow-sm' : 'text-text/45 hover:bg-heading/5']">
					<v-icon name="bi-chat" scale="0.85" />
					Comments <span class="text-[10px] opacity-70">({{ comments.length }})</span>
				</button>
				<button @click="activeSection = 'activity'" :class="['inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
					activeSection === 'activity' ? 'bg-accent text-white shadow-sm' : 'text-text/45 hover:bg-heading/5']">
					<v-icon name="bi-activity" scale="0.85" />
					Activity
				</button>
			</div>

			<div v-if="activeSection === 'comments'" class="p-6 space-y-6">
				<div v-for="c in comments" :key="c.id" class="flex items-start gap-3">
					<div
						:class="[c.color, 'w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0']">
						{{ c.initials }}
					</div>
					<div class="flex-1 min-w-0">
						<div class="flex items-center gap-2 mb-1.5">
							<span class="text-sm font-bold text-heading">{{ c.author }}</span>
							<span class="text-xs text-text/30">{{ c.time }}</span>
						</div>
						<div class="bg-body rounded-xl rounded-tl-none px-4 py-3 border border-heading/5">
							<p class="text-sm text-text/70 leading-relaxed">{{ c.text }}</p>
						</div>
					</div>
				</div>

				<div class="flex items-start gap-3 pt-2 border-t border-heading/5">
					<div
						class="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
						YO</div>
					<div class="flex-1">
						<textarea v-model="newComment" rows="3" placeholder="Write a comment…"
							class="w-full text-sm text-heading bg-body rounded-xl border border-heading/10 px-4 py-3 focus:outline-none focus:border-accent/50 resize-none placeholder-text/30 transition-colors"
							@keydown.ctrl.enter="sendComment"></textarea>
						<div class="flex items-center justify-between mt-2">
							<p class="text-[10px] text-text/25">Ctrl + Enter to send</p>
							<button @click="sendComment" :disabled="!newComment.trim()"
								class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent/90 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm shadow-accent/20">
								<v-icon name="bi-send" scale="0.8" /> Send
							</button>
						</div>
					</div>
				</div>
			</div>

			<div v-else class="p-6 space-y-4">
				<div v-for="(item, i) in activity" :key="i" class="flex items-start gap-3">
					<div
						:class="[item.color, 'w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 mt-0.5']">
						{{ item.initials }}
					</div>
					<div>
						<p class="text-sm text-text/65">{{ item.text }}</p>
						<p class="text-[10px] text-text/30 mt-0.5">{{ item.time }}</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>