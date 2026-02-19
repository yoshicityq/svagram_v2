<template>
  <div
    class="post-card"
    @click="giveId()"
    @mouseover="isStatsVisible = true"
    @mouseleave="isStatsVisible = false"
  >
    <div>
      <img class="image" :src="`http://localhost:3000${post.imageUrl}`" alt="" />
    </div>
    <div v-show="isStatsVisible" class="post-card_stats">
      <EstimatePost :post-id="post.id" :is-clickable="false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import EstimatePost from '@/components/EstimatePost.vue'
import useModalStore from '@/stores/modals'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

type Post = {
  id: number
  user: string
  description: string
  img: string
  img_mimetype: string
  brand_h: string
  brand_tt: string
  brand_t: string
  brand_b: string
  brand_s: string
  imageUrl: string
}
const modalStore = useModalStore()
const props = defineProps({
  post: {
    type: Object as () => Post,
    required: true,
  },
})
const route = useRoute()
const router = useRouter()
const giveId = () => {
  modalStore.openedPostId = props.post.id
  modalStore.togglePostDialog()
  router.push({ query: { ...route.query, post: String(props.post.id) } })
}
const isStatsVisible = ref(false)
</script>

<style scoped lang="scss">
.post-card {
  width: 300px;
  height: 300px;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
}
.image {
  width: 300px;
  height: 300px;
  object-fit: cover;
}
.post-card_stats {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.531);
  color: white;
}
</style>
