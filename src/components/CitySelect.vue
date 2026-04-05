<template>
  <div class="city-select" ref="citySelectRef">
    <div class="field" :class="{ 'field--active': isOpen }">
      <input
        v-model.trim="inputValue"
        type="text"
        class="field__input"
        @focus="isOpen = true"
        placeholder="Choose city"
      />

      <button
        v-if="isCityChosen"
        type="button"
        class="field__icon-button"
        @click="clearInput"
        aria-label="Clear city"
      >
        <CrossIcon class="field__icon field__icon--clear" color="blueviolet" />
      </button>

      <ChevronIcon v-else class="field__icon field__icon--chevron" :class="{ active: isOpen }" />
    </div>

    <div v-if="isOpen && !isCityChosen" class="dropdown">
      <template v-if="searchCities.length">
        <button
          v-for="city in searchCities"
          :key="city"
          type="button"
          class="dropdown__item"
          @click="chooseCity(city)"
        >
          {{ city }}
        </button>
      </template>

      <div v-else class="dropdown__empty">Город не найден</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChevronIcon from '@/assets/icons/ChevronIcon.vue'
import CrossIcon from '@/assets/icons/CrossIcon.vue'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  userCity: {
    type: String,
    default: '',
  },
  modelValue: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const citySelectRef = ref<HTMLElement | null>(null)

const inputValue = ref('')
const chosenCity = ref('')
const isOpen = ref(false)

const isCityChosen = computed(() => !!chosenCity.value && chosenCity.value === inputValue.value)

function clearInput() {
  inputValue.value = ''
  chosenCity.value = ''
  isOpen.value = false
  emit('update:modelValue', '')
}

function chooseCity(city: string) {
  inputValue.value = city
  chosenCity.value = city
  isOpen.value = false
  emit('update:modelValue', city)
}

watch(
  () => props.modelValue,
  (newValue) => {
    inputValue.value = newValue || ''
    chosenCity.value = newValue || ''
  },
  { immediate: true },
)

watch(
  () => props.userCity,
  (newValue) => {
    if (!props.modelValue && newValue) {
      inputValue.value = newValue
      chosenCity.value = newValue
    }
  },
  { immediate: true },
)

watch(
  () => inputValue.value,
  (newValue) => {
    if (chosenCity.value !== newValue) {
      chosenCity.value = ''
    }
  },
)

const searchCities = computed(() => {
  const query = inputValue.value.toLowerCase()

  if (query) {
    return cities.filter((city) => city.toLowerCase().includes(query))
  }

  return cities
})

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node

  if (citySelectRef.value && !citySelectRef.value.contains(target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

const cities = [
  'Москва',
  'Санкт-Петербург',
  'Новосибирск',
  'Екатеринбург',
  'Нижний Новгород',
  'Казань',
  'Челябинск',
  'Омск',
  'Самара',
  'Ростов-на-Дону',
  'Уфа',
  'Красноярск',
  'Пермь',
  'Воронеж',
  'Волгоград',
  'Краснодар',
  'Тюмень',
  'Ижевск',
  'Барнаул',
  'Саратов',
  'Махачкала',
  'Тольятти',
  'Томск',
  'Рязань',
  'Астрахань',
  'Ульяновск',
  'Кемерово',
  'Ярославль',
  'Хабаровск',
  'Рубцовск',
  'Липецк',
  'Иркутск',
  'Братск',
  'Владивосток',
  'Мурманск',
  'Сочи',
  'Тверь',
  'Набережные Челны',
  'Чита',
  'Оренбург',
  'Кострома',
  'Ставрополь',
  'Арзамас',
  'Тамбов',
  'Курск',
  'Смоленск',
  'Таганрог',
  'Нижневартовск',
  'Новороссийск',
  'Балашиха',
  'Петрозаводск',
  'Волжский',
  'Калуга',
  'Магнитогорск',
  'Зеленоград',
  'Шахты',
  'Ухта',
  'Тула',
  'Люберцы',
  'Серпухов',
  'Балашов',
  'Вологда',
  'Коломна',
  'Троицк',
  'Киров',
  'Калининград',
  'Великий Новгород',
  'Псков',
  'Архангельск',
  'Елец',
  'Нижнекамск',
  'Ржев',
  'Брянск',
  'Ленинград',
  'Воскресенск',
  'Раменское',
  'Жуковский',
  'Сургут',
  'Златоуст',
  'Петропавловск-Камчатский',
  'Благовещенск',
  'Кисловодск',
  'Тихвин',
  'Северодвинск',
  'Элиста',
  'Луганск',
  'Орёл',
  'Нижний Тагил',
  'Красногорск',
  'Северск',
  'Курган',
  'Ангарск',
  'Краснослободск',
  'Железногорск',
]
</script>

<style scoped lang="scss">
.city-select {
  position: relative;
  width: 100%;
  // max-width: 260px;
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
