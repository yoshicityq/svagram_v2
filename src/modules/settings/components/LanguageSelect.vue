<template>
  <div class="lang-select" ref="langSelectRef">
    <button
      type="button"
      class="trigger"
      :class="{ 'trigger--active': isOpen }"
      @click="toggleOpen"
    >
      <span class="trigger__value">
        <component :is="localeIcon" class="trigger__icon" />
        <span>{{ localeHandle.toUpperCase() }}</span>
      </span>

      <ChevronIcon class="trigger__chevron" :class="{ active: isOpen }" />
    </button>

    <div v-if="isOpen" class="dropdown">
      <button
        v-for="lang in languageOptions"
        :key="lang.value"
        type="button"
        class="dropdown__item"
        :class="{ 'dropdown__item--selected': localeHandle === lang.value }"
        @click="chooseLang(lang.value)"
      >
        <component :is="lang.icon" class="dropdown__icon" />
        <span>{{ lang.title }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChevronIcon from '@/assets/icons/ChevronIcon.vue'
import EnIcon from '@/assets/icons/EnIcon.vue'
import RuIcon from '@/assets/icons/RuIcon.vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const isOpen = ref(false)
const langSelectRef = ref<HTMLElement | null>(null)

const localeHandle = computed({
  get() {
    return locale.value
  },
  set(val: string) {
    locale.value = val
    localStorage.setItem('lang', val)
  },
})

const languageOptions = [
  {
    title: 'EN',
    value: 'en',
    icon: EnIcon,
  },
  {
    title: 'RU',
    value: 'ru',
    icon: RuIcon,
  },
]

const localeIcon = computed(() => {
  const currentLocale = languageOptions.find((item) => item.value === localeHandle.value)
  return currentLocale?.icon
})

function toggleOpen() {
  isOpen.value = !isOpen.value
}

function chooseLang(lang: string) {
  localeHandle.value = lang
  isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node

  if (langSelectRef.value && !langSelectRef.value.contains(target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
.lang-select {
  position: relative;
  width: 100%;
  max-width: 96px;
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
  font-weight: 600;
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
  color: var(--accent);
  font-weight: 600;
}

.dropdown__icon {
  flex-shrink: 0;
}
</style>
