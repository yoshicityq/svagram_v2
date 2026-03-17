<template>
  <div class="profile-view">
    <div class="header">
      <div class="user-info-block">
        <MyAvatar :username="username" size="large" />
        <div class="user-info">
          <span class="username">{{ username }}</span>
          <span>{{ postsQuantity }} posts</span>
          <span v-if="userData?.city">City: {{ userData?.city }}</span>
          <span v-if="userData?.description">Description: {{ userData?.description }}</span>
          <span v-if="userData?.favorite_brands"
            >Favorite brands: {{ userData.favorite_brands }}</span
          >
        </div>
      </div>
      <div v-if="authStore.user?.username === username" class="actions-block">
        <MyButton @click="modalStore.toggleCreateDialog()">Create Post</MyButton>
        <MyButton @click="router.push({ name: 'edit' })">Edit Profile</MyButton>
      </div>
    </div>
    <div class="body">
      <PostList :username="username" @posts-quantity="getLength" />
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
import { computed, onBeforeMount, onMounted, ref, watch } from 'vue'
import { apiFetch } from '@/api/apiFetch'
import CreatePostDialog from '../components/CreatePostDialog.vue'
import OpenPostDialog from '../components/OpenPostDialog.vue'
import noAvatar from '@/assets/images/no_avatar.png'
import BrandSelect from '@/components/BrandSelect.vue'
import MyAvatar from '@/components/MyAvatar.vue'
import { getProfileData } from '@/api/apiData'
import type { User } from '@/types/user'
import useAuthStore from '@/stores/auth'

const modalStore = useModalStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const username = ref(route.params.username as string)

const userData = ref<User | null>()

const postsQuantity = ref(0)
const getLength = (data: number) => (postsQuantity.value = data)

watch(
  () => route.query.post,
  (newPost) => {
    if (newPost) {
      const id = Number(newPost)
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
watch(
  () => route.params.username,
  async (newVal) => {
    userData.value = await getProfileData(newVal as string)
    username.value = newVal as string
  },
  { immediate: true },
)
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
