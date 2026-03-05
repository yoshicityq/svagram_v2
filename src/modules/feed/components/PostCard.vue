<template>
  <div class="post-card">
    <div class="header">
      <UserProfile :username="post.user" :closable="false" />
    </div>
    <div class="body">
      <div class="post-image">
        <img class="image" :src="`http://localhost:3000${post.imageUrl}`" alt="post image" />
      </div>
      <div class="brands-container">
        <div class="brand">
          <HatIcon />
          <span>{{ post.brand_h }}</span>
        </div>
        <div class="brand">
          <JacketIcon />
          <span>{{ post.brand_tt }}</span>
        </div>
        <div class="brand">
          <TshirtIcon />
          <span>{{ post.brand_t }}</span>
        </div>
        <div class="brand">
          <PantsIcon />
          <span>{{ post.brand_b }}</span>
        </div>
        <div class="brand">
          <ShoesIcon />
          <span>{{ post.brand_s }}</span>
        </div>
      </div>
    </div>
    <div class="footer">
      <EstimatePost :post-id="post.id" :is-clickable="true" />
      <div class="post-description">
        <span>{{ post.description }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import HatIcon from '@/assets/icons/HatIcon.vue'
import JacketIcon from '@/assets/icons/JacketIcon.vue'
import PantsIcon from '@/assets/icons/PantsIcon.vue'
import ShoesIcon from '@/assets/icons/ShoesIcon.vue'
import TshirtIcon from '@/assets/icons/TshirtIcon.vue'
import EstimatePost from '@/components/EstimatePost.vue'
import UserProfile from '@/components/UserProfile.vue'

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
  post: {
    type: Object as () => Post,
    required: true,
  },
})
</script>

<style scoped lang="scss">
.post-card {
  width: 700px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
}
.header {
  padding: 10px 5px;
}
.body {
  .post-image {
    width: 700px;
    border-radius: 8px;
    overflow: hidden;
  }
  .image {
    display: block;
    width: 700px;
    object-fit: contain;
  }
}
.brand {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 14px;
}
.brands-container {
  display: flex;
  gap: 20px;
  padding: 5px 8px;
  margin-top: 10px;
}
.post-description {
  font-size: 14px;
  padding: 5px 8px;
}
</style>
