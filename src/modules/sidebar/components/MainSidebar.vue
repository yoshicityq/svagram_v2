<template>
  <aside class="sidebar-wrapper" :class="{ closed: !sidebarStore.isOpen }">
    <div class="main-sidebar" :class="{ closed: !sidebarStore.isOpen }">
      <div class="header">
        <div class="brand">
          <LogoIcon class="brand-logo" />
          <span v-show="sidebarStore.isOpen" class="brand-title">SWAGRAM</span>
        </div>
      </div>

      <div class="body">
        <div v-show="!sidebarStore.isSearchActive" class="body-buttons">
          <MyButton
            :is-sidebar-opened="sidebarStore.isOpen"
            :icon="SearchIcon"
            @click="sidebarStore.toggleSearch"
          >
            {{ $t('buttons.search') }}
          </MyButton>

          <MyButton
            :is-sidebar-opened="sidebarStore.isOpen"
            :icon="FeedIcon"
            @click="router.push('/feed')"
          >
            {{ $t('buttons.feed') }}
          </MyButton>
          <MyButton
            :is-sidebar-opened="sidebarStore.isOpen"
            :icon="NotificationsIcon"
            @click="router.push('/notifications')"
          >
            <div class="notifications-btn-content">
              {{ $t('buttons.notifications') }}
              <div v-if="unreadCount > 0" class="notifications__count">
                {{ unreadCount }}
              </div>
            </div>
          </MyButton>
          <MyButton
            :is-sidebar-opened="sidebarStore.isOpen"
            :icon="SettingsIcon"
            @click="router.push('/settings')"
          >
            {{ $t('buttons.settings') }}
          </MyButton>
        </div>

        <SearchDialog />
      </div>

      <div v-show="!sidebarStore.isSearchActive" class="footer">
        <div class="profile-block">
          <UserProfile :username="username" :closable="true" />
        </div>

        <div class="footer-actions">
          <MyButton
            :icon="LogoutIcon"
            :is-sidebar-opened="sidebarStore.isOpen"
            @click="logout"
            color="transparent"
          >
            {{ $t('buttons.logout') }}
          </MyButton>

          <MyButton
            :is-sidebar-opened="sidebarStore.isOpen"
            :icon="CloseSbIcon"
            @click="sidebarStore.toggleSidebar()"
            color="transparent"
            class="sidebar-toggle-btn"
          >
            {{ $t('buttons.closeSb') }}
          </MyButton>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import CloseSbIcon from '@/assets/icons/CloseSbIcon.vue'
import FeedIcon from '@/assets/icons/FeedIcon.vue'
import SearchIcon from '@/assets/icons/SearchIcon.vue'
import SettingsIcon from '@/assets/icons/SettingsIcon.vue'
import LogoutIcon from '@/assets/icons/LogoutIcon.vue'
import LogoIcon from '@/assets/icons/LogoIcon.vue'

import MyButton from '@/components/UI/MyButton.vue'
import UserProfile from '@/components/UserProfile.vue'
import SearchDialog from './SearchDialog.vue'

import useSidebarStore from '@/stores/sidebar'
import useAuthStore from '@/stores/auth'
import { logoutUser } from '../api/actions'
import NotificationsIcon from '@/assets/icons/NotificationsIcon.vue'
import { apiFetch } from '@/api/apiFetch'

const sidebarStore = useSidebarStore()
const authStore = useAuthStore()
const router = useRouter()

const username = computed(() => authStore.user?.username as string)

async function logout() {
  try {
    const response = await logoutUser()
    if (response) {
      router.push('/auth')
    }
  } catch (e) {
    console.log(e)
  }
}
const unreadCount = ref(0)
async function getUnreadCount() {
  const response = await apiFetch('/notifications/unread-count')
  const data = await response.json()
  unreadCount.value = data.unreadCount
}

onMounted(() => getUnreadCount())
</script>

<style scoped lang="scss">
.sidebar-wrapper {
  width: 280px;
  padding: 16px;
  flex-shrink: 0;
  transition:
    width 0.25s ease,
    padding 0.25s ease;
}

.sidebar-wrapper.closed {
  width: 96px;
  padding: 16px 10px;
}

.main-sidebar {
  height: 100%;
  min-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
  border: 1px solid var(--sidebar-border);
  border-radius: var(--radius-xl);
  background: var(--sidebar-bg);
  box-shadow: var(--card-shadow);
  overflow: hidden;
  transition:
    padding 0.25s ease,
    border-radius 0.25s ease;
}

.main-sidebar.closed {
  padding: 14px 10px;
}

.header {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
}

.brand {
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 6px;
}

.brand-logo {
  flex-shrink: 0;
}

.brand-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--icon-primary);
  white-space: nowrap;
}

.body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.body-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}
.notifications-btn-content {
  position: relative;
  .notifications__count {
    width: 20px;
    height: 20px;
    position: absolute;
    font-size: 11px;
    background-color: var(--accent);
    border: 1px solid var(--border-primary);
    border-radius: 50%;
    top: -4px;
    right: -20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.footer {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--border-muted);
}

.profile-block {
  width: 100%;
  min-width: 0;
  display: flex;
  justify-content: center;
}

.footer-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.closed .brand {
  justify-content: center;
  padding: 0;
}

.closed .footer {
  align-items: center;
}

.closed .profile-block,
.closed .footer-actions,
.closed .body-buttons {
  align-items: center;
}

@media (max-width: 900px) {
  .sidebar-wrapper {
    width: 100%;
    padding: 12px;
  }

  .sidebar-wrapper.closed {
    width: 100%;
    padding: 12px;
  }

  .main-sidebar {
    min-height: auto;
  }

  .main-sidebar.closed {
    padding: 14px 12px;
  }

  .closed .brand,
  .closed .footer,
  .closed .profile-block,
  .closed .footer-actions,
  .closed .body-buttons {
    align-items: stretch;
    justify-content: flex-start;
  }
}
.sidebar-toggle-btn :deep(.my-button__icon) {
  transition: transform 0.3s ease;
}

.sidebar-wrapper.closed .sidebar-toggle-btn :deep(.my-button__icon) {
  transform: rotate(180deg);
}
</style>
