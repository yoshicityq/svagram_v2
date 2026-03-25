<template>
  <label v-if="props.username" class="avatar" :class="avatarSize">
    <img class="avatar-img" :src="userAvatar" :class="{ preview: avatarUrl }" alt="" />
  </label>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import noAvatar from '@/assets/images/no_avatar.png'
import { getProfileImg } from '@/api/apiData'

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: 'medium',
  },
})

const avatarSize = computed(() => {
  if (props.size === 'small') return 'avatar__small'
  if (props.size === 'medium') return 'avatar__medium'
  if (props.size === 'large') return 'avatar__large'
})

const avatarUrl = ref<string | null>()
const userAvatar = computed(() => avatarUrl.value ?? noAvatar)
watch(
  () => props.username,
  async (newVal) => {
    if (newVal) {
      try {
        avatarUrl.value = await getProfileImg(newVal)
      } catch (e) {
        console.log(e)
      }
    }
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.avatar {
  border: 1px solid #ccc;
  border-radius: 50%;
  overflow: hidden;
  background-color: blueviolet;
  position: relative;

  .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;

    top: 15%;

    right: 0;
    bottom: 0;
  }
}
.preview {
  top: 0 !important;
  left: 0 !important;
}
.avatar__small {
  width: 40px;
  height: 40px;
}
.avatar__medium {
  width: 80px;
  height: 80px;
}
.avatar__large {
  width: 200px;
  height: 200px;
}
</style>
