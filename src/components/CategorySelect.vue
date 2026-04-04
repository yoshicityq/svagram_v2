<template>
  <div class="category-select" ref="categorySelectRef">
    <button
      type="button"
      class="trigger"
      :class="{ 'trigger--active': isOpen }"
      @click="toggleOpen"
    >
      <span class="trigger__label">
        {{ selectedOption?.categoryName ?? t('categories.default_category') }}
      </span>

      <ChevronIcon class="trigger__chevron" :class="{ active: isOpen }" />
    </button>

    <div v-if="isOpen" class="dropdown">
      <button
        v-for="category in categoriesOptions"
        :key="category.categoryVal"
        type="button"
        class="dropdown__item"
        :class="{ 'dropdown__item--selected': modelValue === category.categoryVal }"
        @click="chooseCategory(category)"
      >
        {{ category.categoryName }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChevronIcon from '@/assets/icons/ChevronIcon.vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

type Category = {
  categoryName: string
  categoryVal: string
}

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  id: {
    type: Number,
    required: true,
  },
})

const emits = defineEmits(['update:modelValue'])

const { t } = useI18n({ useScope: 'global' })

const isOpen = ref(false)
const categorySelectRef = ref<HTMLElement | null>(null)

const categoriesOptions = computed<Category[]>(() => [
  { categoryName: t('categories.accessory'), categoryVal: 'brand_accessory' },
  { categoryName: t('categories.hat'), categoryVal: 'brand_hat' },
  { categoryName: t('categories.outwear'), categoryVal: 'brand_outwear' },
  { categoryName: t('categories.top'), categoryVal: 'brand_top' },
  { categoryName: t('categories.bottom'), categoryVal: 'brand_bottom' },
  { categoryName: t('categories.shoes'), categoryVal: 'brand_shoes' },
  { categoryName: t('categories.bag'), categoryVal: 'brand_bag' },
  { categoryName: t('categories.glasses'), categoryVal: 'brand_glasses' },
])

const selectedOption = computed(() => {
  return categoriesOptions.value.find((item) => item.categoryVal === props.modelValue) ?? null
})

function toggleOpen() {
  isOpen.value = !isOpen.value
}

function chooseCategory(category: Category) {
  emits('update:modelValue', category.categoryVal)
  isOpen.value = false
}
</script>

<style scoped lang="scss">
.category-select {
  position: relative;
  width: 100%;
  max-width: 220px;
}

.trigger {
  width: 100%;
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid var(--input-border);
  border-radius: var(--radius-sm);
  background: var(--input-bg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
  text-align: left;
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

.trigger__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  color: var(--text-secondary);
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
  max-height: 240px;
  overflow-y: auto;
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
</style>
