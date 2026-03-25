<template>
  <div class="main-sidebar" :class="{ closed: !sidebarStore.isOpen }">
    <div class="header">
      <StarIcon />
      <span v-show="sidebarStore.isOpen">SWAGRAM</span>
    </div>
    <div class="body">
      <div v-show="!sidebarStore.isSearchActive" class="body_buttons">
        <MyButton
          :is-sidebar-opened="sidebarStore.isOpen"
          :icon="SearchIcon"
          color="primary"
          @click="sidebarStore.toggleSearch"
          >{{ $t('buttons.search') }}</MyButton
        >
        <MyButton
          :is-sidebar-opened="sidebarStore.isOpen"
          :icon="FeedIcon"
          @click="router.push('/feed')"
          color="primary"
          >{{ $t('buttons.feed') }}</MyButton
        >
        <MyButton
          :is-sidebar-opened="sidebarStore.isOpen"
          :icon="SettingsIcon"
          @click="router.push('/settings')"
          color="primary"
          >{{ $t('buttons.settings') }}</MyButton
        >
      </div>
      <SearchDialog />
      <!-- <MyButton
        :is-sidebar-opened="sidebarStore.isOpen"
        :icon="NotificationsIcon"
        @click="router.push('/notifications')"
        >Notifications</MyButton
      > -->
    </div>
    <div v-show="!sidebarStore.isSearchActive" class="footer">
      <UserProfile :username="username" :closable="true" />
      <MyButton
        :icon="LogoutIcon"
        :is-sidebar-opened="sidebarStore.isOpen"
        @click="logout"
        color="primary"
        >{{ $t('buttons.logout') }}</MyButton
      >
      <MyButton
        :is-sidebar-opened="sidebarStore.isOpen"
        :icon="CloseSbIcon"
        @click="sidebarStore.toggleSidebar()"
        color="primary"
      >
        {{ $t('buttons.closeSb') }}
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
import SearchDialog from './SearchDialog.vue'

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
  .body_buttons {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 15px;
  }
}
.footer {
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100%;
}
</style>
