<template>
  <label v-if="props.username" class="avatar" :class="avatarSize">
    <img class="avatar-img" :src="userAvatar" :class="{ preview: previewAvatar }" alt="" />
  </label>
</template>

<script setup lang="ts">
import { apiFetch } from '@/api/apiFetch'
import useAuthStore from '@/stores/auth'
import { computed, onBeforeMount, onMounted, ref, watch } from 'vue'
import noAvatar from '@/assets/images/no_avatar.png'
type User = {
  id: string | number
  username: string
  city: string
  description: string
  hasAvatar: boolean
  avatarUrl: string
  favorite_brands: string
}
const props = defineProps({
  username: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: 'medium',
  },
})
const userData = ref<User | null>(null)

const avatarSize = computed(() => {
  if (props.size === 'small') return 'avatar__small'
  if (props.size === 'medium') return 'avatar__medium'
  if (props.size === 'large') return 'avatar__large'
})
async function getProfileData() {
  const response = await apiFetch(`/users/${props.username}`)
  const data = await response.json()
  userData.value = data.user
}
watch(
  () => props.username,
  async (newVal) => {
    if (newVal) {
      await getProfileImg()
      await getProfileData()
    }
  },
  { immediate: true },
)

const previewAvatar = ref<string | null>(null)

const userAvatar = computed(() => {
  if (!previewAvatar.value) {
    if (userData.value?.hasAvatar) {
      return `http://localhost:3000${userData.value.avatarUrl}`
    }
    return noAvatar
  }
  return previewAvatar.value
})

async function getProfileImg() {
  const res = await apiFetch(`/users/${props.username}/avatar`)
  if (!res.ok) {
    previewAvatar.value = null
  } else {
    const blob = await res.blob()
    previewAvatar.value = URL.createObjectURL(blob)
    console.log(previewAvatar.value)
  }
}
</script>

<style scoped lang="scss">
.avatar {
  border: 1px solid #ccc;
  border-radius: 50%;
  overflow: hidden;
  background-color: blueviolet;
  position: relative;

  .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;

    top: 15%;

    right: 0;
    bottom: 0;
  }
}
.preview {
  top: 0 !important;
  left: 0 !important;
}
.avatar__small {
  width: 40px;
  height: 40px;
}
.avatar__medium {
  width: 80px;
  height: 80px;
}
.avatar__large {
  width: 200px;
  height: 200px;
}
</style>
