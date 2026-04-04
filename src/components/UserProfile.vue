<template>
  <div class="user-profile">
    <button class="user-info" type="button" @click="goToProfile">
      <MyAvatar :username="username" size="small" class="user-info__avatar" />

      <span v-show="isClosable" class="user-nickname">
        {{ username }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import useSidebarStore from '@/stores/sidebar'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import MyAvatar from './MyAvatar.vue'

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
  closable: {
    type: Boolean,
    default: false,
  },
})

const sidebarStore = useSidebarStore()
const router = useRouter()

const isClosable = computed(() => {
  return props.closable ? sidebarStore.isOpen : true
})

function goToProfile() {
  router.push({ name: 'Profile', params: { username: props.username } })
}
</script>

<style scoped lang="scss">
.user-profile {
  width: fit-content;
  min-width: 0;
}

.user-info {
  width: 100%;
  min-height: 48px;
  padding: 8px 10px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  text-align: left;
  transition:
    background-color 0.18s ease,
    transform 0.12s ease;
}

.user-info:hover {
  background: var(--sidebar-item-hover);
}

.user-info:active {
  transform: scale(0.99);
}

.user-info:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.user-info__avatar {
  flex-shrink: 0;
  cursor: pointer;
}

.user-nickname {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

@media (max-width: 900px) {
  .user-info {
    min-height: 44px;
  }
}
</style>
