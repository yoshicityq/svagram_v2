<template>
  <div class="city-select">
    <div class="input">
      <input
        v-model.trim="inputValue"
        type="text"
        placeholder="Choose city"
        @focusin="isInputFocused = true"
      />
      <ChevronIcon
        @click="isInputFocused = !isInputFocused"
        class="chevron"
        :class="{ active: isInputFocused }"
      />
    </div>
    <div v-if="isInputFocused" class="list">
      <div v-for="city in searchCities" class="list-item" @click="chooseCity(city)">
        {{ city }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChevronIcon from '@/assets/icons/ChevronIcon.vue'
import { computed, ref } from 'vue'
let searchCities = computed(() => {
  if (inputValue.value) {
    return cities.filter((city) => city.toLowerCase().includes(inputValue.value))
  } else {
    return cities
  }
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
let inputValue = ref('')
let isInputFocused = ref(false)
const emits = defineEmits(['chooseCity'])
function chooseCity(city: string) {
  inputValue.value = city
  isInputFocused.value = false
  emits('chooseCity', inputValue.value)
}
</script>

<style scoped lang="scss">
.city-select {
  width: fit-content;
  position: relative;
}

.input {
  display: flex;
  align-items: center;
  border: 1px solid black;
  padding: 3px;
  border-radius: 5px;
  input {
    border: none;
  }
  input:focus {
    outline: none;
  }
}
.list {
  position: absolute;
  border: 1px solid black;
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
    color: blue;
  }
}
.chevron {
  transition: all ease 0.4s;
  cursor: pointer;
}
.active {
  transform: rotate(180deg);
}
</style>
