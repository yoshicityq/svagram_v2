<template>
  <div
    class="post-card"
    role="button"
    tabindex="0"
    @click="openPost"
    @keydown.enter="openPost"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @focus="isHovered = true"
    @blur="isHovered = false"
  >
    <img
      class="post-card__image"
      :src="`${baseUrl}${post.imageUrl}`"
      :alt="post.description || $t('postCard.image_alt')"
      loading="lazy"
      @load="isImageLoaded = true"
    />

    <!-- Shimmer placeholder while image loads -->
    <div v-if="!isImageLoaded" class="post-card__placeholder" />

    <!-- Stats overlay -->
    <Transition name="overlay-fade">
      <div v-show="isHovered" class="post-card__overlay">
        <EstimatePost :post-id="post.id" :is-clickable="false" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import EstimatePost from '@/components/EstimatePost.vue'
import useModalStore from '@/stores/modals'
import type { Post } from '@/types/post'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const modalStore = useModalStore()
const route = useRoute()
const router = useRouter()

const props = defineProps<{
  post: Post
}>()

const isHovered = ref(false)
const isImageLoaded = ref(false)

function openPost() {
  modalStore.openedPostId = props.post.id
  modalStore.togglePostDialog()
  router.push({ query: { ...route.query, post: String(props.post.id) } })
}
</script>

<style scoped lang="scss">
.post-card {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-sm, 6px);
  overflow: hidden;
  cursor: pointer;
  background: var(--input-bg, #f3f4f6);
  outline: none;

  &:focus-visible {
    box-shadow: var(--focus-ring, 0 0 0 3px rgba(59, 130, 246, 0.4));
  }
}

/* ── Image ── */

.post-card__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.post-card:hover .post-card__image,
.post-card:focus-visible .post-card__image {
  transform: scale(1.04);
}

/* ── Loading placeholder ── */

.post-card__placeholder {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    var(--input-bg, #f3f4f6) 25%,
    var(--input-bg-hover, #e5e7eb) 50%,
    var(--input-bg, #f3f4f6) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* ── Stats overlay ── */

.post-card__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.2s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}
</style>
