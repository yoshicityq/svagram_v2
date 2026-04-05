<template>
  <div class="edit-view">
    <div class="header">
      <div class="header-text">
        <span class="header-title">{{ $t('title.edit_title') }}</span>
        <span class="header-subtitle">{{ $t('description.edit_description') }}</span>
      </div>
    </div>

    <div class="body">
      <form @submit.prevent ref="form" class="edit-form">
        <div class="edit-layout">
          <aside class="profile-card avatar-card">
            <div class="card-title">{{ $t('editProfile.avatar') }}</div>

            <div class="avatar-preview-block">
              <label class="avatar" for="file">
                <img
                  class="avatar-img"
                  :src="userAvatar"
                  :class="{ preview: previewAvatar }"
                  alt=""
                />
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
            </div>

            <div class="avatar-actions">
              <MyButton @click.prevent="openFileDialog">
                {{ $t('buttons.upload_avatar') }}
              </MyButton>

              <MyButton>
                {{ $t('buttons.choose_from_posts') }}
              </MyButton>

              <MyButton @click.prevent="deleteAvatar">
                {{ $t('buttons.delete_avatar') }}
              </MyButton>
            </div>
          </aside>

          <section class="profile-card details-card">
            <div class="card-title">{{ $t('editProfile.details') }}</div>

            <div class="userdata">
              <div class="field">
                <label class="field-label">{{ $t('editProfile.username') }}</label>
                <div class="field-control">
                  <MyInput :placeholder="userData?.username!" style="width: 100%" />
                </div>
              </div>

              <div class="field">
                <label class="field-label">{{ $t('editProfile.description') }}</label>
                <div class="field-control">
                  <textarea
                    name="description"
                    v-model="description"
                    :placeholder="description ? '' : $t('placeholder.profile_description')"
                    class="description-text"
                  ></textarea>
                </div>
              </div>

              <div class="field">
                <label class="field-label">{{ $t('editProfile.city') }}</label>
                <div class="field-control">
                  <CitySelect :user-city="userData?.city" v-model="chosenCity" name="city" />
                </div>
              </div>

              <div class="field field--brands">
                <label class="field-label">{{ $t('editProfile.fav_brands') }}</label>

                <div class="field-control">
                  <div class="add-brand">
                    <div v-for="(brand, index) in favoriteBrands" :key="index" class="brand-row">
                      <BrandSelect
                        :model-value="brand"
                        @update:modelValue="updateBrand(index, $event)"
                      />

                      <MyButton
                        v-if="favoriteBrands.length > 1"
                        @click.prevent="removeBrand(index)"
                      >
                        -
                      </MyButton>
                    </div>

                    <div class="brand-actions">
                      <MyButton @click.prevent="addBrandSelect">+</MyButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div class="form-footer">
          <MyButton color="primary" class="submit-btn" @click="sendData">
            {{ $t('buttons.save') }}
          </MyButton>
        </div>
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
  const user = userData.value
  if (user) {
    user.hasAvatar = false
    user.avatarUrl = ''
  }
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
    const data = await getProfileData(authStore.user?.username as string)

    if (data) userData.value = data?.user
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
      const data = await getProfileData(authStore.user?.username as string)
      if (data) userData.value = data.user
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
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  padding-right: 20px;
}

.edit-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.edit-layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.profile-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--card-shadow);
  padding: 20px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 18px;
}

.avatar-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.avatar-preview-block {
  display: flex;
  justify-content: center;
}

.avatar {
  width: 180px;
  height: 180px;
  border: 1px solid var(--accent-border);
  border-radius: 50%;
  overflow: hidden;
  background: var(--bg-surface-secondary);
  position: relative;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px var(--accent-soft);
}

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

.preview {
  top: 0 !important;
  left: 0 !important;
}

.avatar-input {
  display: none;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.details-card {
  min-width: 0;
}

.userdata {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field {
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

.field-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  padding-top: 10px;
}

.field-control {
  min-width: 0;
}

.description-text {
  width: 100%;
  min-height: 110px;
  padding: 12px 14px;
  font-size: 14px;
  line-height: 1.45;
  resize: vertical;
  border: 1px solid var(--input-border);
  border-radius: var(--radius-md);
  background: var(--input-bg);
  color: var(--text-secondary);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.description-text::placeholder {
  color: var(--input-placeholder);
}

.description-text:hover {
  background: var(--input-bg-hover);
  border-color: var(--input-border-hover);
}

.description-text:focus {
  outline: none;
  border-color: var(--input-border-active);
  box-shadow: var(--focus-ring);
}

.add-brand {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.brand-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
}

.brand-actions {
  display: flex;
  justify-content: flex-start;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  min-width: 180px;
}

@media (max-width: 920px) {
  .edit-layout {
    grid-template-columns: 1fr;
  }

  .avatar-card {
    align-items: center;
  }

  .avatar-actions {
    width: 100%;
    max-width: 320px;
  }
}

@media (max-width: 700px) {
  .edit-view {
    padding: 18px 12px 28px;
  }

  .header-title {
    font-size: 28px;
  }

  .profile-card {
    border-radius: var(--radius-lg);
    padding: 16px;
  }

  .field {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .field-label {
    padding-top: 0;
  }

  .form-footer {
    justify-content: stretch;
  }

  .submit-btn {
    width: 100%;
  }
}
</style>
