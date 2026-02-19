<template>
  <div class="profile-view">
    <div class="header">
      <div class="user-info-block">
        <div class="user-img">
          <img class="avatar" :src="userAvatar" alt="" />
        </div>
        <div class="user-info">
          <span class="username">{{ username }}</span>
          <span>{{ postsQuantity }} posts</span>
          <span v-if="userData?.city">City: {{ userData?.city }}</span>
          <span v-if="userData?.description">Description: {{ userData?.description }}</span>
          <!-- <span>Favorite brands:</span> -->
        </div>
      </div>
      <div class="actions-block">
        <MyButton @click="modalStore.toggleCreateDialog()">Create Post</MyButton>
        <MyButton @click="router.push({ name: 'edit' })">Edit Profile</MyButton>
      </div>
    </div>
    <div class="body">
      <PostList :user="username" @posts-quantity="getLength" />
    </div>
  </div>
  <CreatePostDialog />
  <OpenPostDialog />
</template>

<script setup lang="ts">
import MyButton from '@/components/UI/MyButton.vue'
import { useRoute, useRouter } from 'vue-router'
import useModalStore from '@/stores/modals'
import PostList from '../components/PostList.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { apiFetch } from '@/api/apiFetch'
import CreatePostDialog from '../components/CreatePostDialog.vue'
import OpenPostDialog from '../components/OpenPostDialog.vue'
import noAvatar from '@/assets/images/no_avatar.png'
import BrandSelect from '@/components/BrandSelect.vue'

const route = useRoute()
const router = useRouter()
const username = route.params.username as string

type User = {
  id: string | number
  username: string
  city: string
  description: string
  hasAvatar: string
  avatarUrl: string
}
const userData = ref<User>()
let selectedBrand = ref('')

const userAvatar = computed(() =>
  userData.value?.hasAvatar ? `http://localhost:3000${userData.value.avatarUrl}` : noAvatar,
)
const modalStore = useModalStore()
async function getProfileData() {
  const response = await apiFetch(`/users/${username}`)
  const data = await response.json()
  userData.value = data.user
}
const postsQuantity = ref(0)
const getLength = (data: number) => (postsQuantity.value = data)
watch(
  () => route.query.post,
  (post) => {
    if (post) {
      const id = Number(post)
      if (Number.isFinite(id)) {
        modalStore.openedPostId = id
        modalStore.isPostDialogOpen = true
      } else {
        const { post, ...rest } = route.query
        router.replace({ query: rest })
      }
    } else {
      modalStore.isPostDialogOpen = false
      modalStore.openedPostId = null
    }
  },
  { immediate: true },
)

onMounted(() => {
  getProfileData()
})
</script>

<style scoped lang="scss">
.profile-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.header {
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: center;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 20px;
}

.user-info-block {
  display: flex;
  gap: 20px;
  align-items: flex-end;
}
.user-img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: blueviolet;
  overflow: hidden;
  position: relative;
}
.avatar {
  width: 150px;
  background: transparent;
  position: absolute;
  top: 20px;
  left: 2px;
  right: 0;
  bottom: 0;
}
.user-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 18px;
  .username {
    font-size: 28px;
    font-weight: 600;
  }
}
.actions-block {
  display: flex;
  gap: 10px;
}
</style>
