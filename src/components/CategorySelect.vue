<template>
  <div class="lang-select" ref="categorySelectRef">
    <div class="input" :class="{ input__active: isInputFocused }">
      <label :for="`input-radio_${id}`" class="input_category">
        {{ chosenCategory }}
      </label>
      <input type="text" :id="`input-radio_${id}`" @click="isInputFocused = !isInputFocused" />

      <ChevronIcon class="chevron" :class="{ active: isInputFocused }" />
    </div>

    <div v-if="isInputFocused" class="list">
      <div
        v-for="category in categoriesOptions"
        :key="category.categoryName"
        class="list-item"
        @click="chooseCategory(category)"
      >
        {{ category.categoryName }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChevronIcon from '@/assets/icons/ChevronIcon.vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

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
type Category = {
  categoryName: string
  categoryVal: string
}
const { t } = useI18n({ useScope: 'global' })

const isInputFocused = ref<boolean>(false)

const chosenCategory = ref<string>(t('categories.default'))

const categoriesOptions = [
  { categoryName: t('categories.accessory'), categoryVal: 'brand_accessory' },
  { categoryName: t('categories.hat'), categoryVal: 'brand_hat' },
  { categoryName: t('categories.outwear'), categoryVal: 'brand_outwear' },
  { categoryName: t('categories.top'), categoryVal: 'brand_top' },
  { categoryName: t('categories.bottom'), categoryVal: 'brand_bottom' },
  { categoryName: t('categories.shoes'), categoryVal: 'brand_shoes' },
  { categoryName: t('categories.bag'), categoryVal: 'brand_bag' },
  { categoryName: t('categories.glasses'), categoryVal: 'brand_glasses' },
]
const emits = defineEmits(['update:modelValue'])
function chooseCategory(obj: Category) {
  chosenCategory.value = obj.categoryName
  emits('update:modelValue', obj.categoryVal)
  isInputFocused.value = false
}

const categorySelectRef = ref<HTMLElement | null>(null)

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node

  if (categorySelectRef.value && !categorySelectRef.value.contains(target)) {
    isInputFocused.value = false
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
  max-width: 200px;
}

.input {
  display: flex;
  align-items: center;
  border-bottom: 2px solid rgba(86, 86, 86, 0.34);
  width: 100%;
  padding-left: 3px;
  padding-right: 3px;

  background-color: white;
  justify-content: space-between;
  label {
    width: 100%;
    cursor: pointer;
    display: flex;
    gap: 3px;
  }
  input {
    border: none;
    display: none;
  }

  input:focus {
    outline: none;
  }

  &__active {
    border-bottom: 2px solid blueviolet;
  }
  &_category {
    font-size: 13px;
  }
}

.list {
  position: absolute;
  border: 2px solid blueviolet;
  padding: 3px;
  border-radius: 5px;
  top: 30px;
  max-height: 150px;
  height: fit-content;
  overflow-y: scroll;
  background-color: white;
  z-index: 10;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 3px;
  .list-item {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
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
