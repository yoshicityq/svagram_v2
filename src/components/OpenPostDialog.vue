<template>
  <Teleport to="#portal">
    <div v-show="modalStore.isPostDialogOpen" class="post-overlay" @click.self="closeDialog">
      <div class="post-modal">
        <div class="post-modal__image-side" ref="imageContainer">
          <div v-if="loading" class="post-modal__loader">
            <MyLoader />
          </div>

          <img
            v-else
            :src="`http://localhost:3000${post?.imageUrl}`"
            alt="Post image"
            class="post-modal__image"
          />
          <span
            v-if="post && isBrandsVisible"
            v-for="pin in post.category_list"
            :key="pin.id"
            class="image-editor__pin"
            :style="{ left: `${pin.xPercent}%`, top: `${pin.yPercent}%` }"
          >
            <span class="pin-dot" />
            <span v-if="pin.category || pin.brand" class="pin-label">
              <!-- <span v-if="pin.category" class="pin-label__category">{{
                  $t(CategoryReadable(CategoryBackend(pin.category)!)!)
                }}</span> -->
              <component
                v-if="pin.category"
                :is="iconsContainer[pin.category]"
                class="pin-label__icon"
              />
              <span v-if="pin.brand" class="pin-label__brand">{{ pin.brand }}</span>
            </span>
          </span>
          <MyButton
            :icon="isBrandsVisible ? EyeOnIcon : EyeOffIcon"
            :is-sidebar-opened="false"
            size="s"
            class="post-modal__close-btn"
            @click="isBrandsVisible = !isBrandsVisible"
          />
        </div>

        <div class="post-modal__content-side">
          <div class="post-header">
            <div class="post-header__user">
              <UserProfile :username="username" />
            </div>
            <button
              type="button"
              class="post-header__close"
              aria-label="Close dialog"
              @click="closeDialog"
            >
              <CrossIcon class="post-header__close-icon" />
            </button>
          </div>

          <div class="post-stats">
            <div class="post-stats__meta">
              <span v-if="post?.date" class="post-meta__item">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{{ formatTime(post.date) }}</span>
              </span>
              <span v-if="post?.latitude && post?.longitude" class="post-meta__item">
                <LocationIcon class="post-meta__icon" />
                <span>{{ post.latitude.toFixed(3) }}, {{ post.longitude.toFixed(3) }}</span>
              </span>
            </div>

            <p v-if="post?.description" class="post-stats__description">
              {{ post.description }}
            </p>
          </div>
          <div class="post-comments">
            <div v-if="!commentsArr.length" class="post-comments__empty">
              <CommentsIcon class="post-comments__icon" color="blueviolet" />
              <div class="post-comments__text">
                <span>No comments yet</span>
                <span>Write the first one!</span>
              </div>
            </div>
            <div v-else class="post-comments__list">
              <div class="comment" v-for="comm in commentsArr" :key="comm.id">
                <MyAvatar
                  :username="comm.username"
                  size="small"
                  class="comment__avatar"
                  @click="router.push(`/${comm.username}`)"
                />

                <div class="comment__body">
                  <div class="comment__content">
                    <span class="comment__username" @click="router.push(`/${comm.username}`)">{{
                      comm.username
                    }}</span>
                    <div class="comment__bubble">
                      <span class="comment__text">{{ comm.text }}</span>
                    </div>
                  </div>

                  <div class="comment__meta">
                    <span class="comment__time">{{ formatTime(comm.createdAt) }}</span>
                    <button type="button" class="comment__action">Reply</button>
                    <button type="button" class="comment__action">Like</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="post-footer">
            <!-- <div v-if="hasBrands" class="post-brands">
              <button type="button" class="post-brands__toggle" @click="toggleBrands">
                <span class="post-brands__toggle-text">{{ $t('helpers.brands') }}</span>
                <ChevronIcon class="post-brands__chevron" :class="{ open: isBrandsVisible }" />
              </button>

              <transition name="brands-fade">
                <div v-show="isBrandsVisible" class="post-brands__panel">
                  <div
                    v-for="[category, brands] in onlyBrandsArray"
                    :key="category"
                    class="post-brands__group"
                  >
                    <div class="post-brands__group-title">
                      {{ $t(CategoryReadable(CategoryBackend(category)!)!) }}
                    </div>

                    <div class="post-brands__chips">
                      <span
                        v-for="brand in brands"
                        :key="`${category}-${brand}`"
                        class="post-brands__chip"
                      >
                        {{ brand }}
                      </span>
                    </div>
                  </div>
                </div>
              </transition>
            </div> -->
            <EstimatePost v-if="postId" :post-id="postId" />

            <div class="post-input">
              <!-- <CommentsInput :post-id="postId" /> -->
              <MyInput />
            </div>
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
import CrossIcon from '@/assets/icons/CrossIcon.vue'
import CommentsInput from '@/components/CommentsInput.vue'
import { CategoryBackend, CategoryReadable } from '@/enums/categories'
import EstimatePost from '@/components/EstimatePost.vue'
import MyAvatar from '@/components/MyAvatar.vue'
import MyLoader from '@/components/MyLoader.vue'
import UserProfile from '@/components/UserProfile.vue'
import useModalStore from '@/stores/modals'
import AccessoryIcon from '@/assets/icons/categories/AccessoryIcon.vue'
import BagIcon from '@/assets/icons/categories/BagIcon.vue'
import GlassesIcon from '@/assets/icons/categories/GlassesIcon.vue'
import HatIcon from '@/assets/icons/categories/HatIcon.vue'
import JacketIcon from '@/assets/icons/categories/JacketIcon.vue'
import PantsIcon from '@/assets/icons/categories/PantsIcon.vue'
import ShoesIcon from '@/assets/icons/categories/ShoesIcon.vue'
import TshirtIcon from '@/assets/icons/categories/TshirtIcon.vue'
import type { Post, PostPin } from '@/types/post'
import { computed, onMounted, onUpdated, ref, watch, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MyInput from './UI/MyInput.vue'
import { useI18n } from 'vue-i18n'
import LocationIcon from '@/assets/icons/LocationIcon.vue'
import MyButton from './UI/MyButton.vue'
import EyeOnIcon from '@/assets/icons/utils/EyeOnIcon.vue'
import EyeOffIcon from '@/assets/icons/utils/EyeOffIcon.vue'

const modalStore = useModalStore()
const route = useRoute()
const router = useRouter()

const post = ref<Post | null>(null)
const username = ref('')
const loading = ref(false)
const isBrandsVisible = ref(true)

const postId = computed(() => modalStore.openedPostId as number)
const onlyBrandsArray = ref<Array<[string, string[]]>>([])
const hasBrands = computed(() => onlyBrandsArray.value.length > 0)
async function getPost(id: number) {
  loading.value = true

  try {
    const response = await apiFetch(`/posts/${id}`)
    const data = await response.json()

    const ratingData = await getPostRating(id)
    const likesData = await getPostLikes(id)

    if (data?.post && ratingData && likesData) {
      username.value = data.post.user
      post.value = formatBrandData(data.post)
      onlyBrandsArray.value = onlyBrandEntries(data.post)
      modalStore.openedPostRating = ratingData
      modalStore.openedPostLikes = likesData
    }
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }
}
const now = ref(Date.now())
const { t } = useI18n()
function getPluralKey(value: number, unit: 'minute' | 'hour' | 'day' | 'week'): string {
  const mod10 = value % 10
  const mod100 = value % 100

  if (mod10 === 1 && mod100 !== 11) {
    return `time.${unit}_ago_1`
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `time.${unit}_ago_2_4`
  }

  return `time.${unit}_ago_5`
}

function formatTime(ts: number): string {
  const diff = now.value - ts
  const m = Math.floor(diff / 60000)

  if (m < 1) return t('time.just_now')
  if (m < 60) return m === 1 ? t('time.minute_ago_1') : `${m} ${t(getPluralKey(m, 'minute'))}`

  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ${t(getPluralKey(h, 'hour'))}`

  const d = Math.floor(h / 24)
  if (d < 7) return `${d} ${t(getPluralKey(d, 'day'))}`

  const w = Math.floor(d / 7)
  return `${w} ${t(getPluralKey(w, 'week'))}`
}
type Comment = {
  avatarUrl: null | string
  createdAt: number
  hasAvatar: boolean
  id: number
  isMine: boolean
  parentComment: null | string
  postId: number
  text: string
  updatedAt: number
  userId: number
  username: string
}
const commentsArr = ref<Array<Comment>>([])

const iconsContainer: Record<string, Component> = {
  brand_hat: HatIcon,
  brand_top: TshirtIcon,
  brand_accessory: AccessoryIcon,
  brand_glasses: GlassesIcon,
  brand_bottom: PantsIcon,
  brand_shoes: ShoesIcon,
  brand_bag: BagIcon,
  brand_outwear: JacketIcon,
}
async function getPostComments(id: number) {
  const response = await apiFetch(`/posts/${id}/comments`)
  const data = await response.json()
  commentsArr.value = data.comments
}

function parseBrands(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function onlyBrandEntries(data: Post): Array<[string, string[]]> {
  return Object.entries(data).flatMap(([key, value]) => {
    if (!key.startsWith('brand') || typeof value !== 'string') {
      return []
    }

    const brands = parseBrands(value)

    if (!brands.length) {
      return []
    }

    return [[key, brands]]
  })
}

function formatBrandData(data: Post) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (key.startsWith('brand') && typeof value === 'string') {
        return [key, parseBrands(value)]
      }

      return [key, value]
    }),
  )
}

function closeDialog() {
  modalStore.togglePostDialog()
  modalStore.openedPostId = null
  isBrandsVisible.value = false

  const { post, ...rest } = route.query
  router.push({ query: rest })
}

function toggleBrands() {
  isBrandsVisible.value = !isBrandsVisible.value
}

watch(
  () => postId.value,
  async (newVal) => {
    if (newVal) {
      await getPost(newVal)
      await getPostComments(newVal)
      isBrandsVisible.value = true
    } else {
      post.value = null
      onlyBrandsArray.value = []
      isBrandsVisible.value = false
    }
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.post-overlay {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--bg-overlay);
}

.post-modal {
  width: min(fit-content, 100%);
  height: min(760px, calc(100vh - 48px));
  display: grid;
  grid-template-columns: minmax(380px, 1fr) 380px;
  background: var(--card-bg);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.post-modal__image-side {
  background: var(--image-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 0;
  position: relative;
}

.post-modal__loader {
  width: 100%;
  height: 100%;
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.post-modal__image {
  // width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  background: var(--image-bg);
}

.post-modal__content-side {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  background: var(--card-bg);
  overflow: visible;
}
.post-modal__close-btn {
  position: absolute;
  bottom: 3%;
  right: 3%;
}
.post-header {
  height: 64px;
  padding: 0 16px;
  border-bottom: 1px solid var(--border-muted);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
}
.post-header__user {
  min-width: 0;
  flex: 1;
}
.post-header__date {
  font-size: 10px;
  color: var(--text-secondary);
  margin-top: 10px;
}
.post-header__close {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.post-header__close:hover {
  background: var(--sidebar-item-hover);
}

.post-header__close-icon {
  width: 16px;
  height: 16px;
  color: var(--icon-primary);
}

.post-stats {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-muted);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.post-comments {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px;
}

.post-comments__empty {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--text-soft);
}

.post-comments__icon {
  width: 96px;
  height: 96px;
  margin-bottom: 12px;
}

.post-comments__text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
}

.post-comments__list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.comment {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  animation: comment-in 0.25s ease both;
}

.comment__avatar {
  flex-shrink: 0;
  margin-top: 2px;
  cursor: pointer;
}

.comment__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.comment__content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.comment__bubble {
  display: inline-flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: baseline;
  // padding: 8px 12px;
  // background: var(--bg-surface-secondary);
  // border: 1px solid var(--border-muted);
  // border-radius: var(--radius-md);
  border-top-left-radius: 4px;
  max-width: 100%;
  word-break: break-word;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

// .comment:hover .comment__bubble {
//   background: var(--bg-surface-tertiary);
//   border-color: var(--accent-border);
// }

.comment__username {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
  cursor: pointer;
}

.comment__text {
  font-size: 13.5px;
  color: var(--text-secondary);
  line-height: 1.45;
  white-space: pre-wrap;
}
.post-stats__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 14px;
}
.comment__time {
  font-weight: 500;
}

.comment__action {
  border: none;
  background: transparent;
  padding: 0;
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-soft);
  cursor: pointer;
  transition: color 0.15s ease;
}

.comment__action:hover {
  color: var(--accent);
}
.post-meta__item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);

  svg {
    flex-shrink: 0;
    color: var(--icon-muted);
  }
}
.post-meta__icon {
  width: 14px;
  height: 14px;
}

.post-stats__description {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-secondary);
  word-break: break-word;
}
@keyframes comment-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.post-footer {
  position: relative;
  padding: 12px 16px 16px;
  border-top: 1px solid var(--border-muted);
  background: var(--card-bg);
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
  z-index: 2;
}

.post-brands {
  position: relative;
  z-index: 3;
}

.post-brands__toggle {
  width: 100%;
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid var(--input-border);
  border-radius: var(--radius-sm);
  background: var(--input-bg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  font: inherit;
  color: var(--text-secondary);
}

.post-brands__toggle-text {
  font-size: 14px;
  font-weight: 600;
}

.post-brands__chevron {
  width: 18px;
  height: 18px;
  transform: rotate(180deg);
  transition: transform 0.25s ease;
  color: var(--icon-secondary);
}

.post-brands__chevron.open {
  transform: rotate(0deg);
}

.post-brands__panel {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(100% + 8px);
  padding: 14px;
  border: 1px solid var(--dropdown-border);
  border-radius: var(--radius-md);
  background: var(--dropdown-bg);
  box-shadow: var(--shadow-lg);
  max-height: min(320px, calc(100vh - 220px));
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  z-index: 20;
}

.post-brands__group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.post-brands__group-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-soft);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.post-brands__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.post-brands__chip {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: var(--chip-bg);
  color: var(--chip-text);
  font-size: 13px;
  border: 1px solid var(--chip-border);
}

.post-input {
  position: relative;
  z-index: 1;
}

.brands-fade-enter-active,
.brands-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.brands-fade-enter-from,
.brands-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
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

@media (max-width: 980px) {
  .post-modal {
    grid-template-columns: 1fr;
    width: min(760px, 100%);
    height: min(92vh, 100%);
  }

  .post-modal__image-side {
    min-height: 280px;
    max-height: 42vh;
  }

  .post-modal__image {
    max-height: 42vh;
  }

  .post-brands__panel {
    max-height: min(240px, calc(100vh - 260px));
  }
}

@media (max-width: 640px) {
  .post-overlay {
    padding: 10px;
  }

  .post-modal {
    height: calc(100vh - 20px);
    border-radius: var(--radius-sm);
  }

  .post-header,
  .post-stats,
  .post-comments,
  .post-footer {
    padding-left: 12px;
    padding-right: 12px;
  }

  .post-comments__icon {
    width: 72px;
    height: 72px;
  }

  .post-brands__panel {
    left: 0;
    right: 0;
    max-height: min(220px, calc(100vh - 280px));
  }
}
</style>
