<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { addIcons } from 'oh-vue-icons'
import {
	BiArrowLeft, BiPencil, BiTrash, BiArchive,
	BiCheckCircle, BiClock, BiCalendar3, BiFlag,
	BiPlusCircle, BiSend, BiTag, BiPeople,
	BiThreeDotsVertical, BiXCircle, BiChat,
	BiActivity, BiLightningCharge, BiCheck2,
	BiChevronRight, BiCircle, BiArrowRepeat,
	BiExclamationCircle, BiCheck2Circle,
	BiPerson, BiBookmark, BiSquare, BiLink45Deg,
	BiEmojiSmile, BiPaperclip,
} from 'oh-vue-icons/icons'

addIcons(
	BiArrowLeft, BiPencil, BiTrash, BiArchive,
	BiCheckCircle, BiClock, BiCalendar3, BiFlag,
	BiPlusCircle, BiSend, BiTag, BiPeople,
	BiThreeDotsVertical, BiXCircle, BiChat,
	BiActivity, BiLightningCharge, BiCheck2,
	BiChevronRight, BiCircle, BiArrowRepeat,
	BiExclamationCircle, BiCheck2Circle,
	BiPerson, BiBookmark, BiSquare, BiLink45Deg,
	BiEmojiSmile, BiPaperclip,
)

const router = useRouter()
const route = useRoute()

// ── Task data ─────────────────────────────────────────
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

const members = [
	{ initials: 'AH', name: 'Arif Hossain', color: 'bg-accent', role: 'Project Manager' },
	{ initials: 'SK', name: 'Sara Khan', color: 'bg-violet-500', role: 'Frontend Dev' },
	{ initials: 'NR', name: 'Noman Rahman', color: 'bg-emerald-500', role: 'Backend Dev' },
	{ initials: 'DM', name: 'Dina Malik', color: 'bg-amber-500', role: 'Designer' },
	{ initials: 'KU', name: 'Karim Uddin', color: 'bg-red-400', role: 'QA Engineer' },
]

// ── Config maps ───────────────────────────────────────
const statusOptions = ['Todo', 'In Progress', 'Review', 'Done']
const priorityOptions = ['Low', 'Medium', 'High', 'Urgent']

const statusConfig = {
	'Todo': { cls: 'bg-slate-100 text-slate-600 dark:bg-slate-700/40 dark:text-slate-300 border-slate-200/60 dark:border-slate-600/40', dot: 'bg-slate-400', icon: 'bi-circle' },
	'In Progress': { cls: 'bg-accent/10 text-accent border-accent/20', dot: 'bg-accent animate-pulse', icon: 'bi-arrow-repeat' },
	'Review': { cls: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200/60 dark:border-violet-500/30', dot: 'bg-violet-500', icon: 'bi-exclamation-circle' },
	'Done': { cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/30', dot: 'bg-emerald-500', icon: 'bi-check2-circle' },
}

const priorityConfig = {
	'Low': { cls: 'bg-slate-100 text-slate-500 dark:bg-slate-700/30 dark:text-slate-400 border-slate-200/60', bar: 'bg-slate-400' },
	'Medium': { cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/50', bar: 'bg-amber-500' },
	'High': { cls: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200/50', bar: 'bg-orange-500' },
	'Urgent': { cls: 'bg-red-500/10 text-red-500 border-red-200/50 dark:border-red-500/30', bar: 'bg-red-500' },
}

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
const addSubtaskItem = () => {
	if (!newSubtask.value.trim()) return
	subtasks.value.push({ id: Date.now(), title: newSubtask.value.trim(), done: false })
	newSubtask.value = ''
	showSubtaskInput.value = false
}

// ── Comments ──────────────────────────────────────────
const activeSection = ref('comments')
const newComment = ref('')
const comments = ref([
	{
		id: 1, author: 'Arif Hossain', initials: 'AH', color: 'bg-accent',
		text: 'Sara, the empty states are critical — make sure each widget has a proper illustration or message when there\'s no data yet.',
		time: 'Feb 21, 2:30 PM', likes: 2,
	},
	{
		id: 2, author: 'Sara Khan', initials: 'SK', color: 'bg-violet-500',
		text: 'Understood! I\'ll handle empty states with subtle SVG illustrations + a CTA to add data. Starting with the task summary card.',
		time: 'Feb 21, 3:15 PM', likes: 1,
	},
	{
		id: 3, author: 'Noman Rahman', initials: 'NR', color: 'bg-emerald-500',
		text: 'I\'ll expose a /dashboard/stats endpoint by EOD so you can wire up the real data.',
		time: 'Feb 22, 10:00 AM', likes: 3,
	},
])

const sendComment = () => {
	if (!newComment.value.trim()) return
	comments.value.push({
		id: Date.now(), author: 'You', initials: 'YO', color: 'bg-accent',
		text: newComment.value.trim(), time: 'Just now', likes: 0,
	})
	newComment.value = ''
}

// ── Activity ──────────────────────────────────────────
const activity = [
	{ initials: 'SK', color: 'bg-violet-500', text: 'Changed status from Todo → In Progress', time: 'Feb 22, 9:00 AM', type: 'status' },
	{ initials: 'AH', color: 'bg-accent', text: 'Assigned task to Sara Khan', time: 'Feb 21, 1:00 PM', type: 'assign' },
	{ initials: 'AH', color: 'bg-accent', text: 'Set priority to High', time: 'Feb 21, 12:50 PM', type: 'priority' },
	{ initials: 'AH', color: 'bg-accent', text: 'Created this task', time: 'Feb 20, 10:00 AM', type: 'create' },
]

// ── Inline title edit ──────────────────────────────────
const editingTitle = ref(false)
const titleDraft = ref('')
const startEditTitle = () => { editingTitle.value = true; titleDraft.value = task.value.title }
const saveTitle = () => { if (titleDraft.value.trim()) task.value.title = titleDraft.value.trim(); editingTitle.value = false }

// ── Inline description edit ───────────────────────────
const editingDesc = ref(false)
const descDraft = ref('')
const startEditDesc = () => { editingDesc.value = true; descDraft.value = task.value.description }
const saveDesc = () => { task.value.description = descDraft.value.trim(); editingDesc.value = false }

// ── Utils ──────────────────────────────────────────────
const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const daysLeft = computed(() => {
	const diff = Math.ceil((new Date(task.value.due) - new Date()) / (1000 * 60 * 60 * 24))
	if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, cls: 'text-red-500 font-bold' }
	if (diff === 0) return { label: 'Due today', cls: 'text-amber-500 font-bold' }
	if (diff <= 3) return { label: `${diff}d left`, cls: 'text-amber-500 font-semibold' }
	return { label: `${diff} days left`, cls: 'text-text/40' }
})

const activityTypeIcon = { status: '🔄', assign: '👤', priority: '🚩', create: '✨' }
</script>

<template>
	<div class="pb-24 pt-6 px-1">

		<!-- ── Breadcrumb ─────────────────────────────── -->
		<div class="flex items-center gap-1.5 text-xs text-text/35 mb-5 flex-wrap">
			<button @click="router.push({ name: 'projects' })" class="hover:text-accent transition-colors font-medium">
				Projects
			</button>
			<v-icon name="bi-chevron-right" scale="0.7" class="text-text/20" />
			<button @click="router.push({ name: 'project-detail', params: { id: task.project.id } })"
				class="hover:text-accent transition-colors font-medium">
				{{ task.project.name }}
			</button>
			<v-icon name="bi-chevron-right" scale="0.7" class="text-text/20" />
			<span class="text-text/55 font-semibold truncate max-w-xs">{{ task.title }}</span>
		</div>

		<!-- ════════════════════════════════════════════ -->
		<!-- MAIN TWO-COLUMN LAYOUT                      -->
		<!-- ════════════════════════════════════════════ -->
		<div class="flex gap-6 items-start">

			<!-- ══════════════════════════════════════ -->
			<!-- LEFT: Main content                    -->
			<!-- ══════════════════════════════════════ -->
			<div class="flex-1 min-w-0 space-y-4">

				<!-- Task title card -->
				<div class="bg-panel rounded-2xl border border-heading/5 p-6">

					<!-- Status + priority pill row -->
					<div class="flex items-center gap-2 mb-4 flex-wrap">
						<span
							:class="[statusConfig[task.status]?.cls, 'inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-bold border']">
							<span :class="[statusConfig[task.status]?.dot, 'w-1.5 h-1.5 rounded-full']" />
							{{ task.status }}
						</span>
						<span
							:class="[priorityConfig[task.priority]?.cls, 'text-xs px-2.5 py-1 rounded-full font-bold border']">
							{{ task.priority }} Priority
						</span>
						<div class="flex-1" />
						<!-- Action buttons -->
						<button
							class="p-1.5 rounded-lg text-text/50 hover:text-heading hover:bg-heading/5 transition-colors">
							<v-icon name="bi-pencil" scale="0.85" />
						</button>
						<button
							class="p-1.5 rounded-lg text-text/50 hover:text-amber-500 hover:bg-amber-500/8 transition-colors">
							<v-icon name="bi-archive" scale="0.85" />
						</button>
						<button
							class="p-1.5 rounded-lg text-text/50 hover:text-red-500 hover:bg-red-500/8 transition-colors">
							<v-icon name="bi-trash" scale="0.85" />
						</button>
					</div>

					<!-- Editable title -->
					<div class="mb-5">
						<div v-if="!editingTitle" class="group flex items-start gap-2 cursor-pointer"
							@click="startEditTitle">
							<h1 class="text-xl font-bold text-heading leading-snug flex-1">{{ task.title }}</h1>
							<v-icon name="bi-pencil" scale="0.8"
								class="text-text/50 group-hover:text-accent mt-1 shrink-0 transition-colors" />
						</div>
						<div v-else class="flex items-start gap-2">
							<input v-model="titleDraft"
								class="flex-1 text-xl font-bold text-heading bg-transparent border-0 border-b-2 border-accent/50 focus:outline-none focus:border-accent pb-0.5 leading-snug"
								@keydown.enter="saveTitle" @keydown.esc="editingTitle = false" autofocus />
							<button @click="saveTitle"
								class="mt-1 px-2.5 py-1 rounded-lg bg-accent text-white text-xs font-bold hover:bg-accent/90 transition-colors">
								Save
							</button>
						</div>
					</div>

					<!-- Editable description -->
					<div>
						<p class="text-[10px] font-bold text-text/30 uppercase tracking-widest mb-2">Description</p>
						<div v-if="!editingDesc" @click="startEditDesc"
							class="group cursor-pointer rounded-xl bg-heading/[0.025] hover:bg-heading/[0.045] border border-transparent hover:border-heading/8 px-4 py-3 transition-all">
							<p v-if="task.description" class="text-sm text-text/60 leading-relaxed">
								{{ task.description }}
							</p>
							<p v-else class="text-sm text-text/25 italic">
								Click to add a description…
							</p>
						</div>
						<div v-else class="space-y-2">
							<textarea v-model="descDraft" rows="5"
								class="w-full text-sm text-heading bg-heading/[0.03] border border-accent/30 rounded-xl px-4 py-3 focus:outline-none focus:border-accent/60 resize-none transition-colors leading-relaxed"
								autofocus />
							<div class="flex items-center gap-2">
								<button @click="saveDesc"
									class="px-3.5 py-1.5 rounded-lg bg-accent text-white text-xs font-bold hover:bg-accent/90 transition-colors">
									Save
								</button>
								<button @click="editingDesc = false"
									class="px-3 py-1.5 rounded-lg border border-heading/10 text-text/80 text-xs hover:text-heading transition-colors">
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>

				<!-- Subtasks card -->
				<div class="bg-panel rounded-2xl border border-heading/5 p-5">
					<div class="flex items-center justify-between mb-4">
						<div class="flex items-center gap-3">
							<h3 class="text-sm font-bold text-heading">Subtasks</h3>
							<div class="flex items-center gap-1.5">
								<span class="text-xs font-semibold text-text/40">
									{{subtasks.filter(s => s.done).length}} / {{ subtasks.length }}
								</span>
								<span class="text-xs font-bold tabular-nums"
									:class="subtaskProgress === 100 ? 'text-emerald-500' : 'text-accent'">
									{{ subtaskProgress }}%
								</span>
							</div>
						</div>
						<button @click="showSubtaskInput = !showSubtaskInput"
							class="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent/70 px-2.5 py-1.5 rounded-lg hover:bg-accent/8 transition-colors">
							<v-icon name="bi-plus-circle" scale="0.8" />
							Add
						</button>
					</div>

					<!-- Progress bar -->
					<div class="h-1.5 bg-heading/8 rounded-full mb-4 overflow-hidden">
						<div class="h-full rounded-full transition-all duration-500"
							:class="subtaskProgress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-accent to-violet-500'"
							:style="`width: ${subtaskProgress}%`" />
					</div>

					<!-- Rows -->
					<div class="space-y-0.5">
						<div v-for="sub in subtasks" :key="sub.id"
							class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-heading/[0.03] transition-colors group">
							<button @click="sub.done = !sub.done" :class="['w-4.5 h-4.5 w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center shrink-0 transition-all',
								sub.done ? 'bg-emerald-500 border-emerald-500' : 'border-heading/20 hover:border-accent']">
								<svg v-if="sub.done" viewBox="0 0 24 24" fill="none" class="w-2.5 h-2.5">
									<path d="M5 13l4 4L19 7" stroke="white" stroke-width="3.5" stroke-linecap="round"
										stroke-linejoin="round" />
								</svg>
							</button>
							<span class="text-sm flex-1 transition-colors"
								:class="sub.done ? 'text-text/30 line-through' : 'text-heading/80'">
								{{ sub.title }}
							</span>
							<button
								class="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded flex items-center justify-center text-text/25 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
								@click="subtasks = subtasks.filter(s => s.id !== sub.id)">
								<v-icon name="bi-x-circle" scale="0.75" />
							</button>
						</div>
					</div>

					<!-- Add subtask input -->
					<div v-if="showSubtaskInput" class="flex items-center gap-2 mt-3 pt-3 border-t border-heading/5">
						<input v-model="newSubtask" type="text" placeholder="New subtask…"
							class="flex-1 text-sm px-3.5 py-2 rounded-xl border border-accent/30 bg-accent/5 focus:border-accent/60 focus:outline-none transition-colors placeholder-text/30"
							@keydown.enter="addSubtaskItem" @keydown.esc="showSubtaskInput = false" autofocus />
						<button @click="addSubtaskItem"
							class="px-3 py-2 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent/90 transition-colors active:scale-95">
							Add
						</button>
						<button @click="showSubtaskInput = false"
							class="px-3 py-2 rounded-xl border border-heading/8 text-text/40 text-xs hover:text-heading transition-colors">
							Cancel
						</button>
					</div>
				</div>

				<!-- Comments & Activity -->
				<div class="bg-panel rounded-2xl border border-heading/5 overflow-hidden">

					<!-- Tab switcher -->
					<div class="flex items-center gap-1 px-5 pt-4 pb-0 border-b border-heading/5">
						<button
							v-for="tab in [{ key: 'comments', label: 'Comments', icon: 'bi-chat', count: comments.length }, { key: 'activity', label: 'Activity', icon: 'bi-activity', count: activity.length }]"
							:key="tab.key" @click="activeSection = tab.key" :class="['inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px',
								activeSection === tab.key
									? 'text-accent border-accent'
									: 'text-text/40 border-transparent hover:text-text/70 hover:border-heading/15']">
							<v-icon :name="tab.icon" scale="0.85" />
							{{ tab.label }}
							<span :class="['text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums',
								activeSection === tab.key ? 'bg-accent/15 text-accent' : 'bg-heading/5 text-text/40']">
								{{ tab.count }}
							</span>
						</button>
					</div>

					<!-- Comments panel -->
					<div v-if="activeSection === 'comments'" class="p-5 space-y-5">
						<!-- Existing comments -->
						<div v-for="c in comments" :key="c.id" class="flex items-start gap-3 group">
							<div
								:class="[c.color, 'w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm']">
								{{ c.initials }}
							</div>
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2 mb-1.5">
									<span class="text-sm font-bold text-heading">{{ c.author }}</span>
									<span class="text-[11px] text-text/30">{{ c.time }}</span>
									<button v-if="c.likes"
										class="ml-auto inline-flex items-center gap-1 text-[11px] text-text/35 hover:text-accent transition-colors opacity-0 group-hover:opacity-100">
										👍 {{ c.likes }}
									</button>
								</div>
								<div
									class="bg-heading/[0.03] rounded-2xl rounded-tl-none px-4 py-3 border border-heading/[0.06]">
									<p class="text-sm text-text/70 leading-relaxed">{{ c.text }}</p>
								</div>
							</div>
						</div>

						<!-- Composer -->
						<div class="flex items-start gap-3 pt-2 border-t border-heading/5">
							<div
								class="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-[11px] font-bold shrink-0">
								YO
							</div>
							<div class="flex-1">
								<textarea v-model="newComment" rows="3" placeholder="Write a comment…"
									class="w-full text-sm text-heading bg-heading/[0.03] rounded-2xl border border-heading/8 px-4 py-3 focus:outline-none focus:border-accent/40 resize-none placeholder-text/30 transition-colors leading-relaxed"
									@keydown.ctrl.enter="sendComment" />
								<div class="flex items-center justify-between mt-2">
									<div class="flex items-center gap-1">
										<button
											class="p-1.5 rounded-lg text-text/25 hover:text-text/80 hover:bg-heading/5 transition-colors">
											<v-icon name="bi-paperclip" scale="0.85" />
										</button>
										<button
											class="p-1.5 rounded-lg text-text/25 hover:text-text/80 hover:bg-heading/5 transition-colors">
											<v-icon name="bi-emoji-smile" scale="0.85" />
										</button>
									</div>
									<div class="flex items-center gap-2">
										<span class="text-[10px] text-text/25">Ctrl+Enter to send</span>
										<button @click="sendComment" :disabled="!newComment.trim()"
											class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent/90 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm shadow-accent/20">
											<v-icon name="bi-send" scale="0.8" />
											Send
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Activity panel -->
					<div v-else class="p-5">
						<div class="relative">
							<!-- Vertical line -->
							<div class="absolute left-3.5 top-4 bottom-4 w-px bg-heading/8" />

							<div class="space-y-5">
								<div v-for="(item, i) in activity" :key="i" class="flex items-start gap-4 relative">
									<!-- Avatar -->
									<div
										:class="[item.color, 'w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 z-10 shadow-sm ring-2 ring-panel']">
										{{ item.initials }}
									</div>
									<div class="flex-1 pt-0.5">
										<p class="text-sm text-text/60">{{ item.text }}</p>
										<p class="text-[10px] text-text/30 mt-0.5">{{ item.time }}</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<!-- /LEFT -->

			<!-- ══════════════════════════════════════ -->
			<!-- RIGHT: Sticky sidebar                 -->
			<!-- ══════════════════════════════════════ -->
			<aside class="w-64 shrink-0 space-y-3 sticky top-24 self-start">

				<!-- Assignee -->
				<div class="bg-panel rounded-2xl border border-heading/5 p-4">
					<p class="text-[10px] font-bold text-text/30 uppercase tracking-widest mb-3">Assignee</p>
					<div class="flex items-center gap-2.5">
						<div
							:class="[task.assignee.color, 'w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm']">
							{{ task.assignee.initials }}
						</div>
						<div class="min-w-0">
							<p class="text-sm font-bold text-heading leading-tight">{{ task.assignee.name }}</p>
							<p class="text-[11px] text-text/40 mt-0.5">{{ task.assignee.role }}</p>
						</div>
						<button class="ml-auto text-text/25 hover:text-accent transition-colors">
							<v-icon name="bi-pencil" scale="0.8" />
						</button>
					</div>
					<!-- Member selector chips -->
					<div class="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-heading/5">
						<button v-for="m in members" :key="m.initials" @click="task.assignee = m" :class="[m.color, 'w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold transition-all shadow-sm',
						task.assignee.initials === m.initials
							? 'ring-2 ring-offset-1 ring-offset-panel ring-heading/30 scale-110'
							: 'opacity-60 hover:opacity-100 hover:scale-105']" :title="m.name">
							{{ m.initials }}
						</button>
					</div>
				</div>

				<!-- Status -->
				<div class="bg-panel rounded-2xl border border-heading/5 p-4">
					<p class="text-[10px] font-bold text-text/30 uppercase tracking-widest mb-3">Status</p>
					<div class="space-y-1.5">
						<button v-for="st in statusOptions" :key="st" @click="task.status = st" :class="['w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border',
							task.status === st
								? statusConfig[st].cls
								: 'text-text/40 border-transparent hover:bg-heading/5 hover:text-text/70']">
							<span
								:class="[statusConfig[st].dot.replace('animate-pulse', ''), 'w-1.5 h-1.5 rounded-full shrink-0']" />
							{{ st }}
							<v-icon v-if="task.status === st" name="bi-check2" scale="0.8" class="ml-auto" />
						</button>
					</div>
				</div>

				<!-- Priority -->
				<div class="bg-panel rounded-2xl border border-heading/5 p-4">
					<p class="text-[10px] font-bold text-text/30 uppercase tracking-widest mb-3">Priority</p>
					<div class="space-y-1.5">
						<button v-for="pr in priorityOptions" :key="pr" @click="task.priority = pr" :class="['w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border',
							task.priority === pr
								? priorityConfig[pr].cls
								: 'text-text/40 border-transparent hover:bg-heading/5 hover:text-text/70']">
							<span :class="[priorityConfig[pr].bar, 'w-1.5 h-1.5 rounded-full shrink-0']" />
							{{ pr }}
							<v-icon v-if="task.priority === pr" name="bi-check2" scale="0.8" class="ml-auto" />
						</button>
					</div>
				</div>

				<!-- Due date -->
				<div class="bg-panel rounded-2xl border border-heading/5 p-4">
					<p class="text-[10px] font-bold text-text/30 uppercase tracking-widest mb-3">Due Date</p>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<v-icon name="bi-calendar3" class="text-text/35" scale="0.9" />
							<span class="text-sm font-semibold text-heading">{{ formatDate(task.due) }}</span>
						</div>
					</div>
					<p :class="[daysLeft.cls, 'text-[11px] mt-2 flex items-center gap-1']">
						<v-icon name="bi-clock" scale="0.8" />
						{{ daysLeft.label }}
					</p>
				</div>

				<!-- Labels -->
				<div class="bg-panel rounded-2xl border border-heading/5 p-4">
					<p class="text-[10px] font-bold text-text/30 uppercase tracking-widest mb-3">Labels</p>
					<div class="flex flex-wrap gap-1.5">
						<span v-for="label in task.labels" :key="label.id"
							:class="[label.color, 'text-xs px-2.5 py-1 rounded-full font-semibold border flex items-center gap-1.5']">
							{{ label.name }}
							<button @click="task.labels = task.labels.filter(l => l.id !== label.id)"
								class="hover:opacity-60 transition-opacity leading-none">×</button>
						</span>
						<button
							class="text-xs px-2.5 py-1 rounded-full border border-dashed border-heading/20 text-text/30 hover:border-accent hover:text-accent transition-colors">
							+ Add label
						</button>
					</div>
				</div>

				<!-- Meta -->
				<div class="px-1">
					<p class="text-[11px] text-text/25 flex items-center gap-1.5">
						<v-icon name="bi-calendar3" scale="0.75" />
						Created {{ formatDate(task.createdAt) }}
					</p>
				</div>

			</aside>
			<!-- /RIGHT -->

		</div>
	</div>
</template>