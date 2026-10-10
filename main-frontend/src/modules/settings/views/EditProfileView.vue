<template>
  <div class="edit-view">
    <div class="header">
      <div class="header-text">
        <span class="header-title">{{ $t('title.edit_title') }}</span>
        <span class="header-subtitle">{{ $t('description.edit_description') }}</span>
      </div>
    </div>

    <div class="body">
      <form @submit.prevent="sendData" ref="form" class="edit-form">
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

              <MyButton @click.prevent="openAvatarList">
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
              <div class="field" :class="{ 'field--error': errors.username }">
                <label class="field-label">
                  {{ $t('editProfile.username') }}
                </label>

                <div class="field-control">
                  <MyInput
                    name="username"
                    v-model="username"
                    v-bind="usernameAttrs"
                    :placeholder="userData?.username!"
                    style="width: 100%"
                  />

                  <Transition name="error-fade">
                    <div v-if="errors.username" class="field-error">
                      {{ errors.username }}
                    </div>
                  </Transition>
                </div>
              </div>

              <div class="field">
                <label class="field-label">
                  {{ $t('editProfile.description') }}
                </label>

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
                <label class="field-label">
                  {{ $t('editProfile.city') }}
                </label>

                <div class="field-control">
                  <CitySelect :user-city="userData?.city" v-model="chosenCity" name="city" />
                </div>
              </div>

              <div class="field">
                <label class="field-label">
                  {{ $t('editProfile.title') }}
                </label>

                <div class="field-control">
                  <TitleSelect v-model="title" />
                </div>
              </div>

              <div class="field field--brands">
                <label class="field-label">
                  {{ $t('editProfile.fav_brands') }}
                </label>

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
                        class="brand-row_remove-btn"
                      >
                        -
                      </MyButton>
                    </div>

                    <div class="brand-actions">
                      <MyButton @click.prevent="addBrandSelect()">+</MyButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div class="form-footer">
          <MyButton type="submit" color="primary" class="submit-btn">
            {{ $t('buttons.save') }}
          </MyButton>
        </div>
      </form>
    </div>
  </div>

  <AvatarListModal
    :username="userData?.username!"
    @select="chooseFromPosts($event.content.imageUrl)"
  />
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'
import { useI18n } from 'vue-i18n'

import BrandSelect from '@/components/BrandSelect.vue'
import CitySelect from '@/components/CitySelect.vue'
import MyButton from '@/components/UI/MyButton.vue'
import MyInput from '@/components/UI/MyInput.vue'

import noAvatar from '@/assets/images/no_avatar.png'

import useAuthStore from '@/stores/auth'
import useModalStore from '@/stores/modals'

import { apiFetch } from '@/api/apiFetch'
import { getProfileData, getProfileImg } from '@/api/apiData'

import type { User } from '@/types/user'

import TitleSelect from '../components/TitleSelect.vue'
import AvatarListModal from '../components/AvatarListModal.vue'

const authStore = useAuthStore()
const modalStore = useModalStore()

const { t } = useI18n()

const userData = ref<User | null>(null)

const previewAvatar = ref<string | null | undefined>(null)
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const form = useTemplateRef('form')

const chosenCity = ref<string>('')
const favoriteBrands = ref<string[]>([''])
const description = ref('')

type Title = {
  id: number
  titleName: string
}

const title = ref<Title | null>(null)

/*
|--------------------------------------------------------------------------
| Username validation
|--------------------------------------------------------------------------
*/

const { errors, defineField, validate } = useForm({
  validationSchema: toTypedSchema(
    yup.object({
      username: yup
        .string()
        .required(t('validation.required'))
        .min(4, t('validation.username_length'))
        .test('unique-username', t('validation.username_not_available'), async (value: string) => {
          if (!value || value.length < 4) {
            return true
          }

          // Если username не изменился,
          // проверять его на уникальность не нужно.
          if (value === userData.value?.username) {
            return true
          }

          try {
            const response = await apiFetch(`/users/check-username/${encodeURIComponent(value)}`)

            const data = await response.json()

            return data.isAvailable
          } catch (e) {
            console.error(e)

            // Такое же поведение, как у тебя на регистрации:
            // ошибка запроса сама по себе не блокирует форму.
            return true
          }
        }),
    }),
  ),
})

const [username, usernameAttrs] = defineField('username', {
  validateOnModelUpdate: false,
})

/*
|--------------------------------------------------------------------------
| Avatar
|--------------------------------------------------------------------------
*/

const userAvatar = computed(() => {
  if (!previewAvatar.value) {
    if (userData.value?.hasAvatar) {
      return `http://localhost:3000${userData.value.avatarUrl}`
    }

    return noAvatar
  }

  return previewAvatar.value
})

async function chooseFromPosts(url: string) {
  cleanupPreview()

  previewAvatar.value = `http://localhost:3000${url}`
  selectedFile.value = await createFileFromUrl(url)
}

async function createFileFromUrl(url: string) {
  const response = await apiFetch(url)

  const blob = await response.blob()

  const file = new File([blob], 'image.jpg', {
    type: 'image/jpeg',
  })

  return file
}

function openFileDialog() {
  fileInput.value?.click()
}

async function deleteAvatar() {
  cleanupPreview()

  await apiFetch('/me/avatar', {
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
    if (previewAvatar.value.startsWith('blob:')) {
      URL.revokeObjectURL(previewAvatar.value)
    }

    previewAvatar.value = null
  }
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement

  const file = input.files?.[0] ?? null

  if (!file) {
    return
  }

  if (!file.type.startsWith('image/')) {
    return
  }

  selectedFile.value = file

  cleanupPreview()

  previewAvatar.value = URL.createObjectURL(file)
}

/*
|--------------------------------------------------------------------------
| Favorite brands
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Avatar modal
|--------------------------------------------------------------------------
*/

function openAvatarList() {
  modalStore.toggleAvatarModal()
}

/*
|--------------------------------------------------------------------------
| Save profile
|--------------------------------------------------------------------------
*/

async function sendData() {
  const result = await validate()

  if (!result.valid) {
    return
  }

  const formData = new FormData(form.value as HTMLFormElement)

  /*
   * Явно добавляем username.
   */
  if (username.value) {
    formData.set('username', username.value)
  }

  if (chosenCity.value) {
    formData.set('city', chosenCity.value)
  }

  formData.set('description', description.value)

  const uniqueBrands = new Set(favoriteBrands.value)
  const favoriteBrandsString = JSON.stringify([...uniqueBrands])

  formData.set('favoriteBrands', favoriteBrandsString)

  /*
   * Если тебе здесь нужно отправлять выбранный avatar,
   * можно раскомментировать:
   */

  // if (selectedFile.value) {
  //   formData.set('profile_img', selectedFile.value)
  // }

  const response = await apiFetch('/users/me', {
    method: 'PATCH',
    body: formData,
  })

  if (!response.ok) {
    console.error('Failed to update user:', response.status)

    return
  }

  alert('Данные обновились успешно')

  /*
   * Важно:
   * здесь используем новый username,
   * потому что старый authStore.user?.username
   * после PATCH уже может быть неактуальным.
   */
  if (!username.value) return
  const data = await getProfileData(username.value)

  if (data) {
    userData.value = data.user
  }

  previewAvatar.value = await getProfileImg(username.value)

  if (userData.value) {
    username.value = userData.value.username

    description.value = userData.value.description ?? ''

    chosenCity.value = userData.value.city ?? ''

    favoriteBrands.value = userData.value.favorite_brands
  }
}

/*
|--------------------------------------------------------------------------
| Initial user loading
|--------------------------------------------------------------------------
*/

watch(
  () => userData.value,
  async () => {
    if (!userData.value) {
      const data = await getProfileData(authStore.user?.username as string)

      if (data) {
        userData.value = data.user

        previewAvatar.value = await getProfileImg(authStore.user?.username as string)

        if (userData.value.title) {
          title.value = {
            id: userData.value.title.id,
            titleName: userData.value.title.titleName,
          }
        } else {
          title.value = null
        }
      }

      if (userData.value) {
        username.value = userData.value.username

        description.value = userData.value.description ?? ''

        chosenCity.value = userData.value.city ?? ''

        favoriteBrands.value = userData.value.favorite_brands ?? []
      }
    }
  },
  {
    immediate: true,
    deep: true,
  },
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
  background: #f6f2fd;
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

.field-error {
  margin-top: 5px;
  font-size: 12px;
  line-height: 1.3;
  color: var(--danger);
}

.field--error {
  :deep(input) {
    border-color: var(--danger);
  }
}

.error-fade-enter-active,
.error-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.error-fade-enter-from,
.error-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
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
  // gap: 8px;
  align-items: center;
}

.brand-row_remove-btn {
  margin-left: 8px;
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
