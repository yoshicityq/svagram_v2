<template>
  <div class="rating-popover" :class="`rating-popover__${direction}`" @click.stop ref="popoverRef">
    <div class="rating-head">
      <div class="rating-head__top">
        <span class="rating-title">Rate this post</span>
        <span v-if="ratingsCount" class="rating-summary">
          {{ avgRating.toFixed(1) }} · {{ ratingsCount }}
        </span>
      </div>

      <span class="rating-subtitle">
        <template v-if="myRating">Your rating: {{ myRating }}</template>
        <template v-else>Click a star to rate</template>
      </span>
    </div>

    <div class="stars" :class="{ disabled: loading }">
      <button
        v-for="n in 5"
        :key="n"
        class="star"
        :class="{ active: n <= (hovered ?? myRating ?? 0) }"
        :disabled="loading"
        @mouseenter="hovered = n"
        @mouseleave="hovered = null"
        @click="setRating(n)"
        type="button"
        :aria-label="`Rate ${n} out of 5`"
      >
        ★
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { apiFetch } from '@/api/apiFetch'
import useModalStore from '@/stores/modals'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{ postId: number; direction: string }>()
const emits = defineEmits(['selected'])

const loading = ref(false)
const avgRating = ref(0)
const ratingsCount = ref(0)
const myRating = ref<number | null>(null)
const hovered = ref<number | null>(null)

const modalStore = useModalStore()

async function load() {
  loading.value = true
  try {
    const res = await apiFetch(`/posts/${props.postId}/rating`)
    if (!res.ok) throw new Error('Failed to load rating meta')

    const data = (await res.json()) as {
      avgRating: number
      ratingsCount: number
      myRating: number | null
    }

    avgRating.value = data.avgRating
    ratingsCount.value = data.ratingsCount
    myRating.value = data.myRating
  } finally {
    loading.value = false
  }
}

async function setRating(n: number) {
  if (loading.value) return

  loading.value = true
  try {
    const res = await apiFetch(`/posts/${props.postId}/rating`, {
      method: 'POST',
      body: JSON.stringify({ rating: n }),
    })

    if (!res.ok) throw new Error('Failed to set rating')

    const data = (await res.json()) as {
      ok: true
      avgRating: number
      ratingsCount: number
      myRating: number | null
    }

    avgRating.value = data.avgRating
    ratingsCount.value = data.ratingsCount
    myRating.value = data.myRating

    if (modalStore.openedPostRating) {
      modalStore.openedPostRating.myRating = myRating.value
      modalStore.openedPostRating.ratingsCount = ratingsCount.value
      modalStore.openedPostRating.avgRating = avgRating.value
    }

    emits('selected', myRating.value)
  } finally {
    loading.value = false
  }
}
const isOpen = ref(false)
const popoverRef = ref<HTMLElement | null>(null)
function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node

  if (popoverRef.value && !popoverRef.value.contains(target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
watch(
  () => props.postId,
  (id) => {
    if (id) load()
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.rating-popover {
  width: 100%;
  padding: 14px;
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  background: var(--card-bg);
  box-shadow: var(--card-shadow);
  position: absolute;
  z-index: 2000;
}
.rating-popover__bottom {
  top: 100%;
}
.rating-popover__top {
  top: -310%;
}
.rating-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.rating-head__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.rating-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.rating-summary {
  font-size: 12px;
  color: var(--text-soft);
  white-space: nowrap;
}

.rating-subtitle {
  font-size: 13px;
  color: var(--text-muted);
}

.stars {
  display: flex;
  gap: 8px;
  align-items: center;
}

.stars.disabled {
  opacity: 0.65;
  pointer-events: none;
}

.star {
  width: 40px;
  height: 40px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: var(--rating-star-bg);
  color: var(--rating-star-text);
  font-size: 24px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    transform 0.12s ease,
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease;
}

.star:hover {
  background: var(--accent-soft);
  border-color: var(--rating-star-border);
  color: var(--rating-star-active);
}

.star:active {
  transform: scale(0.96);
}

.star:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.star.active {
  background: var(--accent-soft);
  border-color: var(--accent-border);
  color: var(--rating-star-active);
}

.star:disabled {
  cursor: default;
}
</style>
