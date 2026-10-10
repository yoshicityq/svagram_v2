<template>
  <div class="notifications-page">
    <div class="notifications-container">
      <header class="notifications-header">
        <div class="notifications-header__top">
          <h1 class="notifications-header__title">{{ $t('title.notifications_title') }}</h1>

          <button
            type="button"
            class="header-btn header-btn--ghost"
            :disabled="!unreadCount"
            @click="markAllAsRead"
          >
            <svg
              class="header-btn__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>

            <span>{{ $t('buttons.all_read') }}</span>
          </button>
        </div>

        <div class="notifications-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            class="notifications-tab"
            :class="{ 'notifications-tab--active': activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ $t(tab.label) }}

            <span v-if="tab.count" class="notifications-tab__count">{{ tab.count }}</span>
          </button>
        </div>
      </header>

      <div class="notifications-body">
        <div v-if="loading" class="notifications-state">
          <MyLoader />
        </div>

        <div v-else-if="!filteredNotifications.length" class="notifications-state">
          <div class="notifications-empty">
            <div class="notifications-empty__icon-wrap">
              <svg
                class="notifications-empty__icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />

                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>

            <h2 class="notifications-empty__title">You're all caught up</h2>

            <p class="notifications-empty__text">
              {{
                activeTab === 'unread'
                  ? 'No unread notifications right now.'
                  : 'When someone interacts with your posts, you’ll see it here.'
              }}
            </p>
          </div>
        </div>

        <ul v-else class="notifications-list">
          <li
            v-for="group in filteredNotifications"
            :key="getGroupKey(group)"
            class="notification-group"
            :class="{
              'notification-group--stacked': group.notifications.length > 2,

              'notification-group--expanded': isGroupExpanded(group),
            }"
          >
            <div class="notification-group__row">
              <div
                class="notification-stack"
                :class="{
                  'notification-stack--collapsed':
                    group.notifications.length > 2 && !isGroupExpanded(group),
                }"
              >
                <TransitionGroup
                  name="notification-expand"
                  tag="div"
                  class="notification-stack__list"
                >
                  <div v-for="n in visibleNotifications(group)" :key="n.id" class="notification">
                    <div class="notification__avatar-wrap">
                      <MyAvatar
                        v-if="n.actor"
                        :username="n.actor.username"
                        size="small"
                        class="avatar-img"
                        @click="openActorProfile(n.actor.username)"
                      />

                      <SystemIcon v-else class="system-img" />

                      <span
                        class="notification__type-badge"
                        :class="`notification__type-badge--${n.type}`"
                      >
                        <svg
                          v-if="n.type === 'like'"
                          class="notification__type-icon"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path
                            d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10z"
                          />
                        </svg>

                        <svg
                          v-else-if="n.type === 'comment'"
                          class="notification__type-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2.4"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>

                        <svg
                          v-else-if="n.type === 'rate'"
                          class="notification__type-icon"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path
                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                          />
                        </svg>

                        <svg
                          v-else
                          class="notification__type-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2.2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />

                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                      </span>
                    </div>

                    <div class="notification__body">
                      <div v-if="n.title" class="notification__title">
                        {{ $t(n.title) }}
                      </div>

                      <div class="notification__text">
                        <div>
                          <router-link
                            v-if="n.actor"
                            :to="n.actor.username"
                            class="notification__username"
                          >
                            {{ n.actor.username }}
                          </router-link>

                          <span v-if="n.text" class="notification__action">
                            {{ $t(n.text) }}
                          </span>

                          <span
                            v-if="n.type === 'rate' && n.metadata?.rating"
                            class="notification__action"
                          >
                            {{ n.metadata.rating }}/5★
                          </span>

                          <span
                            v-if="n.type === 'title' && n.metadata?.titleName"
                            class="notification__action notification__action__titleName"
                          >
                            {{ n.metadata.titleName }}
                          </span>
                        </div>

                        <div v-if="n.type === 'comment' && n.content" class="notification__subtext">
                          <span>{{ n.content }}</span>
                        </div>

                        <div v-if="n.type === 'title' && n.content" class="notification__subtext">
                          <span>{{ $t(n.content) }}</span>
                        </div>
                      </div>

                      <div class="notification__meta">
                        <span class="notification__time">
                          {{ formatTime(n.createdAt) }}
                        </span>

                        <span v-if="n.deleteAfterReadAt" class="notification__expiry">
                          <svg
                            class="notification__expiry-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <circle cx="12" cy="12" r="9" />

                            <path d="M12 7v5l3 2" />
                          </svg>

                          {{ formatTimeLeft(n.deleteAfterReadAt) }}
                        </span>
                      </div>
                    </div>

                    <div
                      v-if="n.entityType === 'post' && n.entityId !== null"
                      class="notification__preview"
                      :class="{ 'notification__preview--loading': !postImages[n.entityId] }"
                    >
                      <img
                        v-if="postImages[n.entityId]"
                        :src="postImages[n.entityId]"
                        alt="Post preview"
                        class="notification__preview-img"
                        @click="openPost(n.entityId)"
                      />
                    </div>

                    <button
                      v-if="!n.isRead"
                      type="button"
                      class="notification__btn"
                      title="Mark as read"
                      @click="markAsRead(n.id)"
                    >
                      <svg
                        class="notification__btn-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </button>

                    <span
                      v-if="
                        !n.isRead ||
                        (group.notifications.length > 2 &&
                          !isGroupExpanded(group) &&
                          groupHasUnread(group))
                      "
                      class="notification__unread-dot"
                      aria-hidden="true"
                    />
                  </div>
                </TransitionGroup>
              </div>

              <div v-if="group.notifications.length > 2" class="notification-group__toggle-wrap">
                <button
                  type="button"
                  class="notification-group__toggle"
                  :class="{
                    'notification-group__toggle--expanded': isGroupExpanded(group),
                  }"
                  :title="
                    isGroupExpanded(group) ? 'Collapse notifications' : 'Expand notifications'
                  "
                  :aria-expanded="isGroupExpanded(group)"
                  @click="toggleGroup(group)"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                <span class="notification-group__count">
                  {{ group.notifications.length }}
                </span>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <OpenPostDialog />
</template>

<script setup lang="ts">
import { apiFetch } from '@/api/apiFetch'

import SystemIcon from '@/assets/icons/notifications/SystemIcon.vue'

import MyAvatar from '@/components/MyAvatar.vue'

import MyLoader from '@/components/MyLoader.vue'

import OpenPostDialog from '@/components/OpenPostDialog.vue'

import useModalStore from '@/stores/modals'

import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'

import { useI18n } from 'vue-i18n'

import { useRoute, useRouter } from 'vue-router'

type NotificationType = 'like' | 'comment' | 'rate' | string

type Meta = {
  postId: number

  commentId?: number | null

  parentCommentId?: number | null

  rating: number | null

  titleId?: number

  titleName?: string
}

type Actor = {
  id: number

  username: string

  avatarUrl: string
}

type Notification = {
  id: number

  type: NotificationType

  sourceType: string

  entityType: string | null

  entityId: number | null

  title: string | null

  text: string | null

  content: string | null

  isRead: boolean

  createdAt: string | number

  readAt: string | null

  deleteAfterReadAt: string | number | null

  metadata: Meta | null

  recipientUserId: number

  actorUserId: number | null

  actor: Actor | null
}

type NotificationGroup = {
  actor: number | 'system'

  notifications: Notification[]
}

const notifications = ref<NotificationGroup[]>([])

const loading = ref(false)

const activeTab = ref<'all' | 'unread'>('all')

const expandedGroups = reactive(new Set<string>())

const now = ref(Date.now())

let nowInterval: ReturnType<typeof setInterval> | null = null

const postImages = ref<Record<number, string>>({})

const loadingImages = new Set<number>()

const { t } = useI18n()

const modalStore = useModalStore()

const route = useRoute()

const router = useRouter()

const notificationsCount = computed(() => {
  return notifications.value.reduce((count, group) => {
    return count + group.notifications.length
  }, 0)
})

const unreadCount = computed(() => {
  return notifications.value.reduce((count, group) => {
    return count + group.notifications.filter((notification) => !notification.isRead).length
  }, 0)
})

const tabs = computed(() => [
  {
    id: 'all' as const,

    label: 'helpers.all',

    count: notificationsCount.value,
  },

  {
    id: 'unread' as const,

    label: 'helpers.unread',

    count: unreadCount.value,
  },
])

const filteredNotifications = computed<NotificationGroup[]>(() => {
  if (activeTab.value === 'all') {
    return notifications.value
  }

  return notifications.value

    .map((group) => ({
      ...group,

      notifications: group.notifications.filter((notification) => !notification.isRead),
    }))

    .filter((group) => group.notifications.length > 0)
})

function getGroupKey(group: NotificationGroup): string {
  return String(group.actor)
}

function isGroupExpanded(group: NotificationGroup): boolean {
  return expandedGroups.has(getGroupKey(group))
}

function groupHasUnread(group: NotificationGroup): boolean {
  return group.notifications.some((notification) => !notification.isRead)
}

function toggleGroup(group: NotificationGroup) {
  const key = getGroupKey(group)

  if (expandedGroups.has(key)) {
    expandedGroups.delete(key)

    return
  }

  expandedGroups.add(key)
}

function visibleNotifications(group: NotificationGroup): Notification[] {
  if (group.notifications.length <= 2 || isGroupExpanded(group)) {
    return group.notifications
  }

  return group.notifications.slice(0, 1)
}

function toTimestamp(value: string | number | null): number | null {
  if (value === null || value === undefined) {
    return null
  }

  if (typeof value === 'number') {
    // Unix seconds
    if (value < 1_000_000_000_000) {
      return value * 1000
    }

    // milliseconds
    return value
  }

  const normalized = value.trim()

  // например "1760000000" или "1760000000000"
  if (/^\d+$/.test(normalized)) {
    const numericValue = Number(normalized)

    return numericValue < 1_000_000_000_000 ? numericValue * 1000 : numericValue
  }

  const parsed = Date.parse(normalized)

  if (Number.isNaN(parsed)) {
    console.error('Invalid notification date:', value)
    return null
  }

  return parsed
}
function getPluralKey(value: number, unit: 'minute' | 'hour' | 'day' | 'week'): string {
  const mod10 = value % 10

  const mod100 = value % 100

  if (mod10 === 1 && mod100 !== 11) {
    return `time.${unit}_ago_1`
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `time.${unit}_ago_2_4`
  }

  return `time.${unit}_ago_5`
}

function formatTime(value: string | number): string {
  const ts = toTimestamp(value)

  if (ts === null) {
    return ''
  }

  const diff = now.value - ts

  // дата почему-то пришла из будущего
  if (diff < 0) {
    console.warn('Notification date is in the future:', value)
    return t('time.just_now')
  }

  const m = Math.floor(diff / 60000)

  if (m < 1) {
    return t('time.just_now')
  }

  if (m < 60) {
    return m === 1 ? t('time.minute_ago_1') : `${m} ${t(getPluralKey(m, 'minute'))}`
  }

  const h = Math.floor(m / 60)

  if (h < 24) {
    return `${h} ${t(getPluralKey(h, 'hour'))}`
  }

  const d = Math.floor(h / 24)

  if (d < 7) {
    return `${d} ${t(getPluralKey(d, 'day'))}`
  }

  const w = Math.floor(d / 7)

  return `${w} ${t(getPluralKey(w, 'week'))}`
}

function formatTimeLeft(value: string | number | null): string {
  const ts = toTimestamp(value)

  if (ts === null) {
    return ''
  }

  const ms = ts - now.value

  if (ms <= 0) {
    return 'soon'
  }

  const seconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}d`
  }

  if (hours > 0) {
    return `${hours}h`
  }

  if (minutes > 0) {
    return `${minutes}m`
  }

  return `${seconds}s`
}

async function loadPostImage(postId: number) {
  if (postImages.value[postId] || loadingImages.has(postId)) return

  loadingImages.add(postId)

  try {
    const response = await apiFetch(`/posts/${postId}/image`)

    if (!response.ok) return

    const blob = await response.blob()

    postImages.value[postId] = URL.createObjectURL(blob)
  } catch (e) {
    console.log(e)
  } finally {
    loadingImages.delete(postId)
  }
}

function fetchAllPreviews(groups: NotificationGroup[]) {
  const seen = new Set<number>()

  groups.forEach((group) => {
    group.notifications.forEach((notification) => {
      if (
        notification.entityType === 'post' &&
        notification.entityId !== null &&
        !seen.has(notification.entityId)
      ) {
        seen.add(notification.entityId)

        loadPostImage(notification.entityId)
      }
    })
  })
}

async function markAsRead(id: number) {
  let target: Notification | undefined

  for (const group of notifications.value) {
    target = group.notifications.find((notification) => notification.id === id)

    if (target) break
  }

  if (!target || target.isRead) return

  const previousReadAt = target.readAt

  target.isRead = true

  target.readAt = new Date().toISOString()

  try {
    const response = await apiFetch(`/notifications/${id}/read`, {
      method: 'PATCH',
    })

    if (!response.ok) {
      throw new Error(`Failed to mark notification ${id} as read`)
    }
  } catch (e) {
    target.isRead = false

    target.readAt = previousReadAt

    console.log(e)
  }
}

async function markAllAsRead() {
  const changed: Notification[] = []

  notifications.value.forEach((group) => {
    group.notifications.forEach((notification) => {
      if (!notification.isRead) {
        changed.push(notification)

        notification.isRead = true

        notification.readAt = new Date().toISOString()
      }
    })
  })

  try {
    const response = await apiFetch('/notifications/read-all', {
      method: 'PATCH',
    })

    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read')
    }
  } catch (e) {
    changed.forEach((notification) => {
      notification.isRead = false

      notification.readAt = null
    })

    console.log(e)
  }
}

function openPost(id: number) {
  modalStore.openedPostId = id

  modalStore.togglePostDialog()

  router.push({ query: { ...route.query, post: String(id) } })
}

function openActorProfile(username: string) {
  router.push({ path: username })
}

onMounted(async () => {
  loading.value = true

  nowInterval = setInterval(() => {
    now.value = Date.now()
  }, 1000)

  try {
    const response = await apiFetch('/notifications')

    if (!response.ok) {
      throw new Error('Failed to load notifications')
    }

    const data: { items?: NotificationGroup[] } = await response.json()

    notifications.value = data.items ?? []

    fetchAllPreviews(notifications.value)
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  if (nowInterval) {
    clearInterval(nowInterval)
  }

  Object.values(postImages.value).forEach((url) => URL.revokeObjectURL(url))
})
</script>

<style scoped lang="scss">
.notifications-page {
  min-height: 100%;

  padding: 0 24px 48px;

  color: var(--text-primary);
}

.notifications-container {
  width: min(720px, 100%);

  margin: 0 auto;

  display: flex;

  flex-direction: column;

  gap: 20px;
}

.notifications-header {
  background: var(--card-bg);

  border: 1px solid var(--card-border);

  border-radius: var(--radius-lg);

  box-shadow: var(--card-shadow);

  padding-top: 20px;

  display: flex;

  flex-direction: column;

  gap: 16px;

  overflow: hidden;
}

.notifications-header__top {
  padding: 0 24px 0 24px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 16px;

  flex-wrap: wrap;
}

.notifications-header__title-group {
  display: flex;

  align-items: center;

  gap: 12px;
}

.notifications-header__title {
  margin: 0;

  font-size: 22px;

  font-weight: 700;

  color: var(--text-primary);

  letter-spacing: -0.01em;
}

.notifications-header__badge {
  display: inline-flex;

  align-items: center;

  justify-content: center;

  min-width: 26px;

  height: 24px;

  padding: 0 8px;

  border-radius: 999px;

  background: var(--accent);

  color: var(--text-on-accent);

  font-size: 12px;

  font-weight: 700;
}

.header-btn {
  display: inline-flex;

  align-items: center;

  gap: 6px;

  height: 38px;

  padding: 0 14px;

  border-radius: var(--radius-sm);

  font: inherit;

  font-size: 13px;

  font-weight: 600;

  cursor: pointer;

  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    opacity 0.2s ease;
}

.header-btn:disabled {
  opacity: 0.5;

  cursor: not-allowed;
}

.header-btn__icon {
  width: 16px;

  height: 16px;
}

.header-btn--ghost {
  background: var(--button-ghost-bg);

  border: none;

  color: var(--button-ghost-text);
}

.header-btn--ghost:hover:not(:disabled) {
  background: var(--button-ghost-bg-hover);

  border-color: var(--button-border-hover);
}

.notifications-tabs {
  display: flex;

  gap: 4px;

  padding: 6px;

  background: var(--bg-surface-secondary);

  border: 1px solid var(--border-muted);

  border-radius: var(--radius-lg);

  width: 100%;

  justify-content: center;
}

.notifications-tab {
  width: 100%;

  display: inline-flex;

  align-items: center;

  justify-content: center;

  gap: 8px;

  height: 34px;

  padding: 0 16px;

  border: none;

  background: transparent;

  border-radius: calc(var(--radius-sm) - 4px);

  font: inherit;

  font-size: 13px;

  font-weight: 600;

  color: var(--text-muted);

  cursor: pointer;

  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.notifications-tab:hover {
  color: var(--text-secondary);
}

.notifications-tab--active {
  background: var(--card-bg);

  color: var(--accent);

  box-shadow: var(--shadow-sm);
}

.notifications-tab__count {
  display: inline-flex;

  align-items: center;

  justify-content: center;

  min-width: 20px;

  height: 18px;

  padding: 0 6px;

  border-radius: 999px;

  background: var(--chip-bg);

  color: var(--chip-text);

  font-size: 11px;

  font-weight: 700;
}

.notifications-tab--active .notifications-tab__count {
  background: var(--accent);

  color: var(--text-on-accent);
}

.notifications-body {
  background: var(--card-bg);

  border-bottom: 1px solid var(--card-border);

  border-radius: var(--radius-lg);

  box-shadow: var(--card-shadow);

  overflow: hidden;
}

.notifications-state {
  min-height: 280px;

  display: flex;

  align-items: center;

  justify-content: center;

  padding: 32px;
}

.notifications-empty {
  display: flex;

  flex-direction: column;

  align-items: center;

  text-align: center;

  max-width: 320px;
}

.notifications-empty__icon-wrap {
  width: 72px;

  height: 72px;

  border-radius: 50%;

  background: var(--accent-soft);

  display: flex;

  align-items: center;

  justify-content: center;

  margin-bottom: 16px;
}

.notifications-empty__icon {
  width: 32px;

  height: 32px;

  color: var(--accent);
}

.notifications-empty__title {
  margin: 0 0 6px;

  font-size: 16px;

  font-weight: 700;

  color: var(--text-primary);
}

.notifications-empty__text {
  margin: 0;

  font-size: 13.5px;

  line-height: 1.5;

  color: var(--text-soft);
}

.notifications-list {
  list-style: none;

  margin: 0;

  padding: 0;

  display: flex;

  flex-direction: column;

  gap: 50px;
}

// .notification-stack__list .notification:last-child {

//   border-radius: var(--radius-lg) var(--radius-lg) 0 0;

// }

.notification {
  position: relative;

  display: flex;

  align-items: center;

  gap: 14px;

  padding: 16px 24px 16px 28px;

  border: 1px solid var(--border-muted);

  transition: background-color 0.2s ease;

  animation: notification-in 0.25s ease both;
}

.notification:last-child {
  // border-bottom: none;

  border-bottom-left-radius: var(--radius-lg);

  border-bottom-right-radius: var(--radius-lg);
}

/* First notification when a stack is expanded */
.notification-group--expanded .notification-stack__list > .notification:first-child {
  border-top-left-radius: var(--radius-lg);
  border-top-right-radius: var(--radius-lg);
}

/* Last notification in the whole list, only if that group is not a stack */
.notifications-list
  > .notification-group:last-child:not(.notification-group--stacked)
  .notification-stack__list
  > .notification:last-child {
  border-top-left-radius: var(--radius-lg);
  border-top-right-radius: var(--radius-lg);
}

/* Обычные уведомления и раскрытая стопка */

.notification-group:not(.notification-group--stacked) .notification:hover,
.notification-group--expanded .notification:hover {
  background: var(--card-bg-hover);
}

/* Закрытая стопка */

.notification-stack--collapsed .notification {
  border-radius: var(--radius-lg);

  overflow: hidden;
}

.notification-stack--collapsed .notification:hover {
  background: var(--card-bg-hover);
}

.notification__unread-dot {
  position: absolute;

  left: 12px;

  top: 50%;

  transform: translateY(-50%);

  width: 8px;

  height: 8px;

  border-radius: 50%;

  background: var(--accent);

  box-shadow: 0 0 0 3px var(--accent-soft);
}

.notification__avatar-wrap {
  position: relative;

  flex-shrink: 0;

  .avatar-img {
    cursor: pointer;
  }
}

.system-img {
  width: 40px;

  height: 40px;
}

.notification__type-badge {
  position: absolute;

  right: -4px;

  bottom: -4px;

  width: 22px;

  height: 22px;

  border-radius: 50%;

  display: flex;

  align-items: center;

  justify-content: center;

  border: 2px solid var(--card-bg);

  background: var(--accent);

  color: #fff;
}

.notification__type-badge--like {
  background: #ef4c6a;
}

.notification__type-badge--comment {
  background: #3b82f6;
}

.notification__type-badge--rating {
  background: #f59e0b;
}

.notification__type-icon {
  width: 12px;

  height: 12px;
}

.notification__body {
  flex: 1;

  min-width: 0;

  display: flex;

  flex-direction: column;

  gap: 4px;
}

.notification__title {
  font-size: 14px;

  font-weight: 700;

  color: var(--text-primary);

  line-height: 1.3;

  margin-bottom: 2px;

  word-break: break-word;
}

.notification__text {
  font-size: 13.5px;

  line-height: 1.4;

  color: var(--text-secondary);

  word-break: break-word;

  display: flex;

  flex-direction: column;

  gap: 5px;
}

.notification__username {
  font-weight: 700;

  color: var(--text-primary);

  margin-right: 4px;
}

.notification__action {
  color: var(--text-secondary);

  &__titleName {
    font-weight: 600;
  }
}

.notification__subtext {
  color: var(--text-muted);

  text-overflow: ellipsis;

  white-space: nowrap;

  overflow: hidden;

  font-size: 12px;
}

.notification__meta {
  display: flex;

  align-items: center;

  gap: 10px;

  flex-wrap: wrap;

  font-size: 12px;

  color: var(--text-soft);

  margin-top: 2px;
}

.notification__time {
  font-weight: 500;
}

.notification__expiry {
  display: inline-flex;

  align-items: center;

  gap: 4px;

  padding: 2px 8px;

  border-radius: 999px;

  background: var(--bg-surface-secondary);

  border: 1px solid var(--border-muted);

  font-size: 11px;

  font-weight: 600;

  color: var(--text-muted);
}

.notification__expiry-icon {
  width: 12px;

  height: 12px;
}

.notification__preview {
  flex-shrink: 0;

  width: 52px;

  height: 52px;

  border-radius: var(--radius-sm);

  overflow: hidden;

  background: var(--image-bg);

  border: 1px solid var(--border-muted);

  position: relative;
}

.notification__preview--loading {
  background: linear-gradient(
    90deg,
    var(--bg-surface-secondary) 0%,

    var(--bg-surface-tertiary) 50%,

    var(--bg-surface-secondary) 100%
  );

  background-size: 200% 100%;

  animation: preview-shimmer 1.4s ease-in-out infinite;
}

.notification__preview-img {
  width: 100%;

  height: 100%;

  object-fit: cover;

  display: block;

  cursor: pointer;
}

@keyframes preview-shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

.notification__actions {
  flex-shrink: 0;

  display: flex;

  align-items: center;
}

.notification__btn {
  width: 36px;

  height: 36px;

  border-radius: 50%;

  border: 1px solid var(--button-border);

  background: var(--button-bg);

  color: var(--button-text);

  display: inline-flex;

  align-items: center;

  justify-content: center;

  cursor: pointer;

  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.15s ease;
}

.notification__btn:hover {
  background: var(--accent);

  border-color: var(--accent);

  color: var(--text-on-accent);

  transform: scale(1.05);
}

.notification__btn-icon {
  width: 16px;

  height: 16px;
}

@keyframes notification-in {
  from {
    opacity: 0;

    transform: translateY(4px);
  }

  to {
    opacity: 1;

    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .notifications-page {
    padding: 16px 12px 32px;
  }

  .notifications-header {
    padding: 16px;
  }

  .notifications-header__title {
    font-size: 20px;
  }

  .header-btn span {
    display: none;
  }

  .header-btn {
    padding: 0 12px;
  }

  .notification {
    padding: 14px 16px 14px 22px;

    gap: 10px;
  }

  .notification__text {
    font-size: 12.5px;
  }

  .notification__preview {
    width: 44px;

    height: 44px;
  }
}

.notification-group {
  position: relative;

  list-style: none;
}

.notification-group:last-child {
  border-bottom: none;

  border-radius: var(--radius-lg);
}

.notification-group__row {
  display: flex;

  flex-direction: column;

  align-items: center;

  gap: 12px;
}

.notification-stack {
  position: relative;

  flex: 1;

  min-width: 0;

  width: 100%;

  isolation: isolate;

  transition: margin-bottom 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.notification-stack::before,
.notification-stack::after {
  content: '';

  position: absolute;

  pointer-events: none;

  background: var(--card-bg);

  border: 1px solid var(--card-border);

  border-radius: var(--radius-lg);

  box-shadow: var(--shadow-sm);

  opacity: 0;

  transform: translateY(-8px) scaleX(0.96);

  transition:
    opacity 0.28s ease,
    transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}

.notification-stack::before {
  z-index: -1;

  left: 12px;

  right: 12px;

  top: 7px;

  bottom: -7px;
}

.notification-stack::after {
  z-index: -2;

  left: 24px;

  right: 24px;

  top: 13px;

  bottom: -13px;
}

.notification-stack--collapsed {
  .notification {
    border-radius: var(--radius-lg);

    background: var(--card-bg);

    overflow: hidden;
  }

  .notification:hover {
    background: var(--card-bg-hover);
  }
}

.notification-stack--collapsed::before {
  opacity: 0.86;

  transform: translateY(0) scaleX(1);
}

.notification-stack--collapsed::after {
  opacity: 0.58;

  transform: translateY(0) scaleX(1);
}

.notification-group--stacked:not(.notification-group--expanded) .notification {
  // border-bottom: none;
}

.notification-stack__list {
  width: 100%;

  display: flex;

  flex-direction: column;
}

.notification-expand-enter-active,
.notification-expand-leave-active {
  overflow: hidden;

  transform-origin: top center;

  transition:
    opacity 0.28s ease,
    transform 0.34s cubic-bezier(0.22, 1, 0.36, 1),
    max-height 0.34s cubic-bezier(0.22, 1, 0.36, 1),
    padding-top 0.34s cubic-bezier(0.22, 1, 0.36, 1),
    padding-bottom 0.34s cubic-bezier(0.22, 1, 0.36, 1);
}

.notification-expand-enter-from {
  opacity: 0;

  transform: translateY(-22px) scale(0.985);

  max-height: 0;

  padding-top: 0;

  padding-bottom: 0;
}

.notification-expand-enter-to {
  opacity: 1;

  transform: translateY(0) scale(1);

  max-height: 800px;
}

.notification-expand-leave-from {
  opacity: 1;

  transform: translateY(0) scale(1);

  max-height: 800px;
}

.notification-expand-leave-to {
  opacity: 0;

  transform: translateY(-22px) scale(0.985);

  max-height: 0;

  padding-top: 0;

  padding-bottom: 0;
}

.notification-expand-move {
  transition: transform 0.34s cubic-bezier(0.22, 1, 0.36, 1);
}

.notification-group--expanded .notification-stack {
  display: flex;

  flex-direction: column;
}

.notification-group--expanded .notification-group__toggle-wrap {
  margin-top: 13px;
}

.notification-group__toggle-wrap {
  flex-shrink: 0;

  display: flex;

  flex-direction: column;

  align-items: center;

  gap: 5px;

  position: absolute;

  bottom: -50px;

  z-index: 1000;
}

.notification-group__toggle {
  width: 34px;

  height: 34px;

  padding: 0;

  border-radius: 50%;

  border: 1px solid var(--button-border);

  background: var(--button-bg);

  color: var(--button-text);

  display: inline-flex;

  align-items: center;

  justify-content: center;

  cursor: pointer;

  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.15s ease;
}

.notification-group__toggle:hover {
  background: var(--accent);

  border-color: var(--accent);

  color: var(--text-on-accent);

  transform: scale(1.05);
}

.notification-group__toggle svg {
  width: 17px;

  height: 17px;

  transition: transform 0.25s ease;
}

.notification-group__toggle--expanded svg {
  transform: rotate(180deg);
}

.notification-group__count {
  min-width: 22px;

  height: 18px;

  padding: 0 6px;

  border-radius: 999px;

  background: var(--chip-bg);

  color: var(--chip-text);

  display: inline-flex;

  align-items: center;

  justify-content: center;

  font-size: 10px;

  font-weight: 700;
}

.notification__type-badge--rate {
  background: #f59e0b;
}

@media (max-width: 640px) {
  .notification-group__row {
    gap: 8px;

    padding-right: 8px;
  }

  .notification-group__toggle {
    width: 30px;

    height: 30px;
  }

  .notification-stack--collapsed::before {
    left: 8px;

    right: 8px;
  }

  .notification-stack--collapsed::after {
    left: 16px;

    right: 16px;
  }
}
</style>
