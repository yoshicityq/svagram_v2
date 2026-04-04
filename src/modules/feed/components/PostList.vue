<template>
  <div class="wrapper" :class="{ loading: loading }">
    <MyLoader v-if="loading" />
    <div v-else class="post-list">
      <PostCard v-for="post in posts" :key="post.id" :post="post" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { apiFetch } from '@/api/apiFetch'
import { onMounted, ref } from 'vue'
import PostCard from './PostCard.vue'
import MyLoader from '@/components/MyLoader.vue'
import type { Post } from '@/types/post'

const posts = ref<Array<Post>>([])
const loading = ref(false)

async function getPosts() {
  loading.value = true
  try {
    const response = await apiFetch('/posts?limit=20&offset=0', {
      method: 'GET',
    })
    if (!response.ok) {
      throw new Error('Failed to fetch posts')
    }
    const data = await response.json()
    posts.value = data.posts
    console.log(posts.value)
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getPosts()
})
</script>

<style scoped lang="scss">
.wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.loading {
  height: 100vh;
  overflow-y: hidden;
}
.post-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  width: 100%;
}
</style>
