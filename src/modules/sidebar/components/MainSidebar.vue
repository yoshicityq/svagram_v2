<template>
  <div class="main-sidebar" :class="{ closed: !sidebarStore.isOpen }">
    <div class="header">
      <StarIcon />
      <span v-show="sidebarStore.isOpen">SWAGRAM</span>
    </div>
    <div class="body">
      <MyButton :is-sidebar-opened="sidebarStore.isOpen" :icon="SearchIcon" color="primary"
        >Search</MyButton
      >
      <MyButton
        :is-sidebar-opened="sidebarStore.isOpen"
        :icon="FeedIcon"
        @click="router.push('/feed')"
        color="primary"
        >Feed</MyButton
      >
      <!-- <MyButton
        :is-sidebar-opened="sidebarStore.isOpen"
        :icon="NotificationsIcon"
        @click="router.push('/notifications')"
        >Notifications</MyButton
      > -->
      <!-- <MyButton
        :is-sidebar-opened="sidebarStore.isOpen"
        :icon="SettingsIcon"
        @click="router.push('/settings')"
        >Settings</MyButton
      > -->
    </div>
    <div class="footer">
      <UserProfile :username="username" :closable="true" />
      <MyButton
        :icon="LogoutIcon"
        :is-sidebar-opened="sidebarStore.isOpen"
        @click="logout"
        color="primary"
        >Logout</MyButton
      >
      <MyButton
        :is-sidebar-opened="sidebarStore.isOpen"
        :icon="CloseSbIcon"
        @click="sidebarStore.toggleSidebar()"
        color="primary"
      >
        Close SB
      </MyButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import CloseSbIcon from '@/assets/icons/CloseSbIcon.vue'
import FeedIcon from '@/assets/icons/FeedIcon.vue'
import NotificationsIcon from '@/assets/icons/NotificationsIcon.vue'
import SearchIcon from '@/assets/icons/SearchIcon.vue'
import SettingsIcon from '@/assets/icons/SettingsIcon.vue'
import MyButton from '@/components/UI/MyButton.vue'
import { computed } from 'vue'
import useSidebarStore from '@/stores/sidebar'
import StarIcon from '@/assets/icons/StarIcon.vue'
import { useRouter } from 'vue-router'
import useAuthStore from '@/stores/auth'
import UserProfile from '@/components/UserProfile.vue'
import LogoutIcon from '@/assets/icons/LogoutIcon.vue'
import { logoutUser } from '../api/actions'

const sidebarStore = useSidebarStore()
const authStore = useAuthStore()
const router = useRouter()
const username = computed(() => authStore.user?.username as string)

async function logout() {
  const response = await logoutUser()
  if (response) {
    router.push('/auth')
  }
}
</script>

<style scoped lang="scss">
.main-sidebar {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  border-right: 1px solid blueviolet;
  height: 100%;
  width: 200px;
  padding: 10px 20px;
  align-items: center;
  overflow: hidden;

  transition:
    width 0.4s ease,
    padding 0.4s ease;
}

.main-sidebar.closed {
  width: 75px;
  padding: 10px 10px;
}

.header {
  font-size: 27px;
  font-weight: bold;
  display: flex;
  gap: 5px;
  align-items: center;
}
.body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
  width: 100%;
}
.footer {
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100%;
}
</style>
