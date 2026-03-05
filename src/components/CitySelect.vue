<template>
  <div class="city-select" ref="citySelectRef">
    <div class="input" :class="{ input__active: isInputFocused }">
      <input
        v-model.trim="inputValue"
        type="text"
        @focusin="isInputFocused = true"
        placeholder="Choose city"
      />
      <ChevronIcon class="chevron" v-show="!isCityChosen" :class="{ active: isInputFocused }" />
      <CrossIcon class="cross" v-show="isCityChosen" color="blueviolet" @click="clearInput" />
    </div>
    <div v-if="isInputFocused && !isCityChosen" class="list">
      <template v-if="searchCities.length">
        <div v-for="city in searchCities" :key="city" class="list-item" @click="chooseCity(city)">
          {{ city }}
        </div>
      </template>

      <div v-else class="not-found">Город не найден</div>
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
  },
  modelValue: {
    type: String,
    required: true,
  },
})
const citySelectRef = ref<HTMLElement | null>(null)
let inputValue = ref<string>('')
let isCityChosen = ref<boolean>(false)
let isInputFocused = ref<boolean>(false)
let chosenCity = ref<string>('')

function clearInput() {
  inputValue.value = ''
  isCityChosen.value = false
  chosenCity.value = ''
}
const emits = defineEmits(['update:modelValue'])
function chooseCity(city: string) {
  inputValue.value = city
  isCityChosen.value = true
  chosenCity.value = city
  emits('update:modelValue', city)
}
watch(
  () => props.userCity,
  () => {
    if (props.userCity) {
      inputValue.value = props.userCity
      chosenCity.value = props.userCity
      isCityChosen.value = true
    }
  },
  { immediate: true },
)

watch(
  () => inputValue.value,
  () => {
    if (chosenCity.value !== inputValue.value) isCityChosen.value = false
  },
  { immediate: true },
)
let searchCities = computed(() => {
  if (inputValue.value) {
    return cities.filter((city) => city.toLowerCase().includes(inputValue.value.toLowerCase()))
  } else {
    return cities
  }
})
function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node

  if (citySelectRef.value && !citySelectRef.value.contains(target)) {
    isInputFocused.value = false
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
  'Ярославль',
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
  'Казань',
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
  'Калуга',
  'Сургут',
  'Златоуст',
  'Томск',
  'Петропавловск-Камчатский',
  'Тамбов',
  'Благовещенск',
  'Кисловодск',
  'Тихвин',
  'Северодвинск',
  'Рубцовск',
  'Элиста',
  'Луганск',
  'Орёл',
  'Нижний Тагил',
  'Арзамас',
  'Красногорск',
  'Воронеж',
  'Киров',
  'Северск',
  'Тольятти',
  'Курган',
  'Кострома',
  'Ангарск',
  'Краснослободск',
  'Железногорск',
]
</script>

<style scoped lang="scss">
.city-select {
  position: relative;
}

.input {
  display: flex;
  align-items: center;
  border: 2px solid rgba(86, 86, 86, 0.34);
  width: 100%;
  padding: 3px;
  border-radius: 5px;
  input {
    border: none;
    width: 100%;
  }
  input:focus {
    outline: none;
  }
  &__active {
    border: 2px solid blueviolet;
  }
}
.list {
  position: absolute;
  border: 2px solid blueviolet;
  padding: 3px;
  border-radius: 5px;
  top: 40px;
  max-height: 150px;
  height: fit-content;
  overflow-y: scroll;
  background-color: white;
  z-index: 10;
  .list-item {
    cursor: pointer;
  }
  .list-item:hover {
    color: blueviolet;
  }
}
.chevron {
  transition: all ease 0.4s;
}
.cross {
  width: 10px;
  cursor: pointer;
  margin-right: 5px;
}
.active {
  transform: rotate(180deg);
}
</style>
