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
                      : props.item.type === 'warn'
                        ? WarningIcon
                        : props.item.type === 'system'
                          ? SystemIcon
                          : props.item.type === 'like'
                            ? LikesIcon
                            : props.item.type === 'comment'
                              ? CommentsIcon
                              : RatingIcon
                "
              />
              <div class="notification-content">
                <div class="notification-title" v-html="$t(props.item.title!)" />
                <div v-html="$t(props.item.text!)" class="notification-text" />
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
import { computed, onBeforeMount, onBeforeUpdate, onMounted } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useSettingsStore } from './stores/settings'
import { useI18n } from 'vue-i18n'
import { Notifications, useNotification } from '@kyvg/vue3-notification'
import SuccessIcon from './assets/icons/notifications/SuccessIcon.vue'
import ErrorIcon from './assets/icons/notifications/ErrorIcon.vue'
import WarningIcon from './assets/icons/notifications/WarningIcon.vue'
import { getWs, handleActivity } from './services/ws'
import { addActivityListeners, removeActivityListeners } from './helpers/activity'
import SystemIcon from './assets/icons/notifications/SystemIcon.vue'
import LikesIcon from './assets/icons/LikesIcon.vue'
import CommentsIcon from './assets/icons/CommentsIcon.vue'
import RatingIcon from './assets/icons/RatingIcon.vue'
const route = useRoute()
const settingsStore = useSettingsStore()
const layout = computed(() => route.meta.layout)
const theme = computed(() => {
  return settingsStore.isLightTheme ? 'light-theme' : 'dark-theme'
})
const { locale } = useI18n()
function handleVisibilityChange() {
  if (document.visibilityState === 'visible') handleActivity()
}
onMounted(() => {
  addActivityListeners()
  document.addEventListener('visibilitychange', handleVisibilityChange)
})
onBeforeMount(() => {
  const storageLang = localStorage.getItem('lang')
  if (typeof storageLang === 'string') {
    locale.value = storageLang
  }
  removeActivityListeners()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style scoped lang="scss">
.main {
  min-height: 100vh;
  height: 100%;
  background-color: var(--bg-app);
}
</style>
