<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { addIcons } from 'oh-vue-icons'
import {
    MdFolderspecialOutlined,
    BiCheckCircle,
    BiClock,
    BiExclamationCircle,
    BiPlusCircle,
    BiChevronLeft,
    BiChevronRight,
    BiArrowRight,
    BiPeople,
    BiCalendar3,
    BiLightningCharge,
    BiThreeDotsVertical,
    BiFlag,
} from 'oh-vue-icons/icons'

addIcons(
    MdFolderspecialOutlined,
    BiCheckCircle, BiClock, BiExclamationCircle,
    BiPlusCircle, BiChevronLeft, BiChevronRight, BiArrowRight,
    BiPeople, BiCalendar3, BiLightningCharge,
    BiThreeDotsVertical, BiFlag
)

const router = useRouter()
const auth = useAuthStore()

// ── Calendar ─────────────────────────────────────────
const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const calendarDays = computed(() => {
    const first = new Date(currentYear.value, currentMonth.value, 1)
    const last = new Date(currentYear.value, currentMonth.value + 1, 0)
    const days = []
    // leading blanks
    for (let i = 0; i < first.getDay(); i++) days.push(null)
    for (let d = 1; d <= last.getDate(); d++) days.push(d)
    return days
})

const prevMonth = () => {
    if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- }
    else currentMonth.value--
}
const nextMonth = () => {
    if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ }
    else currentMonth.value++
}

// Days with events (static)
const eventDays = [3, 7, 12, 15, 18, 22, 25, 28]
const hasEvent = (d) => d && eventDays.includes(d)
const isToday = (d) => d === today.getDate() && currentMonth.value === today.getMonth() && currentYear.value === today.getFullYear()

// ── Stats ─────────────────────────────────────────────
const stats = [
    { label: 'Active Projects', value: 8, icon: 'md-folderspecial-outlined', color: 'text-accent', bg: 'bg-accent/10', delta: '+2 this month' },
    { label: 'Tasks Due Today', value: 5, icon: 'bi-clock', color: 'text-amber-500', bg: 'bg-amber-500/10', delta: '2 overdue' },
    { label: 'Completed', value: 34, icon: 'bi-check-circle', color: 'text-emerald-500', bg: 'bg-emerald-500/10', delta: '+8 this week' },
    { label: 'Team Members', value: 12, icon: 'bi-people', color: 'text-violet-500', bg: 'bg-violet-500/10', delta: '3 online now' },
]

// ── Your Assignments ──────────────────────────────────
const assignments = [
    { id: 1, title: 'Design system audit for dashboard UI', project: 'Tazko App', priority: 'High', due: 'Today', status: 'In Progress', progress: 65 },
    { id: 2, title: 'API integration for authentication module', project: 'Backend Core', priority: 'Urgent', due: 'Tomorrow', status: 'Todo', progress: 0 },
    { id: 3, title: 'Write unit tests for user service', project: 'Tazko App', priority: 'Medium', due: 'Mar 10', status: 'In Progress', progress: 40 },
    { id: 4, title: 'Review and merge PR #42 – role permissions', project: 'Backend Core', priority: 'High', due: 'Mar 11', status: 'Review', progress: 90 },
    { id: 5, title: 'Update onboarding flow documentation', project: 'Docs', priority: 'Low', due: 'Mar 15', status: 'Todo', progress: 0 },
]

const priorityConfig = {
    Urgent: { cls: 'bg-red-500/15 text-red-500', dot: 'bg-red-500' },
    High: { cls: 'bg-amber-500/15 text-amber-600', dot: 'bg-amber-500' },
    Medium: { cls: 'bg-blue-500/15 text-blue-500', dot: 'bg-blue-500' },
    Low: { cls: 'bg-slate-400/15 text-slate-500', dot: 'bg-slate-400' },
}
const statusConfig = {
    'Todo': { cls: 'bg-slate-100 text-slate-500' },
    'In Progress': { cls: 'bg-accent/10 text-accent' },
    'Review': { cls: 'bg-violet-500/10 text-violet-500' },
    'Done': { cls: 'bg-emerald-500/10 text-emerald-600' },
}

// ── Quick Nav ──────────────────────────────────────────
const quickLinks = [
    { label: 'All Projects', icon: 'md-folderspecial-outlined', color: 'text-accent', bg: 'bg-accent/10', route: 'projects' },
    { label: 'My Tasks', icon: 'bi-check-circle', color: 'text-emerald-600', bg: 'bg-emerald-500/10', route: 'home' },
    { label: 'Schedule', icon: 'bi-calendar3', color: 'text-violet-600', bg: 'bg-violet-500/10', route: 'home' },
    { label: 'Team', icon: 'bi-people', color: 'text-amber-600', bg: 'bg-amber-500/10', route: 'home' },
]

// ── Upcoming Events ────────────────────────────────────
const upcomingEvents = [
    { title: 'Sprint Planning — Tazko App', time: 'Today, 2:00 PM', color: 'bg-accent' },
    { title: 'Design Review Meeting', time: 'Tomorrow, 10:00 AM', color: 'bg-violet-500' },
    { title: 'API Milestone Deadline', time: 'Mar 10, EOD', color: 'bg-amber-500' },
    { title: 'Team Retrospective', time: 'Mar 12, 3:00 PM', color: 'bg-emerald-500' },
]

// ── Recent Projects ────────────────────────────────────
const recentProjects = [
    { id: 1, name: 'Tazko App', status: 'In Progress', progress: 62, priority: 'High', members: 5 },
    { id: 2, name: 'Backend Core', status: 'In Progress', progress: 45, priority: 'Urgent', members: 3 },
    { id: 3, name: 'Docs', status: 'Planning', progress: 12, priority: 'Low', members: 2 },
]

const greeting = computed(() => {
    const h = today.getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
})
</script>

<template>
    <div class="pb-20 pt-8 px-1">

        <!-- ── Greeting ─────────────────────────────── -->
        <div class="mb-8 flex items-end justify-between">
            <div>
                <p class="text-sm font-semibold text-accent/80 tracking-widest uppercase mb-1">Dashboard</p>
                <h1 class="text-heading leading-none">
                    {{ greeting }}, {{ auth.user?.name?.split(' ')[0] ?? 'there' }} 👋
                </h1>
                <p class="text-text/80 mt-2 text-sm">
                    Here's what's happening across your workspace today.
                </p>
            </div>
            <button @click="router.push({ name: 'projects' })"
                class="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 active:scale-95 transition-all shadow-lg shadow-accent/20">
                <v-icon name="bi-plus-circle" scale="0.9" />
                New Project
            </button>
        </div>

        <!-- ── Stats Row ──────────────────────────────── -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div v-for="stat in stats" :key="stat.label"
                class="bg-panel rounded-2xl p-5 border border-heading/5 hover:shadow-md transition-all group">
                <div class="flex items-start justify-between mb-4">
                    <div :class="[stat.bg, 'w-10 h-10 rounded-xl flex items-center justify-center']">
                        <v-icon :name="stat.icon" :class="stat.color" scale="1.1" />
                    </div>
                </div>
                <p class="text-3xl font-display font-bold text-heading">{{ stat.value }}</p>
                <p class="text-xs text-text/80 mt-0.5">{{ stat.label }}</p>
                <p class="text-xs mt-2 font-medium" :class="stat.color">{{ stat.delta }}</p>
            </div>
        </div>

        <!-- ── Main Grid ──────────────────────────────── -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">

            <!-- LEFT: Assignments + Recent Projects -->
            <div class="xl:col-span-2 flex flex-col gap-6">

                <!-- Your Assignments -->
                <div class="bg-panel rounded-2xl border border-heading/5 overflow-hidden">
                    <div class="px-6 py-5 flex items-center justify-between border-b border-heading/5">
                        <div>
                            <h2 class="text-base font-bold text-heading">Your Assignments</h2>
                            <p class="text-xs text-text/40 mt-0.5">Tasks assigned to you</p>
                        </div>
                        <button
                            class="text-xs text-accent font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                            View all <v-icon name="bi-arrow-right" scale="0.85" />
                        </button>
                    </div>

                    <div class="divide-y divide-heading/5">
                        <div v-for="task in assignments" :key="task.id"
                            class="px-6 py-4 hover:bg-heading/[0.02] transition-colors group cursor-pointer">
                            <div class="flex items-start gap-3">
                                <!-- Progress ring placeholder -->
                                <div class="mt-0.5 shrink-0">
                                    <div
                                        class="w-5 h-5 rounded-full border-2 border-heading/20 group-hover:border-accent transition-colors">
                                    </div>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-semibold text-heading leading-snug truncate">{{ task.title }}
                                    </p>
                                    <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                                        <span class="text-xs text-text/40">{{ task.project }}</span>
                                        <span class="w-1 h-1 rounded-full bg-text/20"></span>
                                        <span
                                            :class="[priorityConfig[task.priority].cls, 'text-xs px-2 py-0.5 rounded-full font-semibold']">
                                            {{ task.priority }}
                                        </span>
                                        <span
                                            :class="[statusConfig[task.status].cls, 'text-xs px-2 py-0.5 rounded-full font-medium']">
                                            {{ task.status }}
                                        </span>
                                        <span class="text-xs text-text/40 ml-auto">{{ task.due }}</span>
                                    </div>
                                    <!-- Progress bar -->
                                    <div v-if="task.progress > 0"
                                        class="mt-2 h-1 bg-heading/10 rounded-full overflow-hidden">
                                        <div class="h-full rounded-full bg-accent transition-all"
                                            :style="{ width: task.progress + '%' }"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Projects -->
                <div class="bg-panel rounded-2xl border border-heading/5 overflow-hidden">
                    <div class="px-6 py-5 flex items-center justify-between border-b border-heading/5">
                        <div>
                            <h2 class="text-base font-bold text-heading">Recent Projects</h2>
                            <p class="text-xs text-text/40 mt-0.5">Your active workspaces</p>
                        </div>
                        <button @click="router.push({ name: 'projects' })"
                            class="text-xs text-accent font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                            All projects <v-icon name="bi-arrow-right" scale="0.85" />
                        </button>
                    </div>
                    <div class="divide-y divide-heading/5">
                        <div v-for="project in recentProjects" :key="project.id"
                            @click="router.push({ name: 'project-detail', params: { id: project.id } })"
                            class="px-6 py-4 hover:bg-heading/[0.02] transition-colors cursor-pointer group">
                            <div class="flex items-center gap-4">
                                <!-- Color avatar -->
                                <div class="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                                    <v-icon name="md-folderspecial-outlined" class="text-accent" scale="1" />
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center justify-between mb-1">
                                        <p class="text-sm font-bold text-heading">{{ project.name }}</p>
                                        <span
                                            :class="[priorityConfig[project.priority].cls, 'text-xs px-2 py-0.5 rounded-full font-semibold']">
                                            {{ project.priority }}
                                        </span>
                                    </div>
                                    <div class="flex items-center gap-3">
                                        <div class="flex-1 h-1.5 bg-heading/10 rounded-full overflow-hidden">
                                            <div class="h-full rounded-full bg-accent"
                                                :style="{ width: project.progress + '%' }"></div>
                                        </div>
                                        <span class="text-xs text-text/40 shrink-0">{{ project.progress }}%</span>
                                        <span class="text-xs text-text/30 shrink-0">{{ project.members }} members</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- RIGHT: Calendar + Quick Nav + Events -->
            <div class="flex flex-col gap-6">

                <!-- Quick Nav -->
                <div class="grid grid-cols-2 gap-3">
                    <button v-for="link in quickLinks" :key="link.label" @click="router.push({ name: link.route })"
                        class="bg-panel rounded-2xl p-4 border border-heading/5 hover:shadow-md hover:border-accent/20 transition-all active:scale-95 text-left group">
                        <div :class="[link.bg, 'w-9 h-9 rounded-xl flex items-center justify-center mb-3']">
                            <v-icon :name="link.icon" :class="link.color" scale="1" />
                        </div>
                        <p class="text-xs font-bold text-heading">{{ link.label }}</p>
                    </button>
                </div>

                <!-- Calendar -->
                <div class="bg-panel rounded-2xl border border-heading/5 p-5">
                    <!-- Month nav -->
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-sm font-bold text-heading">
                            {{ monthNames[currentMonth] }} {{ currentYear }}
                        </h2>
                        <div class="flex items-center gap-1">
                            <button @click="prevMonth"
                                class="w-7 h-7 rounded-lg hover:bg-heading/5 flex items-center justify-center transition-colors">
                                <v-icon name="bi-chevron-left" scale="0.8" class="text-text/80" />
                            </button>
                            <button @click="nextMonth"
                                class="w-7 h-7 rounded-lg hover:bg-heading/5 flex items-center justify-center transition-colors">
                                <v-icon name="bi-chevron-right" scale="0.8" class="text-text/80" />
                            </button>
                        </div>
                    </div>

                    <!-- Day headers -->
                    <div class="grid grid-cols-7 mb-2">
                        <div v-for="day in dayNames" :key="day"
                            class="text-center text-[10px] font-bold text-text/30 uppercase tracking-wider py-1">
                            {{ day }}
                        </div>
                    </div>

                    <!-- Days grid -->
                    <div class="grid grid-cols-7 gap-y-1">
                        <div v-for="(day, i) in calendarDays" :key="i"
                            class="aspect-square flex flex-col items-center justify-center relative">
                            <div v-if="day" :class="[
                                'w-8 h-8 rounded-full flex flex-col items-center justify-center text-xs font-semibold transition-all cursor-pointer',
                                isToday(day) ? 'bg-accent text-white shadow-md shadow-accent/30' : 'hover:bg-heading/5 text-text/70'
                            ]">
                                {{ day }}
                                <span v-if="hasEvent(day) && !isToday(day)"
                                    class="absolute bottom-0.5 w-1 h-1 rounded-full bg-accent"></span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Upcoming Events -->
                <div class="bg-panel rounded-2xl border border-heading/5 overflow-hidden">
                    <div class="px-5 py-4 border-b border-heading/5">
                        <h2 class="text-sm font-bold text-heading">Upcoming Events</h2>
                    </div>
                    <div class="p-3 flex flex-col gap-2">
                        <div v-for="event in upcomingEvents" :key="event.title"
                            class="flex items-center gap-3 p-3 rounded-xl hover:bg-heading/[0.03] transition-colors cursor-pointer">
                            <div :class="[event.color, 'w-1.5 h-10 rounded-full shrink-0']"></div>
                            <div>
                                <p class="text-xs font-semibold text-heading leading-snug">{{ event.title }}</p>
                                <p class="text-[11px] text-text/40 mt-0.5">{{ event.time }}</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>