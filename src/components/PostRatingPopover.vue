<template>
  <div class="rating-popover" @click.stop>
    <div class="rating-head">
      <span v-if="myRating">Your rating: {{ myRating }}</span>
      <span v-else>Click a star to rate</span>
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
      >
        ★
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { apiFetch } from '@/api/apiFetch'
import useModalStore from '@/stores/modals'
import { ref, watch } from 'vue'

const props = defineProps<{ postId: number }>()
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
  background: #fff;
  border: 1px solid #ccc;
  //   border-radius: 10px;
  padding: 10px;
  //   box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.rating-head {
  display: flex;
  gap: 6px;
  align-items: baseline;
  margin-bottom: 8px;
}

.stars {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;

  &.disabled {
    opacity: 0.7;
    pointer-events: none;
  }
}

.star {
  border: none;
  background: transparent;
  font-size: 22px;
  cursor: pointer;
  padding: 0;
  line-height: 1;

  opacity: 0.35;

  &.active {
    opacity: 1;
  }
}
</style>
