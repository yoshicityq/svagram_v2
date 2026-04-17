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
            color="transparent"
          >
            {{ $t('buttons.search') }}
          </MyButton>

          <MyButton
            :is-sidebar-opened="sidebarStore.isOpen"
            :icon="FeedIcon"
            @click="router.push('/feed')"
            color="transparent"
          >
            {{ $t('buttons.feed') }}
          </MyButton>
          <MyButton
            :is-sidebar-opened="sidebarStore.isOpen"
            :icon="NotificationsIcon"
            @click="router.push('/notifications')"
            color="transparent"
          >
            <div class="notifications-btn-content">
              {{ $t('buttons.notifications') }}
            </div>
            <template v-if="sidebarStore.unreadCount > 0" #chip>
              {{ sidebarStore.unreadCount }}
            </template>
          </MyButton>
          <MyButton
            :is-sidebar-opened="sidebarStore.isOpen"
            :icon="SettingsIcon"
            color="transparent"
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

import CloseSbIcon from '@/assets/icons/sidebar/CloseSbIcon.vue'
import FeedIcon from '@/assets/icons/sidebar/FeedIcon.vue'
import SearchIcon from '@/assets/icons/sidebar/SearchIcon.vue'
import SettingsIcon from '@/assets/icons/sidebar/SettingsIcon.vue'
import LogoutIcon from '@/assets/icons/sidebar/LogoutIcon.vue'
import LogoIcon from '@/assets/icons/LogoIcon.vue'

import MyButton from '@/components/UI/MyButton.vue'
import UserProfile from '@/components/UserProfile.vue'
import SearchDialog from './SearchDialog.vue'

import useSidebarStore from '@/stores/sidebar'
import useAuthStore from '@/stores/auth'
import { logoutUser } from '../api/actions'
import NotificationsIcon from '@/assets/icons/sidebar/NotificationsIcon.vue'
import { apiFetch } from '@/api/apiFetch'
import { closeWs } from '@/services/ws'

const sidebarStore = useSidebarStore()
const authStore = useAuthStore()
const router = useRouter()

const username = computed(() => authStore.user?.username as string)

async function logout() {
  try {
    const response = await logoutUser()
    closeWs()
    if (response) {
      router.push('/auth')
    }
  } catch (e) {
    console.log(e)
  }
}

onMounted(async () => await sidebarStore.getUnreadCount())
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
  width: 100px;
  padding: 16px 10px;
}

.main-sidebar {
  height: 100%;
  min-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
  border: 0.5px solid var(--sidebar-border);
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
