<template>
  <div class="brand-select" ref="brandSelectRef">
    <div class="field" :class="{ 'field--active': isOpen }">
      <input
        v-model.trim="inputValue"
        type="text"
        class="field__input"
        @focus="isOpen = true"
        :placeholder="$t('categories.default_brand')"
      />

      <button
        v-if="isBrandChosen"
        type="button"
        class="field__icon-button"
        @click="clearInput"
        aria-label="Clear brand"
      >
        <CrossIcon class="field__icon field__icon--clear" color="blueviolet" />
      </button>

      <ChevronIcon v-else class="field__icon field__icon--chevron" :class="{ active: isOpen }" />
    </div>

    <div v-if="isOpen && !isBrandChosen" class="dropdown">
      <template v-if="searchBrands.length">
        <button
          v-for="brand in searchBrands"
          :key="brand"
          type="button"
          class="dropdown__item"
          @click="chooseBrand(brand)"
        >
          {{ brand }}
        </button>
      </template>

      <div v-else class="dropdown__empty">Бренд не найден</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChevronIcon from '@/assets/icons/ChevronIcon.vue'
import CrossIcon from '@/assets/icons/CrossIcon.vue'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const brandSelectRef = ref<HTMLElement | null>(null)

const inputValue = ref('')
const chosenBrand = ref('')
const isOpen = ref(false)

const isBrandChosen = computed(() => !!chosenBrand.value && chosenBrand.value === inputValue.value)

function clearInput() {
  inputValue.value = ''
  chosenBrand.value = ''
  isOpen.value = false
  emit('update:modelValue', '')
}

function chooseBrand(brand: string) {
  inputValue.value = brand
  chosenBrand.value = brand
  isOpen.value = false
  emit('update:modelValue', brand)
}

watch(
  () => props.modelValue,
  (newValue) => {
    inputValue.value = newValue || ''
    chosenBrand.value = newValue || ''
  },
  { immediate: true },
)

watch(
  () => inputValue.value,
  (newValue) => {
    if (chosenBrand.value !== newValue) {
      chosenBrand.value = ''
    }
  },
)

const searchBrands = computed(() => {
  const query = inputValue.value.toLowerCase()

  if (query) {
    return clothingBrands.filter((brand) => brand.toLowerCase().includes(query))
  }

  return clothingBrands
})

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node

  if (brandSelectRef.value && !brandSelectRef.value.contains(target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

const clothingBrands = [
  'Gucci',
  'Prada',
  'Louis Vuitton',
  'Saint Laurent',
  'Balenciaga',
  'Givenchy',
  'Valentino',
  'Versace',
  'Bottega Veneta',
  'Celine',
  'Loewe',
  'Maison Margiela',
  'Alexander McQueen',
  'Rick Owens',
  'JW Anderson',
  'Ami Paris',
  'Jacquemus',
  'Off-White',
  'Palm Angels',
  'Fear of God',
  'Acne Studios',
  'A.P.C.',
  'Dries Van Noten',
  'Ann Demeulemeester',
  'Helmut Lang',
  'Theory',
  'Zegna',
  'Brunello Cucinelli',
  'Lemaire',
  'Jil Sander',
  'Maison Kitsuné',
  'Comme des Garçons',
  'Comme des Garçons Homme Plus',
  'Yohji Yamamoto',
  'Y-3',
  'Issey Miyake',
  'Homme Plissé Issey Miyake',
  'Sacai',
  'Undercover',
  'Visvim',
  'Neighborhood',
  'BAPE',
  'Mastermind Japan',
  'Jun Takahashi',
  'Kapital',
  'Auralee',
  'Comoli',
  'Engineered Garments',
  'Stone Island',
  'Moncler',
  'Canada Goose',
  'And Wander',
  'Nanamica',
  'Snow Peak',
]
</script>

<style scoped lang="scss">
.brand-select {
  position: relative;
  width: 100%;
  max-width: 220px;
}

.field {
  width: 100%;
  min-height: 42px;
  padding: 0 12px 0 14px;
  border: 1px solid var(--input-border);
  border-radius: var(--radius-sm);
  background: var(--input-bg);
  display: flex;
  align-items: center;
  gap: 8px;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.18s ease;
}

.field:hover {
  background: var(--input-bg-hover);
  border-color: var(--input-border-hover);
}

.field--active {
  border-color: var(--input-border-active);
  box-shadow: var(--focus-ring);
}

.field__input {
  width: 100%;
  border: none;
  background: transparent;
  font: inherit;
  font-size: 14px;
  color: var(--text-secondary);
}

.field__input::placeholder {
  color: var(--input-placeholder);
}

.field__input:focus {
  outline: none;
}

.field__icon {
  flex-shrink: 0;
  transition: transform 0.25s ease;
  color: var(--icon-secondary);
}

.field__icon--chevron.active {
  transform: rotate(180deg);
}

.field__icon-button {
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.field__icon--clear {
  width: 14px;
  height: 14px;
  color: var(--accent);
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

.dropdown__empty {
  padding: 10px;
  font-size: 14px;
  color: var(--text-soft);
}
</style>
