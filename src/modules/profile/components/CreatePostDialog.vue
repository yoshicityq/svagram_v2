<template>
  <Teleport to="#portal">
    <div v-show="modalStore.isCreateDialogOpen" class="dialog-overlay" @click.self="closeWindow">
      <form ref="form" @submit.prevent="publishPost" class="dialog-card">
        <div class="dialog-header">
          <h2 class="dialog-title">{{ $t('modals.create_new_post') }}</h2>

          <button type="button" class="icon-button" @click="closeWindow" aria-label="Close dialog">
            <CrossIcon class="icon" />
          </button>
        </div>

        <div class="dialog-body">
          <div class="dialog-column dialog-column--left">
            <div class="upload-section">
              <label for="file" class="upload-area">
                <img v-if="previewUrl" :src="previewUrl" alt="preview" class="upload-preview" />
                <div v-else class="upload-placeholder">
                  <span class="upload-title">{{ $t('modals.upload_photo') }}</span>
                  <span class="upload-subtitle">JPG, PNG, WEBP</span>
                </div>
              </label>

              <input id="file" type="file" accept="image/*" name="image" @change="onFileChange" />
            </div>
          </div>

          <div class="dialog-column dialog-column--right">
            <div class="form-section">
              <label class="section-label" for="description">
                {{ $t('placeholder.photo_capture') }}
              </label>

              <textarea
                id="description"
                name="description"
                class="text-input"
                :placeholder="$t('placeholder.photo_capture')"
              ></textarea>
            </div>

            <div class="form-section brands-section">
              <div class="section-head">
                <span class="section-label">{{ $t('buttons.add_brand') }}</span>
                <MyButton type="button" @click="addBlock">
                  {{ $t('buttons.add_brand') }}
                </MyButton>
              </div>

              <div v-if="addedBrands.length" class="brands-list">
                <div
                  v-for="(brand, index) in addedBrands"
                  :key="brand.id ?? index"
                  class="brand-row"
                >
                  <CategoryBrandBlock
                    :category-obj="brand"
                    @update:category-name="updateCategoryName(index, $event)"
                    @update:category-val="updateCategoryBrand(index, $event)"
                  />
                  <MyButton type="button" class="remove-btn" @click.prevent="removeBlock(index)">
                    −
                  </MyButton>
                </div>
              </div>

              <div v-else class="brands-empty">
                {{ $t('helpers.add_few_brands') }}
              </div>
            </div>
          </div>
        </div>

        <div class="dialog-footer">
          <MyButton type="button" @click="closeWindow"> {{ $t('buttons.cancel') }} </MyButton>
          <MyButton type="submit">
            {{ $t('buttons.share') }}
          </MyButton>
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
function findMatchingCategory(categoryName: string, categoryVal: string, index: number) {
  const values: Array<String> = [categoryVal]
  let start = index + 1
  for (start; start < addedBrands.length; start++) {
    const currentObj = addedBrands[start]

    if (currentObj && currentObj.categoryName === categoryName) {
      values.push(currentObj.categoryValue)
    }
  }
  return { categoryName: categoryName, categoryVal: values.join(', ') }
}
const form = useTemplateRef('form')
async function publishPost() {
  if (!selectedFile.value) {
    alert('Please select a photo to upload.')
    return
  }

  const formData = new FormData(form.value as HTMLFormElement)
  const processedCategories: string[] = []

  for (let i = 0; i < addedBrands.length; i++) {
    const currentObj = addedBrands[i]
    if (currentObj) {
      if (processedCategories.includes(currentObj.categoryName)) continue
      processedCategories.push(currentObj.categoryName)

      const resultObj = findMatchingCategory(currentObj.categoryName, currentObj.categoryValue, i)
      formData.set(resultObj.categoryName, resultObj.categoryVal)
    }
  }

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
.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 21;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--bg-overlay);
  backdrop-filter: blur(4px);
}

.dialog-card {
  width: min(960px, 100%);
  max-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid var(--border-primary);
  background: var(--card-bg);
}

.dialog-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.icon-button {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: var(--radius-xs);
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    background: var(--sidebar-item-hover);
  }

  &:active {
    transform: scale(0.96);
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }

  .icon {
    width: 16px;
    height: 16px;
    color: var(--icon-primary);
  }
}

.dialog-body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(280px, 380px) minmax(320px, 1fr);
  gap: 24px;
  padding: 20px;
  overflow: auto;
}

.dialog-column {
  min-width: 0;
}

.dialog-column--left {
  display: flex;
}

.dialog-column--right {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.upload-section {
  width: 100%;
}

.upload-area {
  width: 100%;
  aspect-ratio: 1 / 1;
  border: 2px dashed var(--accent-border);
  border-radius: var(--radius-lg);
  background: var(--bg-surface-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    border-color: var(--accent);
    background: var(--bg-surface-tertiary);
  }
}

.upload-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 20px;
  text-align: center;
}

.upload-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
}

.upload-subtitle {
  font-size: 13px;
  color: var(--text-muted);
}

input[type='file'] {
  display: none;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

.text-input {
  width: 100%;
  min-height: 75px;
  padding: 12px 14px;
  border: 1px solid var(--input-border);
  border-radius: var(--radius-md);
  background: var(--input-bg);
  font-size: 14px;
  line-height: 1.45;
  color: var(--text-secondary);
  resize: vertical;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;

  &::placeholder {
    color: var(--input-placeholder);
  }

  &:hover {
    background: var(--input-bg-hover);
    border-color: var(--input-border-hover);
  }

  &:focus {
    outline: none;
    border-color: var(--input-border-active);
    box-shadow: var(--focus-ring);
  }
}

.brands-section {
  flex: 1;
  min-height: 0;
}

.brands-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 280px;
  padding-right: 4px;
}

.brand-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: start;
  padding: 10px;
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  background: var(--bg-surface-secondary);
}

.remove-btn {
  min-width: 40px;
  height: 40px;
  align-self: center;
}

.brands-empty {
  padding: 16px;
  border: 1px dashed var(--accent-border);
  border-radius: var(--radius-md);
  background: var(--bg-surface-secondary);
  font-size: 14px;
  color: var(--text-muted);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px 20px;
  border-top: 1px solid var(--border-primary);
  background: var(--card-bg);
}

@media (max-width: 860px) {
  .dialog-card {
    width: 100%;
    max-height: calc(100vh - 24px);
    border-radius: var(--radius-lg);
  }

  .dialog-overlay {
    padding: 12px;
  }

  .dialog-body {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .upload-area {
    aspect-ratio: 16 / 10;
  }

  .brands-list {
    max-height: 220px;
  }
}
</style>
