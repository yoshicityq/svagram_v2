<template>
  <div class="userdata-view">
    <div class="header">
      <div class="header-text">
        <span class="header-title">{{ $t('title.account_title') }}</span>
        <span class="header-subtitle">{{ $t('description.account_description') }}</span>
      </div>
    </div>

    <div class="body">
      <div class="settings-card">
        <div class="setting-option">
          <div class="setting-option__header">
            <div class="setting-header__wrapper">
              <span class="setting-header__title">{{ $t('title.change_pass_title') }}</span>
              <span class="setting-header__description">{{
                $t('description.change_pass_description')
              }}</span>
            </div>
            <MyButton
              :icon="ChevronIcon"
              :is-sidebar-opened="false"
              @click="isPassOptionsVisible = !isPassOptionsVisible"
              :active="isPassOptionsVisible"
            />
          </div>
          <div v-if="isPassOptionsVisible" class="rows-container">
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-title">Liked posts</span>
                <span class="setting-description">Manage visibility of liked posts list</span>
              </div>

              <div class="setting-control setting-control--placeholder">
                <span>Option</span>
              </div>
            </div>
          </div>
        </div>
        <div class="setting-option">
          <div class="setting-option__header">
            <div class="setting-header__wrapper">
              <span class="setting-header__title">{{ $t('title.change_email_title') }}</span>
              <span class="setting-header__description"
                >{{ $t('description.change_email_description') }}
              </span>
            </div>

            <MyButton
              :icon="ChevronIcon"
              :is-sidebar-opened="false"
              @click="isEmailOptionsVisible = !isEmailOptionsVisible"
              :active="isEmailOptionsVisible"
            />
          </div>
          <div v-if="isEmailOptionsVisible" class="rows-container">
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-title">Liked posts</span>
                <span class="setting-description">Manage visibility of liked posts list</span>
              </div>

              <div class="setting-control setting-control--placeholder">
                <span>Option</span>
              </div>
            </div>
          </div>
        </div>

        <div class="setting-option">
          <div class="setting-option__header">
            <div class="setting-header__wrapper">
              <span class="setting-header__title">{{ $t('title.privacy_title') }}</span>
              <span class="setting-header__description">{{
                $t('description.privacy_description')
              }}</span>
            </div>
            <MyButton
              :icon="ChevronIcon"
              :is-sidebar-opened="false"
              @click="isPrivacyOptionsVisible = !isPrivacyOptionsVisible"
              :active="isPrivacyOptionsVisible"
            />
          </div>
          <div v-if="isPrivacyOptionsVisible" class="rows-container">
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-title">{{ $t('title.liked_posts_title') }}</span>
                <span class="setting-description">{{
                  $t('description.liked_posts_description')
                }}</span>
              </div>

              <!-- <div class="setting-control setting-control--placeholder">
              </div> -->
              <MySwitcher
                :left-icon="LockedIcon"
                :right-icon="UnlockedIcon"
                v-model="likesVisibility"
              />
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-title">{{ $t('title.rated_posts_title') }}</span>
                <span class="setting-description">{{
                  $t('description.rated_posts_description')
                }}</span>
              </div>

              <MySwitcher
                :left-icon="LockedIcon"
                :right-icon="UnlockedIcon"
                v-model="ratedVisibility"
              />
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-title">{{ $t('title.private_account_title') }}</span>
                <span class="setting-description">{{
                  $t('description.private_account_description')
                }}</span>
              </div>

              <MySwitcher
                :left-icon="LockedIcon"
                :right-icon="UnlockedIcon"
                v-model="profileVisibility"
              />
            </div>
          </div>
        </div>

        <div class="setting-option">
          <div class="setting-option__header">
            <div class="setting-header__wrapper">
              <span class="setting-header__title">{{ $t('title.black_list_title') }}</span>
              <span class="setting-header__description">{{
                $t('description.black_list_description')
              }}</span>
            </div>
            <MyButton :is-sidebar-opened="true">{{ $t('buttons.open') }}</MyButton>
          </div>
        </div>

        <div class="setting-option setting-option--danger">
          <div class="setting-option__header">
            <div class="setting-header__wrapper">
              <span class="setting-header__title setting-header__title--danger">{{
                $t('title.delete_profile_title')
              }}</span>
              <span class="setting-header__description">{{
                $t('description.delete_profile_description')
              }}</span>
            </div>
            <MyButton :is-sidebar-opened="true" color="danger">{{ $t('buttons.delete') }}</MyButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { apiFetch } from '@/api/apiFetch'
import ChevronIcon from '@/assets/icons/ChevronIcon.vue'
import LockedIcon from '@/assets/icons/LockedIcon.vue'
import UnlockedIcon from '@/assets/icons/UnlockedIcon.vue'
import MyButton from '@/components/UI/MyButton.vue'
import MySwitcher from '@/components/UI/MySwitcher.vue'
import { computed, onMounted, reactive, ref, watch, watchEffect } from 'vue'

const isPrivacyOptionsVisible = ref(false)
const isEmailOptionsVisible = ref(false)
const isPassOptionsVisible = ref(false)

const likesVisibility = ref<Boolean | null>(null)
const ratedVisibility = ref<Boolean | null>(null)
const profileVisibility = ref<Boolean | null>(null)

// watchEffect(async () => {
//   const payload = {
//     isPrivate: profileVisibility.value,
//     likedPostsVisibility: likesVisibility.value === true ? 'private' : 'public',
//     ratedPostsVisibility: ratedVisibility.value === true ? 'private' : 'public',
//   }
//   const response = await apiFetch(`/me/privacy`, {
//     method: 'PATCH',
//     body: JSON.stringify(payload),
//   })

//   console.log(response.ok)
// })

const payload = computed(() => {
  return {
    isPrivate: profileVisibility.value,
    likedPostsVisibility: likesVisibility.value === true ? 'private' : 'public',
    ratedPostsVisibility: ratedVisibility.value === true ? 'private' : 'public',
  }
})

watch(
  () => payload.value,
  async () => {
    const response = await apiFetch(`/me/privacy`, {
      method: 'PATCH',
      body: JSON.stringify(payload.value),
    })

    console.log(response.ok)
  },
  { deep: true },
)
onMounted(async () => {
  const response = await apiFetch(`/me/privacy`)

  if (response.ok) {
    const data = await response.json()
    console.log(data)
    data.privacy.isPrivate ? (profileVisibility.value = true) : (profileVisibility.value = false)

    data.privacy.likedPostsVisibility === 'public'
      ? (likesVisibility.value = false)
      : (likesVisibility.value = true)

    data.privacy.ratedPostsVisibility === 'public'
      ? (ratedVisibility.value = false)
      : (ratedVisibility.value = true)
  }
})
</script>

<style scoped lang="scss">
.userdata-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.header {
  border-bottom: 1px solid var(--border-primary);
  padding-bottom: 16px;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.header-title {
  font-size: 34px;
  font-weight: 700;
  letter-spacing: 0.2px;
  color: var(--text-primary);
}

.header-subtitle {
  font-size: 14px;
  color: var(--text-muted);
}

.body {
  width: 100%;
  display: flex;
  justify-content: center;
}

.settings-card {
  width: 100%;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--card-border);
  border-radius: var(--radius-xl);
  background: var(--card-bg);
  box-shadow: var(--card-shadow);
  overflow: hidden;
}
.setting-option {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid var(--card-border);
  &__header {
    display: flex;
    justify-content: space-between;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--card-border);
    padding: 18px 20px;
  }
}
.setting-header__wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.setting-header__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
}
.setting-header__description {
  font-size: 13px;
  color: var(--text-soft);
}
.rows-container {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 0 10px;
}
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 0 20px 18px 20px;
  border-bottom: 1px solid var(--border-muted);
}

.setting-row:last-child {
  border-bottom: none;
}

.setting-option--danger {
  background: var(--danger-soft);
}

.setting-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setting-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
}

.setting-header__title--danger {
  color: var(--danger);
}

.setting-description {
  font-size: 13px;
  color: var(--text-soft);
}

.setting-control {
  flex-shrink: 0;
}

.setting-control--placeholder {
  min-height: 42px;
  min-width: 96px;
  padding: 0 14px;
  border: 1px solid var(--input-border);
  border-radius: var(--radius-sm);
  background: var(--bg-surface-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--text-soft);
}

@media (max-width: 700px) {
  .header-title {
    font-size: 28px;
  }

  .setting-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .setting-control {
    width: 100%;
  }

  .setting-control--placeholder,
  .setting-control--danger {
    width: 100%;
  }
}
</style>
