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
import { computed } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import useAuthStore from './stores/auth'
import { useSettingsStore } from './stores/settings'

const route = useRoute()
const settingsStore = useSettingsStore()
const layout = computed(() => route.meta.layout)
const theme = computed(() => {
  return settingsStore.isLightTheme ? 'light-theme' : 'dark-theme'
})
</script>

<style scoped lang="scss">
.main {
  min-height: 100vh;
  height: 100%;
  background-color: var(--bg-app);
}
</style>
