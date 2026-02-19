<template>
  <div class="brand-select">
    <div class="input">
      <input
        v-model.trim="inputValue"
        type="text"
        placeholder="Choose brand"
        @focusin="isInputFocused = true"
      />
      <ChevronIcon
        @click="isInputFocused = !isInputFocused"
        class="chevron"
        :class="{ active: isInputFocused }"
      />
    </div>
    <div v-if="isInputFocused" class="list">
      <div v-for="brand in searchBrand" class="list-item" @click="chooseBrand(brand)">
        {{ brand }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChevronIcon from '@/assets/icons/ChevronIcon.vue'
import { computed, ref } from 'vue'

let searchBrand = computed(() => {
  if (inputValue.value) {
    return clothingBrands.filter((brand) => brand.toLowerCase().includes(inputValue.value))
  } else {
    return clothingBrands
  }
})
const clothingBrands = [
  // Luxury / High Fashion
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

  // Premium / Designer
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

  // Japanese brands 🇯🇵
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

  // High-end Streetwear / Outdoor
  'Stone Island',
  'Moncler',
  'Canada Goose',
  'And Wander',
  'Nanamica',
  'Snow Peak',
]
let inputValue = ref('')
let isInputFocused = ref(false)

const emits = defineEmits(['update:modelValue'])

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
})
function chooseBrand(brand: string) {
  emits('update:modelValue', brand)
  inputValue.value = brand
  isInputFocused.value = false
}
</script>

<style scoped lang="scss">
.brand-select {
  width: fit-content;
  position: relative;
}

.input {
  display: flex;
  align-items: center;
  border: 2px solid blueviolet;
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
  z-index: 20;
  .list-item {
    cursor: pointer;
  }
  .list-item:hover {
    color: blueviolet;
  }
}
.chevron {
  transition: all ease 0.4s;
  cursor: pointer;
}
.active {
  transform: rotate(180deg);
  transition: 0.4s;
}
</style>
