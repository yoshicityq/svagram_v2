<template>
  <div class="wrapper" :class="{ loading: loading }">
    <MyLoader v-if="loading" />
    <div v-else class="post-list">
      <PostCard v-for="post in posts" :key="post.id" :post="post" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import PostCard from './PostCard.vue'
import { apiFetch } from '@/api/apiFetch'
import type { Post } from '@/types/post'
import { getUserPosts } from '@/api/apiData'
import MyLoader from '@/components/MyLoader.vue'

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
})
const loading = ref(false)
const emits = defineEmits(['postsQuantity'])
const posts = ref<Array<Post> | null>([])

watch(
  () => props.username,
  async (newVal) => {
    if (newVal) {
      loading.value = true
      try {
        posts.value = await getUserPosts(newVal)
        if (posts.value) emits('postsQuantity', posts.value.length)
      } catch (e) {
        console.log(e)
      } finally {
        loading.value = false
      }
    }
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.post-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
}
.loading {
  display: flex;
  height: 50vh;
  align-items: center;
  justify-content: center;
}
</style>
