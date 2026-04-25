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
import { ref, type Component } from 'vue'
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

/* ── Pins ── */
.image-editor__pin {
  position: absolute;
  z-index: 10;
  transform: translate(-50%, -50%);
  cursor: default;
}

.pin-dot {
  display: block;
  width: 12px;
  height: 12px;
  background: var(--accent);
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  transition: transform 0.15s ease;
}

.image-editor__pin:hover .pin-dot {
  transform: scale(1.3);
}

.pin-label {
  position: absolute;
  left: calc(100% + 6px);
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 4px;
  padding: 2px 6px;
  background: var(--bg-overlay);
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  pointer-events: none;
  align-items: center;
}

.pin-label__category {
  color: rgba(255, 255, 255, 0.65);
}
.pin-label__icon {
  width: 17px;
}
.pin-label__brand {
  color: #fff;
  font-weight: 600;
}
</style>
