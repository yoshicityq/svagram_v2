<template>
  <div class="post-list">
    <PostCard v-for="post in posts" :key="post.id" :post="post" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PostCard from './PostCard.vue'
import { apiFetch } from '@/api/apiFetch'

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

const props = defineProps({
  user: {
    type: String,
    required: true,
  },
})
const emits = defineEmits(['postsQuantity'])
const posts = ref<Array<Post>>([])

async function getPosts() {
  const response = await apiFetch(`/users/${props.user}/posts`)
  const data = await response.json()
  posts.value = data.posts
  emits('postsQuantity', posts.value.length)
}
onMounted(() => {
  getPosts()
})
</script>

<style scoped lang="scss">
.post-list {
  display: flex;
  gap: 10px;
}
</style>
