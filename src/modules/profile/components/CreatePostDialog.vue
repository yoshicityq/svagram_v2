<template>
  <Teleport to="#portal">
    <div v-show="modalStore.isCreateDialogOpen" class="dialog-wrapper">
      <form ref="form" @submit.prevent="publishPost" class="post-dialog">
        <div class="header">
          <span>{{ $t('modals.create_new_post') }}</span>
          <CrossIcon class="icon" @click="closeWindow" />
        </div>
        <div class="body">
          <div class="photo-download">
            <label for="file">
              <img v-if="previewUrl" :src="previewUrl" alt="preview" />
              <span v-else>{{ $t('modals.upload_photo') }}</span>
            </label>

            <input id="file" type="file" accept="image/*" name="image" @change="onFileChange" />
          </div>
          <div>
            <div class="photo-description">
              <textarea
                name="description"
                :placeholder="$t('placeholder.photo_capture')"
              ></textarea>
            </div>
            <div class="add_brands">
              <div v-for="(brand, index) in addedBrands" :key="index" class="block-row">
                <CategoryBrandBlock
                  :category-obj="brand"
                  @update:category-name="updateCategoryName(index, $event)"
                  @update:category-val="updateCategoryBrand(index, $event)"
                />
                <MyButton @click.prevent="removeBlock(index)"> - </MyButton>
              </div>
              <MyButton type="button" @click="addBlock">{{ $t('buttons.add_brand') }}</MyButton>
            </div>
          </div>
        </div>
        <div class="footer">
          <MyButton type="submit">{{ $t('buttons.share') }}</MyButton>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, watch, useTemplateRef, reactive } from 'vue'
import MyButton from '@/components/UI/MyButton.vue'
import useModalStore from '@/stores/modals'
import SelectBrand from './SelectBrand.vue'
import { apiFetch } from '@/api/apiFetch'
import CategoryBrandBlock from './CategoryBrandBlock.vue'
import type { BrandCategory } from '@/types/category'
import CrossIcon from '@/assets/icons/CrossIcon.vue'

const modalStore = useModalStore()

const categoryObj_default: BrandCategory = {
  id: null,
  categoryName: '',
  categoryValue: '',
}

const previewUrl = ref<string | null>(null)
const selectedFile = ref<File | null>(null)

let addedBrands = reactive<Array<BrandCategory>>([])
function addBlock() {
  let categoryObj = structuredClone(categoryObj_default)
  if (!addedBrands.length) categoryObj.id = 1
  else categoryObj.id = addedBrands.length + 1
  addedBrands.push(categoryObj)
}
function updateCategoryName(index: number, val: string) {
  if (addedBrands.length && addedBrands[index]) {
    addedBrands[index].categoryName = val
  }
}
function updateCategoryBrand(index: number, val: string) {
  if (addedBrands.length && addedBrands[index]) {
    addedBrands[index].categoryValue = val
  }
}
function removeBlock(index: number) {
  addedBrands.splice(index, 1)
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

const form = useTemplateRef('form')
async function publishPost() {
  if (!selectedFile.value) {
    alert('Please select a photo to upload.')
    return
  }

  const formData = new FormData(form.value as HTMLFormElement)

  addedBrands.forEach((item) => {
    formData.set(item.categoryName, item.categoryValue)
  })

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
function closeWindow() {
  modalStore.toggleCreateDialog()
  addedBrands.splice(0, addedBrands.length)
}
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
  justify-content: space-between;
  font-size: 20px;
  font-weight: 500;

  span {
    margin-left: auto;
    margin-right: auto;
  }

  .icon {
    cursor: pointer;
    width: 15px;
  }
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
.add_brands {
  width: 100%;
}
.block-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
