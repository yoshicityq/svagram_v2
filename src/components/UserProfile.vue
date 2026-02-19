<template>
  <div class="user-profile">
    <div class="user-info">
      <div
        class="user-img"
        @click="router.push({ name: 'Profile', params: { username: username } })"
      >
        <img :src="userAvatar" class="avatar" />
      </div>
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
import useAuthStore from '@/stores/auth'
import useSidebarStore from '@/stores/sidebar'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Avatar from '@/assets/images/no_avatar.png'
import { getProfileImg } from '@/api/apiData'

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
const authStore = useAuthStore()

const router = useRouter()

const previewUrl = ref<string | null>(null)
const userAvatar = computed(() => {
  return String(previewUrl.value ? previewUrl.value : Avatar)
})

onMounted(async () => {
  previewUrl.value = await getProfileImg(localStorage.getItem('user')!)
})
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
.avatar {
  position: absolute;
  width: 40px;
  height: 40px;
  right: 0;
  bottom: 0;
  top: 5px;
}
.user-nickname {
  cursor: pointer;
  font-weight: 600;
}
</style>
