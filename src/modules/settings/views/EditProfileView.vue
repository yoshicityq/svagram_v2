<template>
  <div class="edit-view">
    <div class="header">
      <span class="header-title">{{ $t('editProfile.page_title') }}</span>
    </div>

    <div class="body">
      <form @submit.prevent ref="form" class="body_form">
        <div class="avatar-actions">
          <label class="avatar" for="file">
            <img class="avatar-img" :src="userAvatar" :class="{ preview: previewAvatar }" alt="" />
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
            <MyButton @click.prevent="openFileDialog">{{ $t('buttons.upload_avatar') }}</MyButton>
            <MyButton>{{ $t('buttons.choose_from_posts') }}</MyButton>
            <MyButton @click.prevent="deleteAvatar">{{ $t('buttons.delete_avatar') }}</MyButton>
          </div>
        </div>

        <div class="userdata">
          <div class="stat">
            <span class="stat-name">{{ $t('editProfile.username') }}</span>
            <div class="stat-value">
              <MyInput :placeholder="userData?.username!" style="width: 100%" />
            </div>
          </div>

          <div class="stat">
            <span class="stat-name">{{ $t('editProfile.description') }}</span>
            <textarea
              name="description"
              v-model="description"
              :placeholder="description ? '' : $t('placeholder.profile_description')"
              class="description-text"
            ></textarea>
          </div>

          <div class="stat">
            <span class="stat-name">City</span>
            <CitySelect :user-city="userData?.city" v-model="chosenCity" name="city" />
          </div>

          <div class="stat">
            <span class="stat-name">{{ $t('editProfile.fav_brands') }}</span>

            <div class="add-brand">
              <div v-for="(brand, index) in favoriteBrands" :key="index" class="brand-row">
                <BrandSelect :model-value="brand" @update:modelValue="updateBrand(index, $event)" />

                <MyButton v-if="favoriteBrands.length > 1" @click.prevent="removeBrand(index)">
                  -
                </MyButton>
              </div>

              <MyButton @click.prevent="addBrandSelect">+</MyButton>
            </div>
          </div>
        </div>

        <MyButton color="primary" class="submit_btn" @click="sendData">{{
          $t('buttons.save')
        }}</MyButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import BrandSelect from '@/components/BrandSelect.vue'
import CitySelect from '@/components/CitySelect.vue'
import MyButton from '@/components/UI/MyButton.vue'
import MyInput from '@/components/UI/MyInput.vue'
import { computed, ref, useTemplateRef, watch } from 'vue'
import noAvatar from '@/assets/images/no_avatar.png'
import useAuthStore from '@/stores/auth'
import { apiFetch } from '@/api/apiFetch'
import MyAvatar from '@/components/MyAvatar.vue'
import type { User } from '@/types/user'
import { getProfileData, getProfileImg } from '@/api/apiData'

const authStore = useAuthStore()
const userData = ref<User | null>(null)
const previewAvatar = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const form = useTemplateRef('form')

const chosenCity = ref<string>('')
const favoriteBrands = ref<string[]>([''])
const description = ref('')

const userAvatar = computed(() => {
  if (!previewAvatar.value) {
    if (userData.value?.hasAvatar) {
      return `http://localhost:3000${userData.value.avatarUrl}`
    }
    return noAvatar
  }

  return previewAvatar.value
})

function openFileDialog() {
  fileInput.value?.click()
}

async function deleteAvatar() {
  cleanupPreview()
  const response = await apiFetch('/me/avatar', {
    method: 'DELETE',
    credentials: 'include',
  })
  const data = await response.json()
  console.log(data)
}

function cleanupPreview() {
  if (previewAvatar.value) {
    URL.revokeObjectURL(previewAvatar.value)
    previewAvatar.value = null
  }
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  if (!file) return
  if (!file.type.startsWith('image/')) return

  selectedFile.value = file
  cleanupPreview()
  previewAvatar.value = URL.createObjectURL(file)
}

function addBrandSelect() {
  favoriteBrands.value.push('')
}

function updateBrand(index: number, brand: string) {
  favoriteBrands.value[index] = brand
}

function removeBrand(index: number) {
  favoriteBrands.value.splice(index, 1)

  if (!favoriteBrands.value.length) {
    favoriteBrands.value.push('')
  }
}

async function sendData() {
  const formData = new FormData(form.value as HTMLFormElement)

  if (selectedFile.value) {
    formData.set('profile_img', selectedFile.value)
  }

  if (chosenCity.value) {
    formData.set('city', chosenCity.value)
  }

  formData.set('description', description.value)

  const favoriteBrandsString = favoriteBrands.value
    .map((brand) => brand.trim())
    .filter(Boolean)
    .join(', ')

  formData.set('favorite_brands', favoriteBrandsString)

  const response = await apiFetch('/me', {
    method: 'PATCH',
    body: formData,
  })

  if (response.ok) {
    alert('Данные обновились успешно')
    userData.value = await getProfileData(authStore.user?.username as string)
    previewAvatar.value = await getProfileImg(authStore.user?.username as string)

    if (userData.value) {
      description.value = userData.value.description ?? ''
      chosenCity.value = userData.value.city ?? ''
      favoriteBrands.value = userData.value.favorite_brands.split(', ')
    }
  }
}

watch(
  () => userData.value,
  async () => {
    if (!userData.value) {
      userData.value = await getProfileData(authStore.user?.username as string)
      previewAvatar.value = await getProfileImg(authStore.user?.username as string)

      if (userData.value) {
        description.value = userData.value.description ?? ''
        chosenCity.value = userData.value.city ?? ''
        favoriteBrands.value = userData.value.favorite_brands.split(', ')
      }
    }
  },
  { immediate: true, deep: true },
)
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

.body {
  display: flex;
  justify-content: center;
}

.body_form {
  margin-top: 20px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: fit-content;
}

.avatar-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  border: 1px solid blueviolet;
  border-radius: 7px;
  padding: 15px;
  width: 400px;
  justify-content: space-between;

  .btns {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}

.avatar {
  width: 175px;
  height: 175px;
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
    top: 20px;
    left: 2px;
    right: 0;
    bottom: 0;
  }
}

.preview {
  top: 0 !important;
  left: 0 !important;
}

.avatar-input {
  display: none;
}

.userdata {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  border: 1px solid blueviolet;
  width: 100%;
  max-width: 400px;
  padding: 15px;
  border-radius: 7px;
  gap: 10px;
}

.stat {
  display: flex;
  gap: 20px;
  width: 100%;

  &-name {
    width: 150px !important;
  }

  &-value {
    width: 100%;
    max-width: 200px;
  }
}

.city-select {
  width: 100%;
  max-width: 200px;
}

.submit_btn {
  margin-top: 20px;
}

.description-text {
  min-width: 200px;
  min-height: 75px;
  padding: 3px;
  font-size: 13px;
  resize: none;
  border: 2px solid rgba(86, 86, 86, 0.34);
  border-radius: 3px;
}

.description-text:focus {
  outline: none;
  border: 2px solid blueviolet;
  border-radius: 3px;
}

.add-brand {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 200px;
}

.brand-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
