<template>
  <div class="marks-wrapper">
    <div class="marks">
      <div class="marks_likes">
        <LikesIcon
          color="blueviolet"
          :is-liked="isPostLikedByCurrentUser!"
          @click="isClickable ? toggleLike(postId) : undefined"
          class="icon"
        />
        <span>{{ likes }}</span>
      </div>
      <div class="marks_rating">
        <RatingIcon
          color="blueviolet"
          @click="toggleRatingPopover"
          class="icon"
          :is-rated="myRating ? true : false"
        />
        <!-- <span>{{ rating }}</span> -->
        <span>{{ avgRating.toFixed(2) }}</span>
        <span v-show="isClickable">({{ ratingsCount }})</span>
      </div>
    </div>
    <div class="popover-wrapper">
      <PostRatingPopover v-if="isRatingOpen" :post-id="postId" @selected="handleRate" />
    </div>
  </div>
</template>
w

<script setup lang="ts">
import { apiFetch } from '@/api/apiFetch'
import LikesIcon from '@/assets/icons/LikesIcon.vue'
import RatingIcon from '@/assets/icons/RatingIcon.vue'
import { ref, watch } from 'vue'

// ✅ ДОБАВИТЬ:
import PostRatingPopover from '@/components/PostRatingPopover.vue'

const props = defineProps({
  postId: {
    type: Number,
    required: true,
  },
  isClickable: {
    type: Boolean,
    default: true,
  },
})

let likes = ref<number>(0)
let rating = ref<number>(0)
let isPostLikedByCurrentUser = ref<boolean>()

// ✅ ДОБАВИТЬ: состояние попапа и мета рейтинга
const isRatingOpen = ref(false)
const avgRating = ref(0)
const ratingsCount = ref(0)
const myRating = ref<number | null>(null)

function toggleRatingPopover() {
  if (!props.isClickable) return
  isRatingOpen.value = !isRatingOpen.value
}

function closeRatingPopover() {
  isRatingOpen.value = false
}
function handleRate(value: number | null) {
  myRating.value = value
  closeRatingPopover()
}
// --- ваш код ниже НЕ ТРОГАЮ ---

async function toggleLike(id: number) {
  const res = await apiFetch(`/posts/${id}/like`, { method: 'POST' })
  const data = await res.json()
  likes.value = data.likes
  isPostLikedByCurrentUser.value = data.liked
}

async function getPostLikes(id: number) {
  const res = await apiFetch(`/posts/${id}/likes`)
  const data = await res.json()
  likes.value = data.likes
  isPostLikedByCurrentUser.value = data.likedByMe
}

async function getPostRating(id: number) {
  const res = await apiFetch(`/posts/${id}/rating`)
  const data = await res.json()
  console.log(data)

  // ✅ ДОБАВИТЬ: обновляем мету, чтобы выводить в UI
  avgRating.value = Number(data.avgRating ?? 0)
  ratingsCount.value = Number(data.ratingsCount ?? 0)
  myRating.value = data.myRating == null ? null : Number(data.myRating)

  // если хотите показывать "avg" рядом с иконкой:
  rating.value = avgRating.value
}

// ✅ ДОБАВИТЬ: выставление оценки из попапа (1..5)
async function setRatingFromPopover(n: number) {
  if (!props.isClickable) return
  const res = await apiFetch(`/posts/${props.postId}/rating`, {
    method: 'POST',
    body: JSON.stringify({ rating: n }),
  })
  const data = await res.json()

  avgRating.value = Number(data.avgRating ?? 0)
  ratingsCount.value = Number(data.ratingsCount ?? 0)
  myRating.value = data.myRating == null ? null : Number(data.myRating)
  rating.value = avgRating.value
}

watch(
  () => props.postId,
  async () => {
    if (props.postId) {
      await getPostLikes(props.postId)
      await getPostRating(props.postId)
    }
  },
  { immediate: true },
)
watch(
  () => myRating.value,
  async () => {
    if (myRating.value) {
      await getPostRating(props.postId)
    }
  },
)
</script>

<style scoped lang="scss">
.marks {
  padding: 5px 10px;
  display: flex;
  gap: 10px;
  &_likes {
    display: flex;
    align-items: center;
    gap: 5px;
    span {
      font-size: 16px;
      font-weight: 600;
    }
  }
  &_rating {
    display: flex;
    align-items: center;
    gap: 5px;
    span {
      font-size: 16px;
      font-weight: 600;
    }
  }
}
.icon {
  cursor: pointer;
  transition: 0.4s all ease;
}
.marks-wrapper {
  display: flex;
  flex-direction: column;
  position: relative;
}
.popover-wrapper {
  position: absolute;
  width: 100%;
  top: 100%;
}
</style>
