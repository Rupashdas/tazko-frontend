<script setup>
import { ref, computed } from 'vue'
import { addIcons } from 'oh-vue-icons'
import {
	BiXCircle, BiPencil, BiCheckCircle, BiClock, BiCalendar3,
	BiFlag, BiPeople, BiTag, BiChatDots, BiActivity,
	BiPlusCircle, BiTrash, BiCheck2, BiLink45Deg,
	BiPaperclip, BiSend, BiThreeDotsVertical,
	BiArrowRight, BiChevronDown, BiChevronUp,
} from 'oh-vue-icons/icons'

addIcons(
	BiXCircle, BiPencil, BiCheckCircle, BiClock, BiCalendar3,
	BiFlag, BiPeople, BiTag, BiChatDots, BiActivity,
	BiPlusCircle, BiTrash, BiCheck2, BiLink45Deg,
	BiPaperclip, BiSend, BiThreeDotsVertical,
	BiArrowRight, BiChevronDown, BiChevronUp,
)

const props = defineProps({
	task: { type: Object, default: null },
	members: { type: Array, default: () => [] },
})
const emit = defineEmits(['close', 'update'])

const activeSection = ref('details') // details | comments | activity
const editingTitle = ref(false)
const newTitle = ref('')
const newSubtask = ref('')
const newComment = ref('')
const showAddSubtask = ref(false)

// Local mutable copy of task data
const localTask = computed(() => props.task ? { ...props.task } : null)

const priorityConfig = {
	Urgent: { cls: 'text-red-500 bg-red-500/10', border: 'border-red-200' },
	High: { cls: 'text-amber-600 bg-amber-500/10', border: 'border-amber-200' },
	Medium: { cls: 'text-blue-500 bg-blue-500/10', border: 'border-blue-200' },
	Low: { cls: 'text-slate-500 bg-slate-100', border: 'border-slate-200' },
}
const statusConfig = {
	'Todo': { cls: 'text-slate-500 bg-slate-100', dot: 'bg-slate-400', ring: 'border-slate-300' },
	'In Progress': { cls: 'text-accent bg-accent/10', dot: 'bg-accent', ring: 'border-accent/40' },
	'Review': { cls: 'text-violet-600 bg-violet-500/10', dot: 'bg-violet-500', ring: 'border-violet-300' },
	'Done': { cls: 'text-emerald-600 bg-emerald-500/10', dot: 'bg-emerald-500', ring: 'border-emerald-300' },
}

// Static mock subtasks
const subtasks = ref([
	{ id: 1, title: 'Set up API endpoints', done: true },
	{ id: 2, title: 'Write unit tests', done: false },
	{ id: 3, title: 'Update documentation', done: false },
])
const subtaskProgress = computed(() => {
	if (!subtasks.value.length) return 0
	return Math.round((subtasks.value.filter(s => s.done).length / subtasks.value.length) * 100)
})

// Static mock labels
const labels = ref([
	{ id: 1, name: 'Frontend', color: 'bg-accent/15 text-accent' },
	{ id: 2, name: 'API', color: 'bg-emerald-500/15 text-emerald-600' },
])

// Static mock comments
const comments = ref([
	{
		id: 1,
		author: 'Sara Khan',
		initials: 'SK',
		color: 'bg-violet-500',
		text: 'Checked the API contract — we need to handle pagination in the response.',
		time: '4h ago',
	},
	{
		id: 2,
		author: 'Noman Rahman',
		initials: 'NR',
		color: 'bg-emerald-500',
		text: 'Done, pagination is in. Tested with 200+ records, looking good.',
		time: '2h ago',
	},
])

// Static activity
const activity = [
	{ text: 'Sara Khan changed status to In Progress', time: '4h ago', initials: 'SK', color: 'bg-violet-500' },
	{ text: 'Arif Hossain assigned this task to Sara', time: 'Yesterday', initials: 'AH', color: 'bg-accent' },
	{ text: 'Task was created', time: '3 days ago', initials: 'AH', color: 'bg-accent' },
]

const addSubtask = () => {
	if (!newSubtask.value.trim()) return
	subtasks.value.push({ id: Date.now(), title: newSubtask.value.trim(), done: false })
	newSubtask.value = ''
	showAddSubtask.value = false
}

const sendComment = () => {
	if (!newComment.value.trim()) return
	comments.value.push({
		id: Date.now(),
		author: 'You',
		initials: 'YO',
		color: 'bg-accent',
		text: newComment.value.trim(),
		time: 'Just now',
	})
	newComment.value = ''
}
</script>

<template>
	<!-- Backdrop -->
	<Transition name="backdrop">
		<div v-if="task" class="fixed inset-0 bg-heading/30 backdrop-blur-[2px] z-40" @click="emit('close')">
		</div>
	</Transition>

	<!-- Panel -->
	<Transition name="slide-panel">
		<div v-if="task"
			class="fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl bg-panel shadow-2xl flex flex-col overflow-hidden"
			@click.stop>

			<!-- ── Header ─────────────────────────────── -->
			<div class="border-b border-heading/8 px-5 py-4 shrink-0">
				<div class="flex items-start gap-3">
					<!-- Status circle -->
					<button
						:class="['w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer hover:scale-110',
							task.status === 'Done' ? 'border-emerald-500 bg-emerald-500' : statusConfig[task.status]?.ring || 'border-heading/20']">
						<svg v-if="task.status === 'Done'" viewBox="0 0 24 24" fill="none" class="w-2.5 h-2.5">
							<path d="M5 13l4 4L19 7" stroke="white" stroke-width="3" stroke-linecap="round"
								stroke-linejoin="round" />
						</svg>
					</button>

					<!-- Title -->
					<div class="flex-1 min-w-0">
						<template v-if="!editingTitle">
							<h2 class="font-bold text-heading text-base leading-snug cursor-pointer hover:text-accent transition-colors"
								@click="editingTitle = true; newTitle = task.title">
								{{ task.title }}
							</h2>
						</template>
						<template v-else>
							<input v-model="newTitle" type="text"
								class="w-full text-base font-bold text-heading bg-heading/5 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent/30"
								@keyup.enter="editingTitle = false" @keyup.escape="editingTitle = false" v-focus />
						</template>
						<p class="text-xs text-text/35 mt-1">in <span class="font-semibold text-text/50">Tazko
								App</span></p>
					</div>

					<!-- Close -->
					<button @click="emit('close')"
						class="w-7 h-7 rounded-lg flex items-center justify-center text-text/30 hover:text-text/70 hover:bg-heading/5 transition-colors shrink-0">
						<v-icon name="bi-x-circle" scale="1" />
					</button>
				</div>

				<!-- Status + Priority pills -->
				<div class="flex items-center gap-2 mt-3 pl-8">
					<span
						:class="[statusConfig[task.status]?.cls, 'inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-bold cursor-pointer hover:opacity-80']">
						<span :class="[statusConfig[task.status]?.dot, 'w-1.5 h-1.5 rounded-full']"></span>
						{{ task.status }}
					</span>
					<span
						:class="[priorityConfig[task.priority]?.cls, 'text-xs px-2.5 py-1 rounded-full font-bold cursor-pointer hover:opacity-80']">
						{{ task.priority }}
					</span>
					<div v-for="label in labels" :key="label.id"
						:class="[label.color, 'text-xs px-2.5 py-1 rounded-full font-bold']">
						{{ label.name }}
					</div>
				</div>
			</div>

			<!-- ── Section Tabs ────────────────────────── -->
			<div class="flex items-center gap-0.5 px-5 py-2.5 border-b border-heading/5 bg-heading/[0.01] shrink-0">
				<button v-for="s in [
					{ key: 'details', label: 'Details', icon: 'bi-flag' },
					{ key: 'comments', label: 'Comments', icon: 'bi-chat-dots' },
					{ key: 'activity', label: 'Activity', icon: 'bi-activity' },
				]" :key="s.key" @click="activeSection = s.key"
					:class="['flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
						activeSection === s.key ? 'bg-accent text-white shadow-sm' : 'text-text/45 hover:text-text/70 hover:bg-heading/5']">
					<v-icon :name="s.icon" scale="0.8" />
					{{ s.label }}
					<span v-if="s.key === 'comments'" class="text-[10px] opacity-70">({{ comments.length }})</span>
				</button>
			</div>

			<!-- ── Scrollable Body ─────────────────────── -->
			<div class="flex-1 overflow-y-auto">

				<!-- ════ DETAILS ════ -->
				<div v-if="activeSection === 'details'" class="p-5 space-y-5">

					<!-- Meta fields grid -->
					<div class="grid grid-cols-2 gap-3">
						<!-- Assignee -->
						<div class="bg-heading/[0.025] rounded-xl p-3">
							<p class="text-[10px] font-bold text-text/35 uppercase tracking-wider mb-2">Assignee</p>
							<div class="flex items-center gap-2">
								<div :class="['w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0',
									task.assigneeColor || 'bg-accent']">
									{{ task.assignee }}
								</div>
								<span class="text-sm font-semibold text-heading">{{ task.assigneeName || task.assignee
								}}</span>
							</div>
						</div>

						<!-- Due date -->
						<div class="bg-heading/[0.025] rounded-xl p-3">
							<p class="text-[10px] font-bold text-text/35 uppercase tracking-wider mb-2">Due Date</p>
							<div class="flex items-center gap-2">
								<v-icon name="bi-calendar3" class="text-text/40 shrink-0" scale="0.85" />
								<span class="text-sm font-semibold text-heading">{{ task.due }}</span>
							</div>
						</div>

						<!-- Status -->
						<div class="bg-heading/[0.025] rounded-xl p-3">
							<p class="text-[10px] font-bold text-text/35 uppercase tracking-wider mb-2">Status</p>
							<div class="flex items-center gap-2 flex-wrap">
								<button v-for="st in ['Todo', 'In Progress', 'Review', 'Done']" :key="st" :class="['text-[10px] px-2 py-0.5 rounded-full font-bold border transition-all',
									task.status === st
										? `${statusConfig[st]?.cls} ${statusConfig[st]?.border || ''} border`
										: 'bg-heading/5 text-text/30 border-transparent hover:border-heading/15']">
									{{ st }}
								</button>
							</div>
						</div>

						<!-- Priority -->
						<div class="bg-heading/[0.025] rounded-xl p-3">
							<p class="text-[10px] font-bold text-text/35 uppercase tracking-wider mb-2">Priority</p>
							<div class="flex items-center gap-1.5 flex-wrap">
								<button v-for="pr in ['Low', 'Medium', 'High', 'Urgent']" :key="pr" :class="['text-[10px] px-2 py-0.5 rounded-full font-bold transition-all',
									task.priority === pr
										? priorityConfig[pr]?.cls
										: 'bg-heading/5 text-text/30 hover:bg-heading/8']">
									{{ pr }}
								</button>
							</div>
						</div>
					</div>

					<!-- Description -->
					<div>
						<p class="text-[10px] font-bold text-text/35 uppercase tracking-wider mb-2">Description</p>
						<div
							class="bg-heading/[0.025] rounded-xl p-4 min-h-[80px] cursor-text hover:bg-heading/5 transition-colors">
							<p class="text-sm text-text/60 leading-relaxed" v-if="task.description">{{ task.description
							}}</p>
							<p class="text-sm text-text/25 italic" v-else>Click to add a description…</p>
						</div>
					</div>

					<!-- Subtasks -->
					<div>
						<div class="flex items-center justify-between mb-2.5">
							<div class="flex items-center gap-2">
								<p class="text-[10px] font-bold text-text/35 uppercase tracking-wider">Subtasks</p>
								<span class="text-[10px] text-text/30">{{subtasks.filter(s => s.done).length}}/{{
									subtasks.length
								}}</span>
							</div>
							<button @click="showAddSubtask = !showAddSubtask"
								class="inline-flex items-center gap-1 text-[10px] font-bold text-accent hover:text-accent/70 transition-colors">
								<v-icon name="bi-plus-circle" scale="0.75" />
								Add
							</button>
						</div>

						<!-- Subtask progress bar -->
						<div v-if="subtasks.length" class="h-1 bg-heading/8 rounded-full mb-3 overflow-hidden">
							<div class="h-full bg-emerald-500 rounded-full transition-all duration-500"
								:style="`width: ${subtaskProgress}%`"></div>
						</div>

						<div class="space-y-1.5">
							<div v-for="sub in subtasks" :key="sub.id"
								class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-heading/[0.025] hover:bg-heading/5 transition-colors group">
								<button @click="sub.done = !sub.done" :class="['w-4.5 h-4.5 rounded-[5px] border-2 flex items-center justify-center shrink-0 transition-all',
									sub.done ? 'bg-emerald-500 border-emerald-500' : 'border-heading/20 hover:border-accent']">
									<svg v-if="sub.done" viewBox="0 0 24 24" fill="none" class="w-2.5 h-2.5">
										<path d="M5 13l4 4L19 7" stroke="white" stroke-width="3" stroke-linecap="round"
											stroke-linejoin="round" />
									</svg>
								</button>
								<span
									:class="['text-sm flex-1', sub.done ? 'text-text/30 line-through' : 'text-heading font-medium']">
									{{ sub.title }}
								</span>
								<button
									class="w-5 h-5 rounded flex items-center justify-center text-text/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
									@click="subtasks = subtasks.filter(s => s.id !== sub.id)">
									<v-icon name="bi-trash" scale="0.7" />
								</button>
							</div>
						</div>

						<!-- Add subtask inline input -->
						<div v-if="showAddSubtask" class="flex items-center gap-2 mt-2">
							<input v-model="newSubtask" type="text" placeholder="New subtask…"
								class="flex-1 text-sm px-3 py-2 rounded-xl border border-heading/15 bg-panel focus:border-accent focus:outline-none"
								@keyup.enter="addSubtask" @keyup.escape="showAddSubtask = false" />
							<button @click="addSubtask"
								class="px-3 py-2 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent/90 transition-colors">
								Add
							</button>
						</div>
					</div>

					<!-- Labels -->
					<div>
						<p class="text-[10px] font-bold text-text/35 uppercase tracking-wider mb-2">Labels</p>
						<div class="flex items-center gap-2 flex-wrap">
							<span v-for="label in labels" :key="label.id"
								:class="[label.color, 'text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5']">
								{{ label.name }}
								<button @click="labels = labels.filter(l => l.id !== label.id)"
									class="hover:opacity-60 transition-opacity">×</button>
							</span>
							<button
								class="text-xs px-2.5 py-1 rounded-full border border-dashed border-heading/20 text-text/35 hover:border-accent hover:text-accent transition-colors">
								+ Add label
							</button>
						</div>
					</div>
				</div>

				<!-- ════ COMMENTS ════ -->
				<div v-else-if="activeSection === 'comments'" class="p-5 space-y-4">
					<div v-if="!comments.length" class="text-center py-12">
						<v-icon name="bi-chat-dots" class="text-text/15 mb-3" scale="2.5" />
						<p class="text-sm text-text/30">No comments yet. Be the first!</p>
					</div>
					<div v-for="c in comments" :key="c.id" class="flex items-start gap-3 group">
						<div
							:class="[c.color, 'w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0']">
							{{ c.initials }}
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 mb-1">
								<span class="text-xs font-bold text-heading">{{ c.author }}</span>
								<span class="text-[10px] text-text/30">{{ c.time }}</span>
							</div>
							<div class="bg-heading/[0.03] rounded-xl rounded-tl-none px-4 py-3">
								<p class="text-sm text-text/70 leading-relaxed">{{ c.text }}</p>
							</div>
						</div>
					</div>
				</div>

				<!-- ════ ACTIVITY ════ -->
				<div v-else-if="activeSection === 'activity'" class="p-5">
					<div class="space-y-4">
						<div v-for="(item, i) in activity" :key="i" class="flex items-start gap-3">
							<div
								:class="[item.color, 'w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 mt-0.5']">
								{{ item.initials }}
							</div>
							<div>
								<p class="text-xs text-text/65 leading-relaxed">{{ item.text }}</p>
								<p class="text-[10px] text-text/30 mt-0.5">{{ item.time }}</p>
							</div>
						</div>
					</div>
				</div>

			</div>

			<!-- ── Comment Input (pinned bottom) ──────── -->
			<div v-if="activeSection === 'comments'" class="border-t border-heading/8 p-4 bg-panel shrink-0">
				<div class="flex items-end gap-2">
					<div
						class="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white text-[10px] font-bold shrink-0">
						YO
					</div>
					<div class="flex-1 flex items-end gap-2 bg-heading/5 rounded-xl px-3 py-2">
						<textarea v-model="newComment" rows="1" placeholder="Write a comment…"
							class="flex-1 text-sm text-heading bg-transparent resize-none focus:outline-none placeholder-text/30"
							style="max-height: 100px;" @keydown.enter.prevent="sendComment"></textarea>
						<button @click="sendComment" :disabled="!newComment.trim()"
							class="w-7 h-7 rounded-lg bg-accent text-white flex items-center justify-center shrink-0 disabled:opacity-30 hover:bg-accent/90 transition-colors active:scale-90">
							<v-icon name="bi-send" scale="0.75" />
						</button>
					</div>
				</div>
			</div>

		</div>
	</Transition>
</template>

<style scoped>
/* Slide panel */
.slide-panel-enter-active,
.slide-panel-leave-active {
	transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-panel-enter-from,
.slide-panel-leave-to {
	transform: translateX(100%);
}

/* Backdrop */
.backdrop-enter-active,
.backdrop-leave-active {
	transition: opacity 0.25s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
	opacity: 0;
}
</style>