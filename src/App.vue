<template>
  <div id="portal"></div>
  <div :class="theme" class="main">
    <component :is="layout">
      <notifications position="bottom right" :max="3">
        <template #body="props">
          <div class="vue-notification-wrapper">
            <button class="vue-notification" :class="props.item.type" @click="props.close">
              <component
                :is="
                  props.item.type === 'success'
                    ? SuccessIcon
                    : props.item.type === 'error'
                      ? ErrorIcon
                      : WarningIcon
                "
              />
              <div class="notification-content">
                <div class="notification-title" v-html="props.item.title" />
                <div v-html="props.item.text" class="notification-text" />
              </div>
            </button>
          </div>
        </template>
      </notifications>

      <div>
        <router-view />
      </div>
    </component>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useSettingsStore } from './stores/settings'
import { useI18n } from 'vue-i18n'
import { Notifications } from '@kyvg/vue3-notification'
import SuccessIcon from './assets/icons/SuccessIcon.vue'
import ErrorIcon from './assets/icons/ErrorIcon.vue'
import WarningIcon from './assets/icons/WarningIcon.vue'
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
