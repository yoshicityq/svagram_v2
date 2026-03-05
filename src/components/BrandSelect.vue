<template>
  <div class="brand-select" ref="brandSelectRef">
    <div class="input" :class="{ input__active: isInputFocused }">
      <input
        v-model.trim="inputValue"
        type="text"
        @focusin="isInputFocused = true"
        placeholder="Choose brand"
      />

      <ChevronIcon v-show="!isBrandChosen" class="chevron" :class="{ active: isInputFocused }" />

      <CrossIcon v-show="isBrandChosen" class="cross" color="blueviolet" @click="clearInput" />
    </div>

    <div v-if="isInputFocused && !isBrandChosen" class="list">
      <template v-if="searchBrands.length">
        <div
          v-for="brand in searchBrands"
          :key="brand"
          class="list-item"
          @click="chooseBrand(brand)"
        >
          {{ brand }}
        </div>
      </template>

      <div v-else class="not-found">Бренд не найден</div>
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

const inputValue = ref<string>('')
const isBrandChosen = ref<boolean>(false)
const isInputFocused = ref<boolean>(false)
const chosenBrand = ref<string>('')

function clearInput() {
  inputValue.value = ''
  chosenBrand.value = ''
  isBrandChosen.value = false
  emit('update:modelValue', '')
}

function chooseBrand(brand: string) {
  inputValue.value = brand
  chosenBrand.value = brand
  isBrandChosen.value = true
  isInputFocused.value = false
  emit('update:modelValue', brand)
}

watch(
  () => props.modelValue,
  (newValue) => {
    inputValue.value = newValue || ''
    chosenBrand.value = newValue || ''
    isBrandChosen.value = !!newValue
  },
  { immediate: true },
)

watch(
  () => inputValue.value,
  () => {
    if (chosenBrand.value !== inputValue.value) {
      isBrandChosen.value = false
    }
  },
)

const searchBrands = computed(() => {
  if (inputValue.value) {
    return clothingBrands.filter((brand) =>
      brand.toLowerCase().includes(inputValue.value.toLowerCase()),
    )
  }

  return clothingBrands
})

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node

  if (brandSelectRef.value && !brandSelectRef.value.contains(target)) {
    isInputFocused.value = false
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
  max-width: 200px;
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
  width: 100%;

  .list-item {
    cursor: pointer;
  }

  .list-item:hover {
    color: blueviolet;
  }
}

.not-found {
  padding: 4px 2px;
  color: gray;
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
