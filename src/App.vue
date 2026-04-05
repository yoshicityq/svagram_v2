<template>
  <div id="portal"></div>
  <div :class="theme" class="main">
    <component :is="layout">
      <div>
        <router-view />
      </div>
    </component>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import useAuthStore from './stores/auth'
import { useSettingsStore } from './stores/settings'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const settingsStore = useSettingsStore()
const layout = computed(() => route.meta.layout)
const theme = computed(() => {
  return settingsStore.isLightTheme ? 'light-theme' : 'dark-theme'
})
const { locale } = useI18n()

onBeforeMount(() => {
  const storageLang = localStorage.getItem('lang')
  if (typeof storageLang === 'string') {
    locale.value = storageLang
  }
})
</script>

<style scoped lang="scss">
.main {
  min-height: 100vh;
  height: 100%;
  background-color: var(--bg-app);
}
</style>
