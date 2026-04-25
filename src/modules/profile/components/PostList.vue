<template>
  <div class="wrapper" :class="{ 'wrapper--loading': loading }">
    <!-- Loading -->
    <MyLoader v-if="loading" />

    <!-- Error -->
    <div v-else-if="hasError" class="empty-state">
      <svg
        class="empty-state-icon"
        width="44"
        height="44"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p class="empty-state-title">{{ $t('postList.error_title') }}</p>
      <p class="empty-state-text">{{ $t('postList.error_hint') }}</p>
      <button class="retry-btn" @click="fetchPosts">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
        </svg>
        {{ $t('buttons.retry') }}
      </button>
    </div>

    <!-- Empty -->
    <div v-else-if="!profileStore.userPosts" class="empty-state">
      <svg
        class="empty-state-icon"
        width="44"
        height="44"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>

      <p class="empty-state-title">{{ $t('title.empty_posts_list_title') }}</p>
      <p class="empty-state-text">
        {{
          listType === ''
            ? $t('description.empty_posts_list_description')
            : listType === 'liked'
              ? $t('description.empty_liked_list_description')
              : $t('description.empty_rated_list_description')
        }}
      </p>
    </div>

    <!-- Posts grid -->
    <TransitionGroup v-else name="post-fade" tag="div" class="post-list">
      <PostCard
        v-for="(post, index) in profileStore.userPosts"
        :key="post.id"
        :post="post"
        :style="{ animationDelay: `${index * 40}ms` }"
        class="post-card-enter"
      />
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import PostCard from './PostCard.vue'
import type { Post } from '@/types/post'
import { getUserLikedPosts, getUserPosts, getUserRatedPosts } from '@/api/apiData'
import MyLoader from '@/components/MyLoader.vue'
import { useProfileStore } from '@/stores/profile'

const props = defineProps({
  username: String,
  listType: {
    type: String,
    default: '',
  },
})

const loading = ref(false)
const hasError = ref(false)
const posts = ref<Post[]>([])
const profileStore = useProfileStore()
async function fetchPosts() {
  if (!props.username) return

  loading.value = true
  hasError.value = false

  try {
    if (props.listType === 'rated') {
      const data = await getUserRatedPosts(props.username)
      profileStore.userPosts = data ?? []
    }
    if (props.listType === 'liked') {
      const data = await getUserLikedPosts(props.username)
      profileStore.userPosts = data ?? []
    }
    if (props.listType === '') {
      const data = await getUserPosts(props.username)
      // posts.value = data ?? []
      profileStore.userPosts = data ?? []
      profileStore.userPostsCount = profileStore.userPosts.length
    }
  } catch (e) {
    console.error(e)
    hasError.value = true
    posts.value = []
  } finally {
    loading.value = false
  }
}

watch(() => props, fetchPosts, { immediate: true, deep: true })
</script>

<style scoped lang="scss">
.wrapper--loading {
  display: flex;
  min-height: 40vh;
  align-items: center;
  justify-content: center;
}

/* ── Grid ── */

.post-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

@media (max-width: 1024px) {
  .post-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .post-list {
    grid-template-columns: repeat(2, 1fr);
    gap: 4px;
  }
}

@media (max-width: 380px) {
  .post-list {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}

/* ── Post enter animation ── */

.post-card-enter {
  animation: fadeSlideUp 0.35s ease both;
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* TransitionGroup move */
.post-fade-move {
  transition: transform 0.3s ease;
}

/* ── Empty / Error state ── */

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;
  padding: 60px 20px;
  min-height: 30vh;
}

.empty-state-icon {
  color: var(--text-muted);
  margin-bottom: 4px;
  opacity: 0.6;
}

.empty-state-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
}

.empty-state-text {
  margin: 0;
  font-size: 14px;
  color: var(--text-muted);
  max-width: 300px;
  line-height: 1.5;
}

/* ── Retry button ── */

.retry-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 8px 18px;
  border: 1px solid var(--input-border);
  border-radius: var(--radius-sm, 6px);
  background: var(--card-bg, #fff);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease,
    color 0.18s ease;
}

.retry-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--input-bg-hover, rgba(0, 0, 0, 0.02));
}
</style>
