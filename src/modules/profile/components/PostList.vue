<template>
  <div class="post-list">
    <PostCard v-for="post in posts" :key="post.id" :post="post" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import PostCard from './PostCard.vue'
import { apiFetch } from '@/api/apiFetch'
import type { Post } from '@/types/post'
import { getUserPosts } from '@/api/apiData'

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
})

const emits = defineEmits(['postsQuantity'])
const posts = ref<Array<Post> | null>([])

watch(
  () => props.username,
  async (newVal) => {
    if (newVal) {
      posts.value = await getUserPosts(newVal)
      if (posts.value) emits('postsQuantity', posts.value.length)
    }
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.post-list {
  display: flex;
  gap: 10px;
}
</style>
