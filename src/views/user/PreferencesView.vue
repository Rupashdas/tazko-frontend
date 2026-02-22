<script setup>
import BaseCard from '@/components/ui/BaseCard.vue'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from '@/utils/toast'
import { TIMEZONES } from '@/resources/timezones'
import { PALETTES } from '@/resources/palettes'
import { usePreferencesStore } from '@/stores/preferences'

// Icons
import { addIcons } from 'oh-vue-icons'
import {
	BiPalette,
	MdAvtimer,
	MdDisabledvisibleOutlined,
	BiSun,
	MdDarkmodeOutlined,
	RiComputerLine
} from 'oh-vue-icons/icons'

addIcons(
	BiPalette,
	MdAvtimer,
	MdDisabledvisibleOutlined,
	BiSun,
	MdDarkmodeOutlined,
	RiComputerLine
)

const { successToast, errorToast } = useToast()

const store = usePreferencesStore()
const { palette, appearance, timezone, week_start, time_format, saving } =
	storeToRefs(store)

const paletteKeys = computed(() => Object.keys(PALETTES))

const APPEARANCE_OPTIONS = [
	{ icon: 'bi-sun', label: 'Light', value: 'light' },
	{ icon: 'md-darkmode-outlined', label: 'Dark', value: 'dark' },
	{ icon: 'ri-computer-line', label: 'Same as OS', value: 'os' },
]

const WEEK_START_OPTIONS = [
	{ label: 'Sunday', value: 'sunday' },
	{ label: 'Monday', value: 'monday' },
	{ label: 'Tuesday', value: 'tuesday' },
	{ label: 'Wednesday', value: 'wednesday' },
	{ label: 'Thursday', value: 'thursday' },
	{ label: 'Friday', value: 'friday' },
	{ label: 'Saturday', value: 'saturday' },
]

const TIME_FORMAT_OPTIONS = [
	{ label: '12-hour clock', value: '12' },
	{ label: '24-hour clock', value: '24' },
]

const previewColor = (name) => {
	const selected = PALETTES[name]
	if (!selected) return {}
	return selected[store.currentMode]
}

const changePalette = (key) => {
	store.updatePalette(key)
}

const changeAppearance = (mode) => {
	store.updateAppearance(mode)
}

const saveDateTime = async () => {
	const { data } = await store.updateDateTimePreferences()
	if (data.status === 'success') {
        successToast(data.message)
    } else {
        if (data.errors && Object.keys(data.errors).length > 0) {
            const messages = Object.values(data.errors).flat()
            messages.forEach(msg => errorToast(msg))
        } else {
            errorToast(data.message || 'Something went wrong')
        }
    }
}
</script>

<template>
	<base-card maxWidth="max-w-3xl" marginTop="mt-10">
		<div class="space-y-6 p-6">

			<!-- Palette -->
			<div>
				<div class="flex items-center gap-2 mb-2">
					<v-icon name="bi-palette" scale="1.5" />
					<h3 class="font-semibold">Color Palettes</h3>
				</div>

				<div class="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6">
					<div v-for="key in paletteKeys" :key="key" @click="changePalette(key)"
						class="cursor-pointer rounded-md border p-2 transition hover:shadow-md" :class="palette === key
							? 'border-accent ring-2 ring-accent'
							: 'border-gray-300'">
						<div class="h-10 flex">
							<div v-for="(colorValue, colorKey) in previewColor(key)" :key="colorKey" class="flex-1"
								:style="{ background: colorValue }" />
						</div>
						<div class="p-2 pb-0 text-sm font-bold capitalize text-center">
							{{ key.replace('_', ' ') }}
						</div>
					</div>
				</div>
			</div>

			<!-- Appearance -->
			<div>
				<div class="flex items-center gap-2 mb-2">
					<v-icon name="md-disabledvisible-outlined" scale="1.5" />
					<h3 class="font-semibold">Appearance</h3>
				</div>

				<div class="flex gap-4 mt-4">
					<button v-for="option in APPEARANCE_OPTIONS" :key="option.value" type="button"
						@click="changeAppearance(option.value)"
						class="px-5 py-2 border rounded-md font-semibold transition" :class="appearance === option.value
							? 'bg-accent text-white border-accent'
							: 'border-gray-300'">
						<v-icon :name="option.icon" class="mr-1" />
						{{ option.label }}
					</button>
				</div>
			</div>

			<!-- Date/Time -->
			<form @submit.prevent="saveDateTime" class="space-y-6">
				<div class="flex items-center gap-2 mb-2">
					<v-icon name="md-avtimer" scale="1.5" />
					<h3 class="font-semibold">Date/Time</h3>
				</div>

				<div>
					<label class="block mb-1 text-sm">Time zone</label>
					<select v-model="timezone" class="input-field">
						<option v-for="tz in TIMEZONES" :key="tz.value" :value="tz.value">
							{{ tz.label }}
						</option>
					</select>
				</div>

				<div>
					<label class="block mb-1 text-sm">First day of week</label>
					<select v-model="week_start" class="input-field">
						<option v-for="opt in WEEK_START_OPTIONS" :key="opt.value" :value="opt.value">
							{{ opt.label }}
						</option>
					</select>
				</div>

				<div>
					<label class="block mb-1 text-sm">Time format</label>
					<select v-model="time_format" class="input-field">
						<option v-for="opt in TIME_FORMAT_OPTIONS" :key="opt.value" :value="opt.value">
							{{ opt.label }}
						</option>
					</select>
				</div>

				<button type="submit" class="tazko-btn w-full" :disabled="saving">
					{{ saving ? 'Saving...' : 'Save My Date/Time Changes' }}
				</button>
			</form>

		</div>
	</base-card>
</template>