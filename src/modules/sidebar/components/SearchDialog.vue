<template>
  <div v-if="sidebarStore.isSearchActive" class="search">
    <div class="input-wrapper">
      <MyInput placeholder="Search..." class="input" v-model="inputVal" />
      <CrossIcon class="icon" @click="sidebarStore.toggleSearch" />
    </div>
    <div v-show="isUsersFound" class="found_users">
      <UserProfile v-for="user in users" :username="user" :key="user" />
    </div>
    <div v-show="!isUsersFound && inputVal" style="margin-top: 10px">Nothing Found</div>
  </div>
</template>

<script setup lang="ts">
import { apiFetch } from '@/api/apiFetch'
import CrossIcon from '@/assets/icons/CrossIcon.vue'
import MyInput from '@/components/UI/MyInput.vue'
import UserProfile from '@/components/UserProfile.vue'
import useSidebarStore from '@/stores/sidebar'
import { ref, watch } from 'vue'

const sidebarStore = useSidebarStore()
let inputVal = ref('')
let users = ref([])
let isUsersFound = ref<null | boolean>(null)
async function searchUsers(stroke: string) {
  const safe = encodeURIComponent(stroke.trim())
  const response = await apiFetch(`/users/search/${safe}`)
  const data = await response.json()
  users.value = data.usernames
  if (users.value !== undefined && users.value.length > 0) {
    isUsersFound.value = true
  } else {
    isUsersFound.value = false
  }
}
function debounce(targetFn: Function, timeoutMs: number) {
  let timer: number
  return (...args: any) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      targetFn(...args)
    }, timeoutMs)
  }
}
const debouncedSearchUsers = debounce(async (newVal: string) => {
  await searchUsers(newVal)
}, 1000)

watch(
  () => inputVal.value,
  (newVal) => {
    debouncedSearchUsers(newVal)
  },
)
</script>

<style scoped lang="scss">
.input-wrapper {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  width: 100%;
}
.icon {
  width: 10px;
  cursor: pointer;
}
.found_users {
  margin-top: 10px;
}
</style>
