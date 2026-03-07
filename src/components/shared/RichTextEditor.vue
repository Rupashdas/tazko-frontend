<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

// ── Props ──────────────────────────────────────────────
const props = defineProps({
	modelValue: { type: String, default: '' },
	placeholder: { type: String, default: 'Write something…' },
	showToolbar: { type: Boolean, default: true },
	enableMention: { type: Boolean, default: false },
	users: { type: Array, default: () => [] }, // [{ id, name, initials, color, role }]
	minHeight: { type: String, default: '80px' },
	autofocus: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit', 'focus', 'blur'])

// ── State ──────────────────────────────────────────────
const isFocused = ref(false)
const mentionDropdown = ref(null)

const mentionState = ref({
	active: false,
	query: '',
	x: 0,
	y: 0,
	selectedIndex: 0,
	range: null,
})

// ── Filtered users for mention ─────────────────────────
const filteredUsers = computed(() => {
	if (!mentionState.value.query) return props.users.slice(0, 6)
	const q = mentionState.value.query.toLowerCase()
	return props.users.filter(u => u.name.toLowerCase().includes(q)).slice(0, 6)
})

// ── Tiptap Editor ──────────────────────────────────────
const editor = ref(null)

onMounted(() => {
	editor.value = new Editor({
		content: props.modelValue,
		autofocus: props.autofocus,
		extensions: [
			StarterKit.configure({
				heading: false,
				horizontalRule: false,
				codeBlock: false,
			}),
		],
		editorProps: {
			attributes: {
				class: 'tiptap-prose',
				spellcheck: 'true',
			},
		},
		onUpdate({ editor }) {
			emit('update:modelValue', editor.getHTML())
			if (props.enableMention) {
				handleMentionTrigger(editor)
			}
		},
		onFocus() {
			isFocused.value = true
			emit('focus')
		},
		onBlur() {
			isFocused.value = false
			emit('blur')
			// Delay so mention click can fire first
			setTimeout(() => { mentionState.value.active = false }, 150)
		},
		onKeyDown({ event }) {
			if (!mentionState.value.active) return false
			if (event.key === 'ArrowDown') {
				event.preventDefault()
				mentionState.value.selectedIndex = Math.min(
					mentionState.value.selectedIndex + 1,
					filteredUsers.value.length - 1
				)
				return true
			}
			if (event.key === 'ArrowUp') {
				event.preventDefault()
				mentionState.value.selectedIndex = Math.max(mentionState.value.selectedIndex - 1, 0)
				return true
			}
			if (event.key === 'Enter' || event.key === 'Tab') {
				event.preventDefault()
				const user = filteredUsers.value[mentionState.value.selectedIndex]
				if (user) selectMention(user)
				return true
			}
			if (event.key === 'Escape') {
				mentionState.value.active = false
				return true
			}
			return false
		},
	})
})

onBeforeUnmount(() => {
	editor.value?.destroy()
})

// Watch external v-model changes
watch(() => props.modelValue, (val) => {
	if (!editor.value) return
	const current = editor.value.getHTML()
	if (val !== current) editor.value.commands.setContent(val || '', false)
})

// ── @mention logic ─────────────────────────────────────
function handleMentionTrigger(ed) {
	const { state } = ed
	const { selection } = state
	const { from } = selection

	// Get text before cursor
	const textBefore = state.doc.textBetween(
		Math.max(0, from - 50), from, '\n', '\0'
	)

	// Find last @ position
	const atIndex = textBefore.lastIndexOf('@')
	if (atIndex === -1) {
		mentionState.value.active = false
		return
	}

	const query = textBefore.slice(atIndex + 1)
	// Only activate if no space in query (i.e., still typing the mention)
	if (query.includes(' ') || query.includes('\n')) {
		mentionState.value.active = false
		return
	}

	// Get cursor DOM position
	const coords = ed.view.coordsAtPos(from)
	mentionState.value = {
		active: true,
		query,
		x: coords.left,
		y: coords.bottom + 6,
		selectedIndex: 0,
		atFrom: from - query.length - 1, // position of @
		atTo: from,
	}
}

function selectMention(user) {
	if (!editor.value) return

	const { atFrom, atTo } = mentionState.value
	// Replace the @query text with a mention mark
	editor.value.chain()
		.focus()
		.deleteRange({ from: atFrom, to: atTo })
		.insertContent(`<span class="mention-chip" data-mention="${user.id}" data-name="${user.name}">@${user.name}</span>&nbsp;`)
		.run()

	mentionState.value.active = false
}

function insertMention() {
	editor.value?.chain().focus().insertContent('@').run()
}

// ── Public API ─────────────────────────────────────────
function getHTML() { return editor.value?.getHTML() ?? '' }
function getText() { return editor.value?.getText() ?? '' }
function clear() { editor.value?.commands.clearContent() }
function focus() { editor.value?.commands.focus() }
function isEmpty() { return editor.value?.isEmpty ?? true }

defineExpose({ getHTML, getText, clear, focus, isEmpty })
</script>

<template>
	<div class="rich-editor-wrapper" :class="{ 'is-focused': isFocused }">
		<!-- Toolbar (shown only when focused or always based on prop) -->
		<div v-if="showToolbar" class="editor-toolbar">
			<div class="toolbar-group">
				<button type="button" @click="editor?.chain().focus().toggleBold().run()"
					:class="{ 'is-active': editor?.isActive('bold') }" title="Bold (Ctrl+B)">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
						stroke-linecap="round" stroke-linejoin="round">
						<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
						<path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
					</svg>
				</button>
				<button type="button" @click="editor?.chain().focus().toggleItalic().run()"
					:class="{ 'is-active': editor?.isActive('italic') }" title="Italic (Ctrl+I)">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
						stroke-linecap="round" stroke-linejoin="round">
						<line x1="19" y1="4" x2="10" y2="4" />
						<line x1="14" y1="20" x2="5" y2="20" />
						<line x1="15" y1="4" x2="9" y2="20" />
					</svg>
				</button>
				<button type="button" @click="editor?.chain().focus().toggleStrike().run()"
					:class="{ 'is-active': editor?.isActive('strike') }" title="Strikethrough">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
						stroke-linecap="round" stroke-linejoin="round">
						<path d="M16 4H9a3 3 0 0 0-2.83 4" />
						<path d="M14 12a4 4 0 0 1 0 8H6" />
						<line x1="4" y1="12" x2="20" y2="12" />
					</svg>
				</button>
				<button type="button" @click="editor?.chain().focus().toggleCode().run()"
					:class="{ 'is-active': editor?.isActive('code') }" title="Inline code">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
						stroke-linecap="round" stroke-linejoin="round">
						<polyline points="16 18 22 12 16 6" />
						<polyline points="8 6 2 12 8 18" />
					</svg>
				</button>
			</div>
			<div class="toolbar-divider" />
			<div class="toolbar-group">
				<button type="button" @click="editor?.chain().focus().toggleBulletList().run()"
					:class="{ 'is-active': editor?.isActive('bulletList') }" title="Bullet list">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
						stroke-linecap="round" stroke-linejoin="round">
						<line x1="8" y1="6" x2="21" y2="6" />
						<line x1="8" y1="12" x2="21" y2="12" />
						<line x1="8" y1="18" x2="21" y2="18" />
						<line x1="3" y1="6" x2="3.01" y2="6" />
						<line x1="3" y1="12" x2="3.01" y2="12" />
						<line x1="3" y1="18" x2="3.01" y2="18" />
					</svg>
				</button>
				<button type="button" @click="editor?.chain().focus().toggleOrderedList().run()"
					:class="{ 'is-active': editor?.isActive('orderedList') }" title="Numbered list">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
						stroke-linecap="round" stroke-linejoin="round">
						<line x1="10" y1="6" x2="21" y2="6" />
						<line x1="10" y1="12" x2="21" y2="12" />
						<line x1="10" y1="18" x2="21" y2="18" />
						<path d="M4 6h1v4" />
						<path d="M4 10h2" />
						<path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
					</svg>
				</button>
				<button type="button" @click="editor?.chain().focus().toggleBlockquote().run()"
					:class="{ 'is-active': editor?.isActive('blockquote') }" title="Quote">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
						stroke-linecap="round" stroke-linejoin="round">
						<path
							d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
						<path
							d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
					</svg>
				</button>
			</div>
			<div v-if="enableMention" class="toolbar-divider" />
			<div v-if="enableMention" class="toolbar-group">
				<button type="button" @click="insertMention" title="Mention someone (@)">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
						stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="12" r="4" />
						<path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
					</svg>
				</button>
			</div>
		</div>

		<!-- Editor content area -->
		<editor-content :editor="editor" class="editor-content" />

		<!-- @mention suggestion dropdown -->
		<Teleport to="body">
			<Transition name="mention-fade">
				<div v-if="mentionState.active" ref="mentionDropdown" class="mention-dropdown"
					:style="{ top: mentionState.y + 'px', left: mentionState.x + 'px' }">
					<div v-if="filteredUsers.length === 0" class="mention-empty">
						No users found
					</div>
					<button v-for="(user, i) in filteredUsers" :key="user.id" type="button" class="mention-item"
						:class="{ 'is-selected': i === mentionState.selectedIndex }"
						@mousedown.prevent="selectMention(user)">
						<div :class="[user.color, 'mention-avatar']">{{ user.initials }}</div>
						<div class="mention-info">
							<span class="mention-name">{{ user.name }}</span>
							<span class="mention-role">{{ user.role }}</span>
						</div>
					</button>
				</div>
			</Transition>
		</Teleport>
	</div>
</template>

<style scoped>
.rich-editor-wrapper {
	border: 1px solid color-mix(in srgb, var(--color-heading, #111) 10%, transparent);
	border-radius: 14px;
	background: color-mix(in srgb, var(--color-heading, #111) 3%, transparent);
	overflow: hidden;
	transition: border-color 0.2s, box-shadow 0.2s;
}

.rich-editor-wrapper.is-focused {
	border-color: color-mix(in srgb, var(--color-accent, #6366f1) 50%, transparent);
	box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent, #6366f1) 8%, transparent);
}

/* ── Toolbar ── */
.editor-toolbar {
	display: flex;
	align-items: center;
	gap: 2px;
	padding: 6px 10px;
	border-bottom: 1px solid color-mix(in srgb, var(--color-heading, #111) 6%, transparent);
	background: color-mix(in srgb, var(--color-heading, #111) 2%, transparent);
	flex-wrap: wrap;
}

.toolbar-group {
	display: flex;
	align-items: center;
	gap: 1px;
}

.toolbar-divider {
	width: 1px;
	height: 16px;
	background: color-mix(in srgb, var(--color-heading, #111) 10%, transparent);
	margin: 0 4px;
}

.editor-toolbar button {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 28px;
	height: 28px;
	border-radius: 7px;
	border: none;
	background: transparent;
	color: color-mix(in srgb, var(--color-text, #333) 45%, transparent);
	cursor: pointer;
	transition: background 0.15s, color 0.15s;
}

.editor-toolbar button:hover {
	background: color-mix(in srgb, var(--color-heading, #111) 7%, transparent);
	color: var(--color-heading, #111);
}

.editor-toolbar button.is-active {
	background: color-mix(in srgb, var(--color-accent, #6366f1) 15%, transparent);
	color: var(--color-accent, #6366f1);
}

/* ── Editor content ── */
.editor-content {
	padding: 12px 16px;
	cursor: text;
}

/* Tiptap inner div */
:deep(.tiptap-prose) {
	font-size: 0.875rem;
	line-height: 1.65;
	color: var(--color-text, #333);
	outline: none;
	min-height: v-bind(minHeight);
	word-break: break-word;
}

:deep(.tiptap-prose p) {
	margin: 0 0 0.35em 0;
}

:deep(.tiptap-prose p:last-child) {
	margin-bottom: 0;
}

:deep(.tiptap-prose strong) {
	font-weight: 700;
	color: var(--color-heading, #111);
}

:deep(.tiptap-prose em) {
	font-style: italic;
}

:deep(.tiptap-prose s) {
	text-decoration: line-through;
	opacity: 0.5;
}

:deep(.tiptap-prose code) {
	font-family: 'Fira Code', 'Fira Mono', monospace;
	font-size: 0.82em;
	background: color-mix(in srgb, var(--color-accent, #6366f1) 10%, transparent);
	color: var(--color-accent, #6366f1);
	padding: 0.15em 0.4em;
	border-radius: 5px;
}

:deep(.tiptap-prose ul) {
	list-style-type: disc !important;
	padding-left: 1.4em;
	margin: 0.25em 0;
}

:deep(.tiptap-prose ol) {
	list-style-type: decimal !important;
	padding-left: 1.4em;
	margin: 0.25em 0;
}

:deep(.tiptap-prose ul ul) {
	list-style-type: circle !important;
}

:deep(.tiptap-prose ul ul ul) {
	list-style-type: square !important;
}

:deep(.tiptap-prose li) {
	margin: 0.1em 0;
	display: list-item !important;
}

:deep(.tiptap-prose blockquote) {
	border-left: 3px solid var(--color-accent, #6366f1);
	padding-left: 0.85em;
	margin: 0.35em 0;
	opacity: 0.7;
}

/* Placeholder */
:deep(.tiptap-prose p.is-editor-empty:first-child::before) {
	content: attr(data-placeholder);
	float: left;
	color: color-mix(in srgb, var(--color-text, #333) 28%, transparent);
	pointer-events: none;
	height: 0;
	font-style: italic;
}

/* Mention chip inside content */
:deep(.mention-chip) {
	display: inline-block;
	background: color-mix(in srgb, var(--color-accent, #6366f1) 13%, transparent);
	color: var(--color-accent, #6366f1);
	font-weight: 600;
	font-size: 0.82em;
	padding: 0.1em 0.45em;
	border-radius: 6px;
	cursor: default;
	user-select: all;
}

/* ── Mention dropdown ── */
.mention-dropdown {
	position: fixed;
	z-index: 9999;
	min-width: 220px;
	background: var(--color-panel, #fff);
	border: 1px solid color-mix(in srgb, var(--color-heading, #111) 9%, transparent);
	border-radius: 14px;
	box-shadow: 0 8px 30px color-mix(in srgb, var(--color-heading, #111) 14%, transparent),
		0 2px 8px color-mix(in srgb, var(--color-heading, #111) 8%, transparent);
	padding: 5px;
	overflow: hidden;
}

.mention-empty {
	padding: 10px 14px;
	font-size: 0.8rem;
	color: color-mix(in srgb, var(--color-text, #333) 35%, transparent);
	text-align: center;
}

.mention-item {
	display: flex;
	align-items: center;
	gap: 10px;
	width: 100%;
	padding: 7px 10px;
	border: none;
	background: transparent;
	border-radius: 9px;
	cursor: pointer;
	text-align: left;
	transition: background 0.12s;
}

.mention-item:hover,
.mention-item.is-selected {
	background: color-mix(in srgb, var(--color-accent, #6366f1) 9%, transparent);
}

.mention-avatar {
	width: 30px;
	height: 30px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-size: 0.68rem;
	font-weight: 700;
	flex-shrink: 0;
}

.mention-info {
	display: flex;
	flex-direction: column;
	gap: 1px;
}

.mention-name {
	font-size: 0.82rem;
	font-weight: 600;
	color: var(--color-heading, #111);
	line-height: 1.2;
}

.mention-role {
	font-size: 0.72rem;
	color: color-mix(in srgb, var(--color-text, #333) 40%, transparent);
	line-height: 1.2;
}

/* Mention dropdown animation */
.mention-fade-enter-active,
.mention-fade-leave-active {
	transition: opacity 0.12s ease, transform 0.12s ease;
}

.mention-fade-enter-from,
.mention-fade-leave-to {
	opacity: 0;
	transform: translateY(-4px) scale(0.97);
}
</style>