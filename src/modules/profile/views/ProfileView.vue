<template>
  <ProfileSkeleton v-if="isLoading" />
  <UserNotFound v-else-if="isNotFound" />

  <div v-else class="profile-view">
    <div class="header">
      <div class="header-and-buttons">
        <div class="header-info">
          <div class="user-info-block">
            <UserOnline :is-online="profileStore.isOpenedUserOnline" />
            <MyAvatar :username="username" size="large" />

            <div class="user-info">
              <div class="user-info__main">
                <div class="user-top-row">
                  <span class="username">{{ username }}</span>

                  <div v-if="userProfileData?.title_name" class="title-badge">
                    <span>{{ userProfileData.title_name }}</span>
                  </div>
                </div>
                <div v-if="userProfileData?.city" class="meta-chip">
                  <LocationIcon class="meta-chip-icon" />
                  <span>{{ userProfileData.city }}</span>
                </div>
                <span v-if="userProfileData?.description" class="user-description">
                  {{ userProfileData.description }}
                </span>
              </div>
              <div class="user-meta-row">
                <div class="meta-item">
                  <PostsIcon class="meta-item-icon" />
                  <span>{{ profileStore.userPostsCount }} {{ $t('profilePage.posts_count') }}</span>
                </div>
                <div v-if="userProfileData?.favorite_brands" class="meta-item">
                  <FavBrandsIcon class="meta-item-icon" />
                  <span>{{ userProfileData.favorite_brands }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="userPermissionData?.isOwner" class="actions-block">
          <MyButton
            :icon="PlusIcon"
            size="xs"
            color="transparent"
            @click="modalStore.toggleCreateDialog()"
          >
            {{ $t('buttons.create_post') }}
          </MyButton>
          <MyButton
            :icon="EditIcon"
            size="xs"
            color="transparent"
            @click="router.push({ name: 'edit' })"
          >
            {{ $t('buttons.edit_profile') }}
          </MyButton>
          <MyButton @click="click">Check</MyButton>
        </div>
      </div>

      <nav class="navigation-block">
        <div v-for="tab in workableTabs" :key="tab.id">
          <button
            class="nav-tab"
            :class="{ 'nav-tab__active': activeTab === tab.id }"
            @click="navigateTabs(tab)"
          >
            <component
              :is="tab.icon"
              class="nav-tab-icon"
              :is-liked="tab.id === 'liked' ? false : undefined"
              :is-section-btn="tab.id === 'liked' ? true : undefined"
            />
          </button>
        </div>
      </nav>
    </div>

    <div class="body">
      <router-view />
    </div>
  </div>

  <CreatePostDialog />
  <OpenPostDialog />
</template>

<script setup lang="ts">
import MyButton from '@/components/UI/MyButton.vue'
import { useRoute, useRouter } from 'vue-router'
import useModalStore from '@/stores/modals'
import PostList from '../components/PostList.vue'
import StarIcon from '@/assets/icons/StarIcon.vue'
import { computed, onBeforeMount, onMounted, ref, watch, type Component } from 'vue'
import CreatePostDialog from '../components/CreatePostDialog.vue'
import MyAvatar from '@/components/MyAvatar.vue'
import { getProfileData } from '@/api/apiData'
import type { User } from '@/types/user'
import useAuthStore from '@/stores/auth'
import PostsIcon from '@/assets/icons/PostsIcon.vue'
import LikesIcon from '@/assets/icons/LikesIcon.vue'
import EstimatedPostsIcon from '@/assets/icons/EstimatedPostsIcon.vue'
import FavBrandsIcon from '@/assets/icons/FavBrandsIcon.vue'
import LocationIcon from '@/assets/icons/LocationIcon.vue'
import { useI18n } from 'vue-i18n'
import { useNotification } from '@kyvg/vue3-notification'
import OpenPostDialog from '@/components/OpenPostDialog.vue'
import { apiFetch } from '@/api/apiFetch'
import { closeWs, getWs, sendWsMessage } from '@/services/ws'
import UserOnline from '@/components/UserOnline.vue'
import { useProfileStore } from '@/stores/profile'
import EditIcon from '@/assets/icons/utils/EditIcon.vue'
import PlusIcon from '@/assets/icons/PlusIcon.vue'
import ProfileSkeleton from '../components/ProfileSkeleton.vue'
import UserNotFound from '../components/UserNotFound.vue'

const { t } = useI18n()
const modalStore = useModalStore()
const authStore = useAuthStore()
const profileStore = useProfileStore()
const route = useRoute()
const router = useRouter()
const username = ref(route.params.username as string)
type Permission = {
  isOwner: Boolean
  canViewPosts: Boolean
  canViewLikedPosts: Boolean
  canViewRatedPosts: Boolean
}
const userProfileData = ref<User | null>(null)
const userPermissionData = ref<Permission | null>(null)
const isLoading = ref(true)
const isNotFound = ref(false)
const activeTab = ref(
  route.name === 'posts' ? 'posts' : route.name === 'posts_liked' ? 'liked' : 'rated',
)
type Tab = {
  id: string
  icon: Component
  path: string
}
const tabs: Tab[] = [
  { id: 'posts', icon: PostsIcon, path: 'posts' },
  { id: 'liked', icon: LikesIcon, path: 'posts_liked' },
  { id: 'rated', icon: EstimatedPostsIcon, path: 'posts_rated' },
]

const workableTabs = computed(() => {
  return tabs.filter((tab) => {
    if (!userPermissionData.value?.isOwner) {
      if (tab.id === 'liked' && userPermissionData.value?.canViewLikedPosts) return tab
      if (tab.id === 'rated' && userPermissionData.value?.canViewRatedPosts) return tab
      if (tab.id === 'posts') return tab
    } else return tab
  })
})

function navigateTabs(tab: Tab) {
  activeTab.value = tab.id
  router.push({ name: tab.path })
}

const postsQuantity = ref(0)
const getLength = (data: number) => (postsQuantity.value = data)

const { notify } = useNotification()
async function click() {
  await apiFetch('/api/admin/titles', {
    method: 'POST',
    body: JSON.stringify({
      title_name: 'Fame',
      description: 'qqq',
    }),
  })
}
// Zvezdochka Swag Fame
watch(
  () => route.query.post,
  (newPost) => {
    if (newPost) {
      const id = Number(newPost)
      if (Number.isFinite(id)) {
        modalStore.openedPostId = id
        modalStore.isPostDialogOpen = true
      } else {
        const { post, ...rest } = route.query
        router.replace({ query: rest })
      }
    } else {
      modalStore.isPostDialogOpen = false
      modalStore.openedPostId = null
    }
  },
  { immediate: true },
)

watch(
  () => route.params.username,
  async (newVal) => {
    isLoading.value = true
    isNotFound.value = false
    username.value = newVal as string

    try {
      const data = await getProfileData(newVal as string)
      if (data) {
        userProfileData.value = data.user
        userPermissionData.value = data.permissions
        sendWsMessage({ type: 'online-check', userId: userProfileData.value.id })
      } else {
        isNotFound.value = true
      }
    } catch {
      isNotFound.value = true
    } finally {
      isLoading.value = false
    }
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.profile-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Header ── */

.header {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-bottom: 1px solid var(--border-primary);
}

.header-and-buttons {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  padding: 8px 0 16px;
}

.header-info {
  flex: 1;
  min-width: 0;
}

.user-info-block {
  display: flex;
  align-items: stretch;
  gap: 20px;
  position: relative;
}

.user-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 18px;

  .username {
    font-size: 30px;
    font-weight: 700;
    line-height: 1.1;
    color: var(--text-primary);
    word-break: break-word;
  }
}

.user-info__main {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-top-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
}

.user-description {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-muted);
  max-width: 700px;
  word-break: break-word;
}

.user-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  align-items: center;
}

.meta-item,
.meta-chip {
  display: inline-flex;
  align-items: end;
  gap: 3px;
  font-size: 14px;
  text-transform: capitalize;
  color: var(--text-secondary);
}

.meta-chip {
  // padding: 6px 10px;
  border-radius: 999px;
  // background: var(--chip-bg);
  color: var(--chip-text);
  width: fit-content;
}
.title-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  color: var(--accent);
  background: var(--accent-soft);
  border: 1px solid var(--accent-border);
  white-space: nowrap;
}

.title-badge-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
.meta-item-icon,
.meta-chip-icon {
  flex-shrink: 0;
}

/* ── Actions ── */

.actions-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
  min-width: 180px;
}

// .action-btn {
//   display: inline-flex;
//   align-items: center;
//   justify-content: center;
//   gap: 8px;
// }

.action-btn-icon {
  flex-shrink: 0;
}

/* ── Navigation tabs ── */

.navigation-block {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 0;
}

.nav-tab {
  position: relative;
  transition: color 0.2s ease;
  background: none;
  border: none;
  padding: 12px 20px 5px 20px;
  cursor: pointer;
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 24px;
    height: 2px;
    background: var(--text-primary);
    border-radius: 2px;
    transform: translateX(-50%) scaleX(0);
    transition: transform 0.2s ease;
  }

  &__active {
    &::after {
      transform: translateX(-50%) scaleX(1);
    }
  }
}

.nav-tab-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.nav-tab-label {
  white-space: nowrap;
}

/* ── Skeleton loading ── */

.skeleton {
  background: linear-gradient(
    90deg,
    var(--input-bg, #f3f4f6) 25%,
    var(--input-bg-hover, #e5e7eb) 50%,
    var(--input-bg, #f3f4f6) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm, 6px);
}

.skeleton-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-username {
  width: 180px;
  height: 30px;
}

.skeleton-description {
  width: 280px;
  height: 16px;
}

.skeleton-meta {
  width: 120px;
  height: 16px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* ── Not found ── */

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 12px;
  padding: 60px 20px;
}

.not-found-icon {
  color: var(--text-muted);
  margin-bottom: 4px;
}

.not-found-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
}

.not-found-text {
  margin: 0;
  font-size: 14px;
  color: var(--text-muted);
  max-width: 360px;
  line-height: 1.5;
}

/* ── Responsive ── */

@media (max-width: 900px) {
  .header-and-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .actions-block {
    min-width: 0;
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
  }
}

@media (max-width: 640px) {
  .user-info-block {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }

  .user-info {
    .username {
      font-size: 24px;
    }
  }

  .actions-block {
    flex-direction: column;
  }

  .skeleton-avatar {
    width: 72px;
    height: 72px;
  }

  .nav-tab {
    padding: 10px 14px;
    font-size: 12px;
  }

  .nav-tab-label {
    display: none;
  }
}
</style>
