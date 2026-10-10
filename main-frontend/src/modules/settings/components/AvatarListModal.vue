<template>
  <div
    v-if="modalStore.isAvatarModalOpen"
    class="avatar-picker__overlay"
    @click.self="modalStore.toggleAvatarModal"
  >
    <div
      class="avatar-picker"
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-picker-title"
    >
      <header class="avatar-picker__header">
        <div class="avatar-picker__heading">
          <h2 id="avatar-picker-title" class="avatar-picker__title">Choose from posts</h2>
          <p class="avatar-picker__subtitle">
            Pick one of your published photos to use as your avatar
          </p>
        </div>
        <button
          type="button"
          class="avatar-picker__close"
          aria-label="Close"
          @click="modalStore.toggleAvatarModal"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            width="18"
            height="18"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </header>

      <div class="avatar-picker__body">
        <!-- Загрузка -->
        <div v-if="isLoading" class="avatar-picker__grid">
          <div v-for="n in 9" :key="n" class="avatar-picker__skeleton" />
        </div>

        <!-- Пустое состояние -->
        <div v-else-if="!postList || postList.length === 0" class="avatar-picker__empty">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            width="56"
            height="56"
          >
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="9" cy="9" r="2" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <h3 class="avatar-picker__empty-title">No posts yet</h3>
          <p class="avatar-picker__empty-text">
            Once you publish photos, they'll appear here so you can use them as an avatar.
          </p>
        </div>

        <!-- Сетка постов -->
        <div v-else class="avatar-picker__grid">
          <button
            v-for="post in postList"
            :key="post.id"
            type="button"
            class="avatar-picker__item"
            :class="{ 'avatar-picker__item--selected': selectedId === post.id }"
            @click="selectedId = post.id"
          >
            <img :src="`${baseUrl}${post.imageUrl}`" alt="" class="avatar-picker__img" />
            <span class="avatar-picker__item-overlay">
              <span class="avatar-picker__check" v-if="selectedId === post.id">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  width="18"
                  height="18"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            </span>
          </button>
        </div>
      </div>

      <footer class="avatar-picker__footer">
        <button
          type="button"
          class="avatar-picker__btn avatar-picker__btn--ghost"
          @click.self="modalStore.toggleAvatarModal"
        >
          Cancel
        </button>
        <button
          type="button"
          class="avatar-picker__btn avatar-picker__btn--primary"
          :disabled="selectedId === null"
          @click="confirm"
        >
          Use as avatar
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getUserPosts } from '@/api/apiData'
import useModalStore from '@/stores/modals'
import type { Post } from '@/types/post'
import { ref, watch } from 'vue'
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const modalStore = useModalStore()
const props = defineProps<{
  username: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', post: Post): void
}>()

const postList = ref<Post[] | null>(null)
const isLoading = ref(false)
const selectedId = ref<number | null>(null)

function confirm() {
  const chosen = postList.value?.find((p) => p.id === selectedId.value)
  if (chosen) emit('select', chosen)
  modalStore.toggleAvatarModal()
}

watch(
  () => props.username,
  async (newVal) => {
    if (!newVal) return
    isLoading.value = true
    try {
      postList.value = await getUserPosts(newVal)
    } finally {
      isLoading.value = false
    }
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.avatar-picker__overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: var(--bg-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  backdrop-filter: blur(4px);
  animation: fade-in 0.18s ease;
}

.avatar-picker {
  width: 100%;
  max-width: 720px;
  max-height: min(90vh, 720px);
  background: var(--bg-elevated);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slide-up 0.22s ease;
}

/* ── Header ── */

.avatar-picker__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px 16px;
  border-bottom: 1px solid var(--border-muted);
}

.avatar-picker__heading {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.avatar-picker__title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.1px;
}

.avatar-picker__subtitle {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.4;
}

.avatar-picker__close {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--icon-secondary);
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    color 0.18s ease,
    border-color 0.18s ease;

  &:hover {
    background: var(--button-ghost-bg-hover);
    color: var(--icon-primary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }
}

/* ── Body / grid ── */

.avatar-picker__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px 22px;
}

.avatar-picker__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 6px;
}

.avatar-picker__item {
  position: relative;
  aspect-ratio: 1 / 1;
  padding: 0;
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  background: var(--image-bg);
  cursor: pointer;
  overflow: hidden;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: var(--accent-border);
    box-shadow: var(--shadow-md);

    .avatar-picker__item-overlay {
      opacity: 1;
    }
  }

  &:focus-visible {
    outline: none;
    border-color: var(--accent);
    box-shadow: var(--focus-ring);
  }

  &--selected {
    border-color: var(--accent);
    box-shadow: 0 0 0 4px var(--accent-soft);

    .avatar-picker__item-overlay {
      opacity: 1;
      background: var(--accent-soft-strong);
    }
  }
}

.avatar-picker__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar-picker__item-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 8px;
  opacity: 0;
  transition:
    opacity 0.18s ease,
    background-color 0.18s ease;
  pointer-events: none;
}

.avatar-picker__check {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--accent);
  color: var(--text-on-accent);
  box-shadow: var(--shadow-sm);
}

/* ── Skeleton ── */

.avatar-picker__skeleton {
  aspect-ratio: 1 / 1;
  border-radius: var(--radius-md);
  background: linear-gradient(
    90deg,
    var(--input-bg) 25%,
    var(--input-bg-hover) 50%,
    var(--input-bg) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

/* ── Empty state ── */

.avatar-picker__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 12px;
  padding: 60px 20px;
  color: var(--text-muted);

  svg {
    color: var(--icon-muted);
  }
}

.avatar-picker__empty-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.avatar-picker__empty-text {
  margin: 0;
  font-size: 14px;
  max-width: 320px;
  line-height: 1.5;
}

/* ── Footer ── */

.avatar-picker__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 22px;
  border-top: 1px solid var(--border-muted);
  background: var(--bg-surface-secondary);
}

.avatar-picker__btn {
  min-width: 110px;
  height: 40px;
  padding: 0 18px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease;

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.avatar-picker__btn--ghost {
  background: var(--button-bg);
  color: var(--button-text);
  border: 1px solid var(--button-border);

  &:hover:not(:disabled) {
    background: var(--button-bg-hover);
    border-color: var(--button-border-hover);
  }
}

.avatar-picker__btn--primary {
  background: var(--button-primary-bg);
  color: var(--button-primary-text);
  border: 1px solid var(--button-primary-border);

  &:hover:not(:disabled) {
    background: var(--button-primary-bg-hover);
  }

  &:active:not(:disabled) {
    background: var(--button-primary-bg-active);
  }
}

/* ── Animations ── */

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* ── Responsive ── */

@media (max-width: 600px) {
  .avatar-picker__overlay {
    padding: 0;
    align-items: flex-end;
  }

  .avatar-picker {
    max-width: 100%;
    max-height: 92vh;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  }

  .avatar-picker__grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
  }

  .avatar-picker__btn {
    flex: 1;
  }
}
</style>
