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
        <span>{{ avgRating.toFixed(2) }}</span>
        <span v-show="isClickable">({{ ratingsCount }})</span>
      </div>
    </div>
    <div class="popover-wrapper">
      <PostRatingPopover v-if="isRatingOpen" :post-id="postId" @selected="handleRate" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { apiFetch } from '@/api/apiFetch'
import LikesIcon from '@/assets/icons/LikesIcon.vue'
import RatingIcon from '@/assets/icons/RatingIcon.vue'
import { ref, watch } from 'vue'
import PostRatingPopover from '@/components/PostRatingPopover.vue'
import { getPostLikes, getPostRating } from '@/api/apiData'
import useModalStore from '@/stores/modals'

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

const modalStore = useModalStore()
let likes = ref<number>(0)
let isPostLikedByCurrentUser = ref<boolean>()

const isRatingOpen = ref<boolean>(false)
const avgRating = ref<number>(0)
const ratingsCount = ref<number>(0)
const myRating = ref<number | null>(0)

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

async function toggleLike(id: number) {
  const res = await apiFetch(`/posts/${id}/like`, { method: 'POST' })
  const data = await res.json()
  likes.value = data.likes
  isPostLikedByCurrentUser.value = data.liked
  if (modalStore.openedPostLikes) {
    modalStore.openedPostLikes.likes = data.likes
    modalStore.openedPostLikes.likedByMe = data.liked
  }
}

watch(
  () => props.postId,
  async (newVal) => {
    if (newVal) {
      const likesData = await getPostLikes(props.postId)
      const ratingData = await getPostRating(props.postId)
      console.log(likesData)
      if (likesData) {
        likes.value = likesData.likes
        isPostLikedByCurrentUser.value = likesData.likedByMe
      }
      if (ratingData) {
        avgRating.value = ratingData.avgRating
        ratingsCount.value = ratingData.ratingsCount
        myRating.value = ratingData.myRating
      }
    }
  },
  { immediate: true },
)
watch(
  () => myRating.value,
  async (newVal) => {
    if (newVal) {
      const ratingData = await getPostRating(props.postId)

      if (ratingData) {
        avgRating.value = ratingData.avgRating
        ratingsCount.value = ratingData.ratingsCount
        myRating.value = ratingData.myRating
      }
    }
  },
)
watch(
  () => modalStore.openedPostLikes,
  (newVal) => {
    if (newVal) {
      if (modalStore.openedPostLikes) {
        if (modalStore.openedPostId !== props.postId) return
        if (modalStore.openedPostLikes.likes !== likes.value) {
          likes.value = modalStore.openedPostLikes.likes
          isPostLikedByCurrentUser.value = modalStore.openedPostLikes.likedByMe
        }
      }
    }
  },
  { deep: true },
)
watch(
  () => modalStore.openedPostRating,
  () => {
    if (modalStore.openedPostRating) {
      if (modalStore.openedPostId !== props.postId) return

      if (modalStore.openedPostRating.avgRating !== avgRating.value) {
        avgRating.value = modalStore.openedPostRating.avgRating
        myRating.value = modalStore.openedPostRating.myRating
        ratingsCount.value = modalStore.openedPostRating.ratingsCount
      }
    }
  },
  { deep: true },
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
