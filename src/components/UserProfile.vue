<template>
  <div class="user-profile">
    <div class="user-info">
      <MyAvatar
        :username="username"
        size="small"
        @click="router.push({ name: 'Profile', params: { username: username } })"
        class="user-info_avatar"
      />
      <span
        v-show="isClosable"
        class="user-nickname"
        @click="router.push({ name: 'Profile', params: { username: username } })"
        >{{ username }}</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import useSidebarStore from '@/stores/sidebar'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import MyAvatar from './MyAvatar.vue'

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
  closable: {
    type: Boolean,
    default: false,
  },
})
const isClosable = computed(() => {
  return props.closable ? (sidebarStore.isOpen ? true : false) : true
})
const sidebarStore = useSidebarStore()

const router = useRouter()
</script>

<style scoped lang="scss">
.user-profile {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  &_avatar {
    cursor: pointer;
  }
}

.user-img {
  width: 40px;
  height: 40px;
  cursor: pointer;
  background-color: blueviolet;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
}

.user-nickname {
  cursor: pointer;
  font-weight: 600;
}
</style>
