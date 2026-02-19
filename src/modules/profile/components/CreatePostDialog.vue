<template>
  <Teleport to="#portal">
    <div
      v-show="modalStore.isCreateDialogOpen"
      class="dialog-wrapper"
      @click="modalStore.toggleCreateDialog"
    >
      <form ref="form" @click.stop @submit.prevent="publishPost" class="post-dialog">
        <div class="header">
          <span>Create new post</span>
        </div>
        <div class="body">
          <div class="photo-download">
            <label for="file">
              <img v-if="previewUrl" :src="previewUrl" alt="preview" />
              <span v-else>Click to upload photo</span>
            </label>

            <input id="file" type="file" accept="image/*" name="image" @change="onFileChange" />
          </div>
          <div>
            <div class="photo-description">
              <textarea name="description" placeholder="Write a caption..."></textarea>
            </div>
            <div class="photo-brands">
              <div class="brand-select">
                <span>Hat</span>
                <!-- <SelectBrand v-model="brand_h" name="brand_h" /> -->
                <BrandSelect v-model="brand_h" name="brand_h" />
              </div>
              <div class="brand-select">
                <span>Jacket</span>
                <!-- <SelectBrand v-model="brand_tt" name="brand_tt" /> -->
                <BrandSelect v-model="brand_tt" name="brand_tt" />
              </div>
              <div class="brand-select">
                <span>Top</span>
                <!-- <SelectBrand v-model="brand_t" name="brand_t" /> -->
                <BrandSelect v-model="brand_t" name="brand_t" />
              </div>
              <div class="brand-select">
                <span>Bottom</span>
                <!-- <SelectBrand v-model="brand_b" name="brand_b" /> -->
                <BrandSelect v-model="brand_b" name="brand_b" />
              </div>
              <div class="brand-select">
                <span>Shoes</span>
                <!-- <SelectBrand v-model="brand_s" name="brand_s" /> -->
                <BrandSelect v-model="brand_s" name="brand_s" />
              </div>
            </div>
          </div>
        </div>
        <div class="footer">
          <MyButton type="submit">Share</MyButton>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, watch, useTemplateRef } from 'vue'
import MyButton from '@/components/UI/MyButton.vue'
import useModalStore from '@/stores/modals'
import SelectBrand from './SelectBrand.vue'
import { apiFetch } from '@/api/apiFetch'
import BrandSelect from '@/components/BrandSelect.vue'
const modalStore = useModalStore()

const previewUrl = ref<string | null>(null)
const selectedFile = ref<File | null>(null)

const brand_tt = ref<string>('')
const brand_t = ref<string>('')
const brand_b = ref<string>('')
const brand_s = ref<string>('')
const brand_h = ref<string>('')

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

const form = useTemplateRef('form')
async function publishPost() {
  if (!selectedFile.value) {
    alert('Please select a photo to upload.')
    return
  }

  const formData = new FormData(form.value as HTMLFormElement)
  formData.set('brand_h', brand_h.value)
  formData.set('brand_tt', brand_h.value)
  formData.set('brand_t', brand_h.value)
  formData.set('brand_b', brand_h.value)
  formData.set('brand_s', brand_h.value)

  const response = await apiFetch('/posts/create', {
    method: 'POST',
    body: formData,
  })
  if (response.ok) {
    modalStore.isCreateDialogOpen = false
  } else {
    alert('Не удалось создать пост')
  }
}
// если закрыли модалку — чистим превью (опционально, но удобно)
watch(
  () => modalStore.isCreateDialogOpen,
  (open) => {
    if (!open) {
      selectedFile.value = null
      cleanupPreview()
    }
  },
)

onBeforeUnmount(() => {
  ;(cleanupPreview(), (modalStore.isCreateDialogOpen = false))
})
</script>

<style scoped lang="scss">
.dialog-wrapper {
  position: fixed;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 21;
}
.post-dialog {
  width: 600px;
  height: auto;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  padding: 10px;
  align-items: center;
  border: 2px solid blueviolet;
  border-radius: 10px;
}
.header {
  width: 100%;
  height: 50px;
  border-bottom: 1px solid blueviolet;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 500;
}
.body {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: start;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
  margin-top: 20px;
}
.photo-download {
  width: 100%;
  label {
    width: 100%;
    height: 300px;
    border: 2px dashed #c0c0c0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #a0a0a0;
    font-size: 18px;
    cursor: pointer;
  }

  input {
    display: none;
  }
}
.photo-description {
  width: 100%;
  textarea {
    min-width: 200px;
    min-height: 75px;
    border: 1px solid #c0c0c0;
    border-radius: 7px;
    padding: 5px;
    font-size: 13px;
    resize: none;
  }
  textarea:focus {
    outline: none;
    border-color: #808080;
  }
}
.photo-download {
  width: 100%;

  label {
    width: 100%;
    height: 300px;
    border: 2px dashed #c0c0c0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #a0a0a0;
    font-size: 18px;
    cursor: pointer;
    overflow: hidden; // чтобы картинка не вылезала
  }

  label img {
    width: 100%;
    height: 100%;
    object-fit: cover; // красиво заполняет область
    display: block;
  }

  input {
    display: none;
  }
}
.photo-brands {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex-wrap: wrap;
  .brand-select {
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-size: 14px;
    span {
      font-weight: 500;
    }
  }
}
</style>
