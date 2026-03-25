<template>
  <div v-if="sidebarStore.isSearchActive" class="search">
    <div class="input-wrapper">
      <MyInput :placeholder="$t('placeholder.search')" class="input" v-model="inputVal" />
      <CrossIcon class="icon" @click="sidebarStore.toggleSearch" />
    </div>
    <div v-if="loading" class="loader-wrapper">
      <MyLoader />
    </div>
    <div>
      <div v-show="isUsersFound" class="found_users">
        <UserProfile v-for="user in users" :username="user" :key="user" />
      </div>
      <div v-show="!isUsersFound && inputVal && !loading" style="margin-top: 10px">
        {{ $t('helpers.nothing_found') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { apiFetch } from '@/api/apiFetch'
import CrossIcon from '@/assets/icons/CrossIcon.vue'
import MyLoader from '@/components/MyLoader.vue'
import MyInput from '@/components/UI/MyInput.vue'
import UserProfile from '@/components/UserProfile.vue'
import useSidebarStore from '@/stores/sidebar'
import { ref, watch } from 'vue'

const sidebarStore = useSidebarStore()
let inputVal = ref('')
let users = ref([])
let isUsersFound = ref<null | boolean>(true)
const loading = ref(false)
async function searchUsers(stroke: string) {
  const safe = encodeURIComponent(stroke.trim())
  loading.value = true
  try {
    const response = await apiFetch(`/users/search/${safe}`)
    const data = await response.json()
    users.value = data.usernames
    if (users.value !== undefined && users.value.length > 0) {
      isUsersFound.value = true
    } else {
      isUsersFound.value = false
    }
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
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
    loading.value = true
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
.loader-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
</style>
