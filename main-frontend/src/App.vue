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
import { computed, onBeforeMount, onBeforeUpdate, onMounted, onUnmounted } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useSettingsStore } from './stores/settings.ts'
import { useI18n } from 'vue-i18n'
import { Notifications, notify, useNotification } from '@kyvg/vue3-notification'
import SuccessIcon from './assets/icons/notifications/SuccessIcon.vue'
import ErrorIcon from './assets/icons/notifications/ErrorIcon.vue'
import WarningIcon from './assets/icons/notifications/WarningIcon.vue'
import SystemIcon from './assets/icons/notifications/SystemIcon.vue'
import LikesIcon from './assets/icons/LikesIcon.vue'
import CommentsIcon from './assets/icons/CommentsIcon.vue'
import RatingIcon from './assets/icons/RatingIcon.vue'
import { closeSocket, getSocket, startSocket } from './services/socket.ts'
import useAuthStore from './stores/auth.ts'
import { useProfileStore } from './stores/profile.ts'
const route = useRoute()
const settingsStore = useSettingsStore()
const layout = computed(() => route.meta.layout)
const theme = computed(() => {
  return settingsStore.isLightTheme ? 'light-theme' : 'dark-theme'
})
const { locale } = useI18n()

const authStore = useAuthStore()
const profileStore = useProfileStore()

onMounted(() => {
  if (!authStore.accessToken) return
  startSocket(authStore.accessToken)
  const socket = getSocket()
  if (!socket) return

  socket.on('notification:new', (notification) => {
    notify({
      title: notification.title,
      text: notification.text,
      type: notification.type,
    })
  })

  socket.on('online_check', (res: { isOnline: boolean }) => {
    profileStore.isOpenedUserOnline = res.isOnline
  })

  socket.on('online_change', (res: { userId: number; isOnline: boolean }) => {
    if (res.userId === profileStore.openedUserId) {
      profileStore.isOpenedUserOnline = res.isOnline
    }
  })
})

onUnmounted(() => {
  closeSocket()
})
onBeforeMount(() => {
  const storageLang = localStorage.getItem('lang')
  if (typeof storageLang === 'string') {
    locale.value = storageLang
  }
  // removeActivityListeners()
  // document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style scoped lang="scss">
.main {
  min-height: 100vh;
  height: 100%;
  background-color: var(--bg-app);
}
</style>
