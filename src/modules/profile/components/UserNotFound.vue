<template>
  <div class="profile-view">
    <div class="not-found">
      <SadSmileIcon />
      <h2 class="not-found-title">{{ $t('profilePage.user_not_found') }}</h2>
      <p class="not-found-text">{{ $t('profilePage.user_not_found_hint') }}</p>
      <MyButton @click="router.push('/feed')">
        {{ $t('buttons.go_to_feed') }}
      </MyButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import SadSmileIcon from '@/assets/icons/SadSmileIcon.vue'
import MyButton from '@/components/UI/MyButton.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped lang="scss">
.profile-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
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
</style>
