<template>
  <div class="title-select" ref="titleSelectRef">
    <button
      type="button"
      class="trigger"
      :class="{ 'trigger--active': isOpen }"
      @click="toggleOpen"
    >
      <span class="trigger__value">
        <span>{{ currentTitleLabel }}</span>
      </span>

      <span class="trigger__actions">
        <span
          v-if="hasSelection"
          class="trigger__clear"
          role="button"
          tabindex="0"
          aria-label="Clear title"
          @click.stop="clearTitle"
          @keydown.enter.stop.prevent="clearTitle"
          @keydown.space.stop.prevent="clearTitle"
        >
          <CrossIcon class="trigger__clear-icon" />
        </span>
        <ChevronIcon v-if="!hasSelection" class="trigger__chevron" :class="{ active: isOpen }" />
      </span>
    </button>

    <div v-if="isOpen" class="dropdown">
      <button
        v-for="title in titlesList"
        :key="title.id!"
        type="button"
        class="dropdown__item"
        :class="{ 'dropdown__item--selected': modelValue?.id === title.id }"
        @click="chooseTitle(title)"
      >
        <span>{{ title.title_name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { apiFetch } from '@/api/apiFetch'
import ChevronIcon from '@/assets/icons/ChevronIcon.vue'
import CrossIcon from '@/assets/icons/CrossIcon.vue'
// import CloseIcon from '@/assets/icons/CloseIcon.vue'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

type Title = {
  id: number | null
  title_name: string | null
}

const props = defineProps<{
  modelValue: Title | null | Record<string, never>
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', value: Title | null): void
}>()

const isOpen = ref(false)
const titleSelectRef = ref<HTMLElement | null>(null)
const titlesList = ref<Array<Title>>()

const hasSelection = computed(
  () => !!(props.modelValue && 'id' in props.modelValue && props.modelValue.id != null),
)

const currentTitleLabel = computed(() => {
  if (hasSelection.value) {
    return (props.modelValue as Title).title_name ?? 'Choose title'
  }
  return 'Choose title'
})

function toggleOpen() {
  isOpen.value = !isOpen.value
}

async function chooseTitle(title: Title) {
  emits('update:modelValue', title)
  await setCurrTitle(title.id)
  isOpen.value = false
}

async function clearTitle() {
  emits('update:modelValue', null)
  await setCurrTitle(null)
  isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node
  if (titleSelectRef.value && !titleSelectRef.value.contains(target)) {
    isOpen.value = false
  }
}

async function getTitlesList() {
  const response = await apiFetch('/me/titles')
  const data = await response.json()
  titlesList.value = data
}

async function setCurrTitle(id: number | null) {
  await apiFetch('/me/title', {
    method: 'PUT',
    body: JSON.stringify({ title_id: id }),
  })
}

watch(
  () => titlesList.value,
  async () => {
    if (!titlesList.value) {
      await getTitlesList()
    }
  },
  { immediate: true },
)

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
.title-select {
  position: relative;
  width: 100%;
}

.trigger {
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid var(--input-border);
  border-radius: var(--radius-sm);
  background: var(--input-bg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.18s ease;
}

.trigger:hover {
  background: var(--input-bg-hover);
  border-color: var(--input-border-hover);
}

.trigger:focus-visible {
  outline: none;
  border-color: var(--input-border-active);
  box-shadow: var(--focus-ring);
}

.trigger--active {
  border-color: var(--input-border-active);
  box-shadow: 0 0 0 4px var(--accent-soft);
}

.trigger__value {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: 14px;
  color: var(--text-secondary);
}

.trigger__icon {
  flex-shrink: 0;
}

.trigger__chevron {
  flex-shrink: 0;
  transition: transform 0.25s ease;
  color: var(--icon-secondary);
}

.trigger__chevron.active {
  transform: rotate(180deg);
}

.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 20;
  padding: 8px;
  border: 1px solid var(--dropdown-border);
  border-radius: var(--radius-md);
  background: var(--dropdown-bg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dropdown__item {
  width: 100%;
  min-height: 38px;
  padding: 0 10px;
  border: none;
  border-radius: var(--radius-xs);
  background: transparent;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: var(--text-secondary);
  transition:
    background-color 0.18s ease,
    color 0.18s ease;
}

.dropdown__item:hover {
  background: var(--dropdown-item-hover);
  color: var(--icon-primary);
}

.dropdown__item:focus-visible {
  outline: none;
  background: var(--dropdown-item-active);
}

.dropdown__item--selected {
  background: var(--dropdown-item-active);
  color: var(--text-secondary);
  font-weight: 600;
}

.dropdown__icon {
  flex-shrink: 0;
}
.trigger__actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.trigger__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--icon-secondary);
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    color 0.18s ease;
}

.trigger__clear:hover {
  background: var(--dropdown-item-hover);
  color: var(--icon-primary);
}

.trigger__clear:focus-visible {
  outline: none;
  background: var(--dropdown-item-active);
}

.trigger__clear-icon {
  width: 12px;
  height: 12px;
}
</style>
