<template>
  <div class="lang-select" ref="langSelectRef">
    <div class="input" :class="{ input__active: isInputFocused }">
      <label for="input-radio">
        <component :is="localeIcon" />
        {{ localeHandle.toUpperCase() }}
      </label>
      <input type="checkbox" id="input-radio" @click="isInputFocused = !isInputFocused" />

      <ChevronIcon class="chevron" :class="{ active: isInputFocused }" />
    </div>

    <div v-if="isInputFocused" class="list">
      <div
        v-for="lang in languageOptions"
        :key="lang.title"
        class="list-item"
        @click="chooseLang(lang.value)"
      >
        <component :is="lang.icon" />
        {{ lang.title }}
      </div>
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
const isInputFocused = ref<boolean>(false)

const localeHandle = computed({
  get() {
    return locale.value
  },
  set(val) {
    locale.value = val
    localStorage.setItem('lang', val)
  },
})
const localeIcon = computed(() => {
  const locale = languageOptions.find((item) => item.value === localeHandle.value)
  return locale?.icon
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
function chooseLang(lang: string) {
  localeHandle.value = lang
  isInputFocused.value = false
}

const langSelectRef = ref<HTMLElement | null>(null)

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node

  if (langSelectRef.value && !langSelectRef.value.contains(target)) {
    isInputFocused.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  const storageLang = localStorage.getItem('lang')
  if (typeof storageLang === 'string') locale.value = storageLang
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
.lang-select {
  position: relative;
  width: 100%;
  max-width: 80px;
}

.input {
  display: flex;
  align-items: center;
  border: 2px solid rgba(86, 86, 86, 0.34);
  width: 100%;
  padding: 3px;
  border-radius: 5px;
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
  display: flex;
  flex-direction: column;
  align-items: center;
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
