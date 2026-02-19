<template>
  <div class="post-list">
    <PostCard v-for="post in posts" :key="post.id" :post="post" />
  </div>
</template>

<script setup lang="ts">
import { apiFetch } from '@/api/apiFetch'
import { onMounted, ref } from 'vue'
import PostCard from './PostCard.vue'

const posts = ref<Array<Post>>([])
type Post = {
  id: number
  user: string
  description: string
  img: string
  img_mimetype: string
  likes: number
  people_liked: string
  brand_h: string
  brand_tt: string
  brand_t: string
  brand_b: string
  brand_s: string
  imageUrl: string
}

async function getPosts() {
  const response = await apiFetch('/posts?limit=20&offset=0', {
    method: 'GET',
  })
  const data = await response.json()
  posts.value = data.posts
  console.log(data)
}
onMounted(() => {
  getPosts()
})
</script>

<style scoped lang="scss">
.post-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
}
</style>
