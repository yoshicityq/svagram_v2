<template>
  <div class="edit-view">
    <div class="header">
      <span class="header-title">Edit Profile</span>
    </div>
    <form ref="form" @submit.prevent="sendData" class="form">
      <div class="stats-list">
        <div class="stat">
          <span class="stat-name">Avatar:</span>
          <div class="avatar-actions">
            <label class="avatar" for="file">
              <img class="avatar-img" :src="previewUrl ? previewUrl : userAvatar" alt="" />
            </label>
            <input
              ref="fileInput"
              type="file"
              id="file"
              name="profile_img"
              accept="image/*"
              class="avatar-input"
              @change="onFileChange"
            />
            <div class="btns">
              <button type="button" @click="openFileDialog">Upload new avatar</button>
              <button>Choose from posts</button>
              <button type="button" @click="deleteAvatar">Delete avatar</button>
            </div>
          </div>
        </div>
        <div class="stat">
          <span class="stat-name">Username:</span>
          <input class="city-text" name="username" type="text" :placeholder="userData?.username" />
        </div>
        <div class="stat">
          <span class="stat-name">Description:</span>
          <textarea
            class="description-text"
            :placeholder="userData?.description || 'Type smth'"
            name="description"
          ></textarea>
        </div>
        <div class="stat">
          <span class="stat-name">City:</span>
          <CitySelect v-model="chosenCity"/>
        </div>
        <div class="stat">
          <span class="stat-name">Favorite Brands:</span>
          <div class="brands">
            <div v-for="n in count" class="brand-item">
              <BrandSelect />
              <button v-if="n !== 1" @click="count--">-</button>
            </div>
            <button type="button" @click="count++">+</button>
          </div>
        </div>
      </div>
      <button type="submit"">Submit Changes</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { apiFetch } from '@/api/apiFetch'
import noAvatar from '@/assets/images/no_avatar.png'
import BrandSelect from '@/components/BrandSelect.vue'
import CitySelect from '@/components/CitySelect.vue'
import useAuthStore from '@/stores/auth'
import { computed, onBeforeMount, onMounted, ref, useTemplateRef } from 'vue'
type User = {
  id: string | number
  username: string
  city: string
  description: string
  hasAvatar: boolean
  avatarUrl: string
}
let count = ref(1)
const userData = ref<User>()

const userAvatar = computed(() =>
  userData.value?.hasAvatar ? `http://localhost:3000${userData.value.avatarUrl}` : noAvatar,
)
const previewUrl = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>()
  const chosenCity = ref<string>('')
function openFileDialog() {
  fileInput.value?.click()
}
function deleteAvatar() {
  cleanupPreview()
  ;async () => {
    const response = await apiFetch(`/me/avatar`, { method: 'DELETE' })
    const data = await response.json()
    console.log(data)
  }
}

function cleanupPreview() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  if (!file) return

  // можно дополнительно проверить тип
  if (!file.type.startsWith('image/')) return

  selectedFile.value = file

  // освобождаем старый превью и создаём новый
  cleanupPreview()
  previewUrl.value = URL.createObjectURL(file)
}
const authStore = useAuthStore()
const form = useTemplateRef('form')

async function sendData() {

  const formData = new FormData(form.value as HTMLFormElement)

  if (selectedFile.value) {
    formData.set('profile_img', selectedFile.value)
  }

  const response = await apiFetch('/me', {
    method: 'PATCH',
    body: formData,
  })

  const data = await response.json()
  console.log(data)

  if (response.ok) {
    userData.value = data.user
    selectedFile.value = null
    cleanupPreview()
  } else {
    alert(data.message || 'Update failed')
  }
  await getProfileImg()
}
async function getProfileData() {
  const response = await apiFetch(`/users/${authStore.user?.username}`)
  const data = await response.json()
  userData.value = data.user
}
async function getProfileImg() {
    const res = await apiFetch(`/users/${authStore.user?.username}/avatar`)
    const blob = await res.blob()
    previewUrl.value = URL.createObjectURL(blob)
    console.log(previewUrl.value)
}


onBeforeMount(async () => {
  await getProfileData()
  await getProfileImg()
})
</script>

<style scoped lang="scss">
.edit-view {
  flex: 1;
}
.header {
  border-bottom: 1px solid #ccc;

  .header-title {
    font-size: 40px;
    font-weight: 600;
    letter-spacing: 1px;
  }
}

.form {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  .stat {
    display: flex;
    gap: 10px;
    .stat-name {
      width: 200px;
      text-align: end;
    }
  }
}

.brands {
  display: flex;
  flex-direction: column;
  gap: 10px;
  .brand-item {
    display: flex;
    gap: 5px;
  }
}
.avatar-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  .btns {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
}
.avatar {
  width: 100px;
  height: 100px;
  border: 1px solid #ccc;
  border-radius: 50%;
  overflow: hidden;
  .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
.avatar-input {
  display: none;
}
.description-text {
  min-width: 200px;
  min-height: 75px;
  padding: 3px;
  font-size: 13px;
  resize: none;
}
.description-text:focus {
  outline: none;
}

.city-text {
  width: 200px;
  padding: 3px;
}
.city-text:focus {
  outline: none;
}
</style>
