<template>
  <Teleport to="#portal">
    <div v-show="modalStore.isPostDialogOpen" class="post-wrapper" @click="closeDialog">
      <div @click.stop class="post">
        <div class="post-image">
          <img :src="`http://localhost:3000${post?.imageUrl}`" alt="" class="photo" />
        </div>
        <div class="post-info">
          <div class="info-header">
            <div class="info-user">
              <UserProfile :username="username" />
            </div>
            <EstimatePost v-if="postId" :post-id="postId" />
          </div>
          <div class="info-body">
            <div class="no-comments-wrapper">
              <div class="no-comments">
                <CommentsIcon class="no-comments-icon" color="blueviolet" />
                <div class="no-comments-text">
                  <span>No comments yet</span>
                  <span>Write the first one!</span>
                </div>
              </div>
            </div>
          </div>
          <div class="info-footer">
            <div class="brands">
              <div class="brands-items" :class="{ 'brands-items__visible': isBrandsVisible }">
                <div>{{ post?.brand_h }}</div>
                <div>{{ post?.brand_tt }}</div>
                <div>{{ post?.brand_t }}</div>
                <div>{{ post?.brand_b }}</div>
                <div>{{ post?.brand_s }}</div>
              </div>

              <div class="brands-controller" @click="toggleBrands">
                <span>Brands</span>
                <ChevronIcon class="brands-chevron" :class="{ open: isBrandsVisible }" />
              </div>
            </div>

            <CommentsInput />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { getPostLikes, getPostRating } from '@/api/apiData'
import { apiFetch } from '@/api/apiFetch'
import ChevronIcon from '@/assets/icons/ChevronIcon.vue'
import CommentsIcon from '@/assets/icons/CommentsIcon.vue'
import LikesIcon from '@/assets/icons/LikesIcon.vue'
import RatingIcon from '@/assets/icons/RatingIcon.vue'
import CommentsInput from '@/components/CommentsInput.vue'
import EstimatePost from '@/components/EstimatePost.vue'
import PostRatingPopover from '@/components/PostRatingPopover.vue'
import UserProfile from '@/components/UserProfile.vue'
import useModalStore from '@/stores/modals'
import type { Post, PostLikes } from '@/types/post'
import { computed, onBeforeUnmount, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const modalStore = useModalStore()

const post = ref<Post | null>(null)
const username = ref<string>('')
const postId = computed(() => modalStore.openedPostId as number)

async function getPost() {
  const response = await apiFetch(`/posts/${postId.value}`)
  const data = await response.json()

  const ratingData = await getPostRating(postId.value)
  const likesData = await getPostLikes(postId.value)
  if (data && ratingData && likesData) {
    username.value = data.post.user
    post.value = data.post

    modalStore.openedPostRating = ratingData
    modalStore.openedPostLikes = likesData
  }
}

const route = useRoute()
const router = useRouter()

function closeDialog() {
  modalStore.togglePostDialog()
  modalStore.openedPostId = null
  const { post, ...rest } = route.query
  router.push({ query: rest })
}

const isBrandsVisible = ref(false)
function toggleBrands() {
  isBrandsVisible.value = !isBrandsVisible.value
}

watch(
  () => postId.value,
  async () => {
    if (postId.value) await getPost()
    else {
      post.value = null
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {})
</script>

<style scoped lang="scss">
.post-wrapper {
  position: fixed;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 20;
}
.post {
  width: fit-content;
  height: 80%;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  border-radius: 5px;
}

.post-image {
  // width: 600px;
  overflow: hidden;
  border-bottom-left-radius: 5px;
  border-top-left-radius: 5px;
}
.photo {
  width: 100%;
  height: 100%;
  object-fit: cover; /* заполняет, обрезая края */
  display: block;
}
.post-info {
  width: 300px;
  display: flex;
  flex-direction: column;
}
.info-header {
  border-bottom: 1px solid #ccc;
  .info-user {
    justify-self: start;
    width: 100%;
    border-bottom: 1px solid #ccc;
    padding: 5px;
  }
  .info-stats {
    .stats-actions {
      border-bottom: 1px solid #ccc;
      padding: 5px;
    }
    .stats-brands {
      padding: 5px;
    }
  }
}
.info-body {
  flex: 1;
}

// .brands {
//   padding: 5px 10px;
//   position: relative;
//   overflow: hidden;
//   .brands-controller {
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     .brands-chevron {
//       transform: rotate(180deg);
//     }
//   }

//   .brands-items {
//     position: absolute;
//     top: 30px;
//   }
//   .brands-items__visible {
//     transform: translateY(-100px);
//   }
// }
.brands {
  padding: 5px 10px;
  position: relative;

  .brands-controller {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
  }

  .brands-chevron {
    transform: rotate(180deg);
    transition: transform 0.4s ease;
    &.open {
      transform: rotate(0deg);
    }
  }

  .brands-items {
    position: absolute;
    left: 0;
    right: 0;

    // размещаем блок "под контроллером", но в закрытом состоянии прячем
    top: 30px;

    // закрытое состояние
    transform: translateY(0px); // уезжает вниз (за границу overflow:hidden)
    opacity: 0;
    pointer-events: none;

    transition:
      transform 0.4s ease,
      opacity 0.2s ease;

    background: white;
    border: 1px solid #eee;
    padding: 8px;
  }

  .brands-items__visible {
    transform: translateY(-130%); // выехал на место
    opacity: 1;
    pointer-events: auto;
  }
}
.no-comments-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
.no-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  &-icon {
    width: 150px;
    height: 150px;
  }
  &-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #757575;
  }
}
</style>
