<template>
  <Teleport to="#portal">
    <div v-show="modalStore.isCreateDialogOpen" class="dialog-overlay" @click.self="closeWindow">
      <form
        ref="form"
        @submit.prevent="publishPost"
        class="dialog-card"
        :class="{ 'dialog-card--compact': currentSection === 1 }"
      >
        <!-- Header -->
        <div class="dialog-header">
          <div class="dialog-header-left">
            <div class="step-indicators">
              <span class="step-dot" :class="{ 'step-dot--active': currentSection === 0 }" />
              <span class="step-dot" :class="{ 'step-dot--active': currentSection === 1 }" />
            </div>
            <div class="dialog-header-content">
              <h2 class="dialog-title">
                {{ $t('modals.create_new_post') }}
              </h2>
              <h4 class="dialog-description">
                {{
                  currentSection === 0 ? $t('modals.photo_and_location') : $t('modals.tag_brands')
                }}
              </h4>
            </div>
          </div>
          <button type="button" class="icon-button" @click="closeWindow" aria-label="Close dialog">
            <CrossIcon class="icon" />
          </button>
        </div>

        <!-- Section 0: Photo + Description + Map -->
        <div v-if="currentSection === 0" class="dialog-body">
          <div class="dialog-column dialog-column--left">
            <div class="upload-section">
              <label for="file" class="upload-area">
                <img v-if="previewUrl" :src="previewUrl" alt="preview" class="upload-preview" />
                <div v-else class="upload-placeholder">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="upload-icon"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  <span class="upload-title">{{ $t('modals.upload_photo') }}</span>
                  <span class="upload-subtitle">JPG, PNG, WEBP</span>
                </div>
              </label>
              <input id="file" type="file" accept="image/*" name="image" @change="onFileChange" />
            </div>
            <div class="form-section">
              <label class="section-label" for="description">
                {{ $t('modals.make_capture') }}
              </label>
              <textarea
                v-model="textarea"
                id="description"
                name="description"
                class="text-input"
                :placeholder="$t('placeholder.photo_capture')"
              />
            </div>
          </div>

          <div class="dialog-column dialog-column--right">
            <!-- Description -->

            <!-- Map -->
            <div class="form-section map-section">
              <label class="section-label">
                {{ $t('modals.choose_location') }}
              </label>

              <div class="location-search">
                <div class="location-input-wrapper">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="location-input-icon"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    v-model="addressQuery"
                    type="text"
                    class="location-input"
                    :placeholder="$t('placeholder.search_place')"
                    @keydown.enter.prevent="searchAddress"
                  />
                  <button
                    v-if="addressQuery"
                    type="button"
                    class="location-clear"
                    @click="((addressQuery = ''), (searchResults = []))"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <!-- Search results dropdown -->
                <div v-if="searchResults.length" class="location-results">
                  <button
                    v-for="(result, i) in searchResults"
                    :key="i"
                    type="button"
                    class="location-result"
                    @click="selectSearchResult(result)"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="result-icon"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span class="result-text">{{ result.display_name }}</span>
                  </button>
                </div>
              </div>

              <div ref="mapContainer" class="map-container" />

              <div v-if="selectedCoords" class="coords-display">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span
                  >{{ selectedCoords.lat.toFixed(5) }}, {{ selectedCoords.lng.toFixed(5) }}</span
                >
                <button type="button" class="coords-clear" @click="clearLocation">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 1: Pin editor -->
        <div v-if="currentSection === 1" class="dialog-body dialog-body--editor">
          <div class="image-editor" ref="imageWrapper" @click="handleImageClick">
            <img v-if="previewUrl" :src="previewUrl" alt="" class="full-img" />

            <span
              v-for="pin in pins"
              :key="pin.id"
              class="image-editor__pin"
              :style="{ left: `${pin.xPercent}%`, top: `${pin.yPercent}%` }"
            >
              <span class="pin-dot" />
              <span v-if="pin.category || pin.brand" class="pin-label">
                <!-- <span v-if="pin.category" class="pin-label__category">{{
                  $t(CategoryReadable(CategoryBackend(pin.category)!)!)
                }}</span> -->
                <component
                  v-if="pin.category"
                  :is="iconsContainer[pin.category]"
                  class="pin-label__icon"
                />
                <span v-if="pin.brand" class="pin-label__brand">{{ pin.brand }}</span>
              </span>
            </span>

            <div v-if="!pins.length && previewUrl" class="editor-hint">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>{{ $t('modals.click_to_add_pin') }}</span>
            </div>
          </div>

          <div class="brands-panel">
            <div class="brands-panel__header">
              <span class="section-label">{{ $t('modals.tagged_categories') }}</span>
            </div>

            <div v-if="pins.length" class="brands-list">
              <div v-for="(pin, index) in pins" :key="pin.id" class="brand-row">
                <span class="brand-row__number">{{ index + 1 }}</span>
                <CategoryBrandBlock
                  :category-obj="{
                    id: pin.id,
                    categoryName: pin.category,
                    categoryValue: pin.brand,
                  }"
                  @update:category-name="updateCategoryName(index, $event)"
                  @update:category-val="updateCategoryBrand(index, $event)"
                />
                <button type="button" class="remove-btn" @click.prevent="removeBlock(index)">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            <div v-else class="brands-empty">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"
                />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              <span>{{ $t('helpers.add_few_brands') || 'Click on the image to tag brands' }}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="dialog-footer">
          <div class="footer-left">
            <MyButton v-if="currentSection > 0" type="button" @click="currentSection--">
              {{ $t('buttons.back') || 'Back' }}
            </MyButton>
          </div>
          <div class="footer-right">
            <MyButton type="button" @click="closeWindow">
              {{ $t('buttons.cancel') }}
            </MyButton>
            <MyButton
              v-if="currentSection === 0"
              type="button"
              color="primary"
              :disabled="!previewUrl"
              @click="currentSection++"
            >
              {{ $t('buttons.next') || 'Next' }}
            </MyButton>
            <MyButton v-else type="submit" color="primary" :disabled="!previewUrl">
              {{ $t('buttons.share') }}
            </MyButton>
          </div>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  ref,
  onBeforeUnmount,
  onMounted,
  watch,
  useTemplateRef,
  reactive,
  nextTick,
  type Component,
} from 'vue'
import MyButton from '@/components/UI/MyButton.vue'
import useModalStore from '@/stores/modals'
import { apiFetch } from '@/api/apiFetch'
import CategoryBrandBlock from './CategoryBrandBlock.vue'
import type { BrandCategory } from '@/types/category'
import CrossIcon from '@/assets/icons/CrossIcon.vue'
import { useNotification } from '@kyvg/vue3-notification'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CategoryBackend, CategoryReadable } from '@/enums/categories'
import TooltipArrow from '@/assets/icons/TooltipArrow.vue'
import HatIcon from '@/assets/icons/categories/HatIcon.vue'
import JacketIcon from '@/assets/icons/categories/JacketIcon.vue'
import AccessoryIcon from '@/assets/icons/categories/AccessoryIcon.vue'
import GlassesIcon from '@/assets/icons/categories/GlassesIcon.vue'
import PantsIcon from '@/assets/icons/categories/PantsIcon.vue'
import ShoesIcon from '@/assets/icons/categories/ShoesIcon.vue'
import BagIcon from '@/assets/icons/categories/BagIcon.vue'
import TshirtIcon from '@/assets/icons/categories/TshirtIcon.vue'
import { useProfileStore } from '@/stores/profile'
import type { Post } from '@/types/post'

const modalStore = useModalStore()
const { notify } = useNotification()

const iconsContainer: Record<string, Component> = {
  brand_hat: HatIcon,
  brand_top: TshirtIcon,
  brand_accessory: AccessoryIcon,
  brand_glasses: GlassesIcon,
  brand_bottom: PantsIcon,
  brand_shoes: ShoesIcon,
  brand_bag: BagIcon,
  brand_outwear: JacketIcon,
}

// ─── Form state ───
const previewUrl = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const textarea = ref('')
const form = useTemplateRef('form')
const currentSection = ref(0)

// ─── Map state ───
const mapContainer = ref<HTMLElement | null>(null)
const addressQuery = ref('')
const searchResults = ref<any[]>([])
const selectedCoords = ref<{ lat: number; lng: number } | null>(null)
let map: L.Map | null = null
let marker: L.Marker | null = null

// ─── Pin state ───
type Pin = {
  id: string
  xPercent: number
  yPercent: number
  category: string
  brand: string
}
const imageWrapper = ref<HTMLFormElement | null>(null)
const pins = ref<Pin[]>([])

// ─── File handling ───
function cleanupPreview() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
    textarea.value = ''
  }
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  if (!file || !file.type.startsWith('image/')) return

  selectedFile.value = file
  cleanupPreview()
  previewUrl.value = URL.createObjectURL(file)
}

// ─── Map ───
function initMap() {
  if (!mapContainer.value || map) return

  map = L.map(mapContainer.value, {
    center: [55.7558, 37.6173], // Москва по умолчанию
    zoom: 10,
    zoomControl: true,
    attributionControl: false,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map)

  map.on('click', (e: L.LeafletMouseEvent) => {
    setMarker(e.latlng.lat, e.latlng.lng)
  })
}

function destroyMap() {
  if (map) {
    map.remove()
    map = null
    marker = null
  }
}

function setMarker(lat: number, lng: number) {
  selectedCoords.value = { lat, lng }

  if (!map) return

  if (marker) {
    marker.setLatLng([lat, lng])
  } else {
    marker = L.marker([lat, lng]).addTo(map)
  }

  map.setView([lat, lng], Math.max(map.getZoom(), 13))
}

function clearLocation() {
  selectedCoords.value = null
  if (marker && map) {
    map.removeLayer(marker)
    marker = null
  }
  addressQuery.value = ''
  searchResults.value = []
}

async function searchAddress() {
  if (!addressQuery.value.trim()) return

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery.value)}&limit=5`,
    )
    const data = await response.json()
    searchResults.value = data
  } catch (err) {
    console.error('[geocoding]', err)
    searchResults.value = []
  }
}

function selectSearchResult(result: any) {
  const lat = parseFloat(result.lat)
  const lng = parseFloat(result.lon)
  setMarker(lat, lng)
  addressQuery.value = result.display_name
  searchResults.value = []
}

// ─── Pins ───
function handleImageClick(event: MouseEvent) {
  const wrapper = imageWrapper.value
  if (!wrapper) return

  // Не добавляем пин если кликнули по существующему
  const target = event.target as HTMLElement
  if (target.closest('.image-editor__pin')) return

  const rect = wrapper.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  pins.value.push({
    id: crypto.randomUUID(),
    xPercent: (x / rect.width) * 100,
    yPercent: (y / rect.height) * 100,
    category: '',
    brand: '',
  })
}

function updateCategoryName(index: number, val: string) {
  if (pins.value[index]) pins.value[index].category = val
}

function updateCategoryBrand(index: number, val: string) {
  if (pins.value[index]) pins.value[index].brand = val
}

function removeBlock(index: number) {
  pins.value.splice(index, 1)
}

// ─── Publish ───
async function publishPost() {
  if (!selectedFile.value) {
    alert('Please select a photo to upload.')
    return
  }

  const formData = new FormData(form.value as HTMLFormElement)

  // Добавляем координаты если выбраны
  if (selectedCoords.value) {
    formData.set('latitude', String(selectedCoords.value.lat))
    formData.set('longitude', String(selectedCoords.value.lng))
  }

  // Добавляем пины как JSON
  if (pins.value.length) {
    formData.set(
      'category_list',
      JSON.stringify(
        pins.value.map((p) => ({
          id: p.id,
          xPercent: p.xPercent,
          yPercent: p.yPercent,
          category: p.category,
          brand: p.brand,
        })),
      ),
    )
  }
  formData.set('date', String(Date.now()))
  formData.set('image', selectedFile.value)
  formData.set('description', textarea.value)
  // Обрабатываем категории для совместимости с текущим бэкендом
  // const categoryMap = new Map<string, string[]>()
  // for (const pin of pins.value) {
  //   if (pin.category && pin.brand) {
  //     const existing = categoryMap.get(pin.category) || []
  //     existing.push(pin.brand)
  //     categoryMap.set(pin.category, existing)
  //   }
  // }
  // for (const [category, brands] of categoryMap) {
  //   formData.set(category, brands.join(', '))
  // }

  for (const [key, val] of formData.entries()) {
    console.log(key, val)
  }
  const response = await apiFetch('/posts/create', {
    method: 'POST',
    body: formData,
  })
  const profileStore = useProfileStore()
  if (response.ok) {
    const data = await response.json()
    modalStore.isCreateDialogOpen = false

    if (data.post) {
      profileStore.userPosts.unshift(data.post as Post)
      profileStore.userPostsCount++
    }
    notify({
      title: 'Успешно',
      text: 'Публикация опубликована',
      type: 'success',
    })
  } else {
    alert('Не удалось создать пост')
  }
}

// ─── Close / cleanup ───
function closeWindow() {
  modalStore.toggleCreateDialog()
  pins.value = []
  currentSection.value = 0
  clearLocation()
}

// ─── Watchers ───
watch(
  () => modalStore.isCreateDialogOpen,
  async (open) => {
    if (!open) {
      selectedFile.value = null
      cleanupPreview()
      destroyMap()
    } else {
      // Инициализируем карту когда диалог открывается
      await nextTick()
      setTimeout(() => {
        initMap()
        map?.invalidateSize()
      }, 100)
    }
  },
)

watch(currentSection, async (section) => {
  if (section === 0) {
    await nextTick()
    setTimeout(() => {
      if (!map) initMap()
      map?.invalidateSize()
    }, 100)
  }
})

onBeforeUnmount(() => {
  cleanupPreview()
  destroyMap()
  modalStore.isCreateDialogOpen = false
})
</script>

<style scoped lang="scss">
/* ── Overlay ── */
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

/* ── Card ── */
.dialog-card {
  width: min(1080px, 100%);
  max-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  transition: width 0.3s ease;
}

.dialog-card--compact {
  width: fit-content;
  max-width: min(900px, 100%);
}

/* ── Header ── */
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid var(--border-primary);
}

.dialog-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.step-indicators {
  display: flex;
  gap: 6px;
}

.step-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border-secondary);
  transition:
    background-color 0.25s ease,
    transform 0.25s ease;
}

.step-dot--active {
  background: var(--accent);
  transform: scale(1.25);
}
.dialog-header-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.dialog-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}
.dialog-description {
  font-size: 13px;
  color: var(--text-muted);
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

  .icon {
    width: 16px;
    height: 16px;
    color: var(--icon-primary);
  }
}

/* ── Body ── */
.dialog-body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(280px, 380px) minmax(320px, 1fr);
  // display: flex;
  gap: 24px;
  padding: 20px;
  overflow: auto;
}
.dialog-body--editor {
  grid-template-columns: auto minmax(280px, 320px);
  width: fit-content;
}
.dialog-body--editor .image-editor {
  max-height: 500px;
}

.dialog-body--editor .full-img {
  max-height: 500px;
  width: auto;
}
.dialog-column {
  min-width: 0;
}

.dialog-column--left {
  flex-direction: column;
  width: 100%;
  gap: 20px;
}

.dialog-column--right {
  display: flex;
}

/* ── Upload ── */
.upload-section {
  width: 100%;
  // max-width: 400px;
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
    background-color 0.2s ease;

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
  gap: 8px;
  padding: 20px;
  text-align: center;
}

.upload-icon {
  color: var(--icon-muted);
  margin-bottom: 4px;
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

/* ── Form ── */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
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

/* ── Location / Map ── */
.map-section {
  flex: 1;
  min-height: 0;
}

.location-search {
  position: relative;
}

.location-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.location-input-icon {
  position: absolute;
  left: 12px;
  color: var(--input-placeholder);
  pointer-events: none;
}

.location-input {
  width: 100%;
  min-height: 40px;
  padding: 0 36px 0 36px;
  border: 1px solid var(--input-border);
  border-radius: var(--radius-sm);
  background: var(--input-bg);
  font-size: 13px;
  color: var(--text-secondary);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;

  &::placeholder {
    color: var(--input-placeholder);
  }
  &:hover {
    border-color: var(--input-border-hover);
  }
  &:focus {
    outline: none;
    border-color: var(--input-border-active);
    box-shadow: var(--focus-ring);
  }
}

.location-clear {
  position: absolute;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--icon-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.18s ease,
    color 0.18s ease;

  &:hover {
    background: var(--dropdown-item-hover);
    color: var(--icon-primary);
  }
}

.location-results {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 2000;
  background: var(--dropdown-bg);
  border: 1px solid var(--dropdown-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-lg);
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.location-result {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border: none;
  background: transparent;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s ease;

  &:hover {
    background: var(--dropdown-item-hover);
  }
}

.result-icon {
  flex-shrink: 0;
  margin-top: 1px;
  color: var(--icon-muted);
}

.result-text {
  line-height: 1.35;
}

.map-container {
  width: 100%;
  height: 425px;
  border-radius: var(--radius-md);
  border: 1px solid var(--input-border);
  overflow: hidden;
  background: var(--image-bg);
}

// Leaflet overrides для темы
:deep(.leaflet-control-zoom a) {
  background: var(--card-bg) !important;
  color: var(--text-primary) !important;
  border-color: var(--border-secondary) !important;
}

.coords-display {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: var(--accent-soft);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  width: fit-content;
  svg {
    color: var(--accent);
    flex-shrink: 0;
  }
}

.coords-clear {
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--icon-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 2px;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: var(--dropdown-item-hover);
    color: var(--icon-primary);
  }
}

/* ── Image editor ── */
.image-editor {
  position: relative;
  background: var(--image-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: crosshair;
  width: fit-content;
}

.full-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.editor-hint {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--bg-overlay);
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
  pointer-events: none;

  svg {
    color: rgba(255, 255, 255, 0.65);
  }
}

/* ── Pins ── */
.image-editor__pin {
  position: absolute;
  z-index: 10;
  transform: translate(-50%, -50%);
  cursor: default;
}

.pin-dot {
  display: block;
  width: 12px;
  height: 12px;
  background: var(--accent);
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  transition: transform 0.15s ease;
}

.image-editor__pin:hover .pin-dot {
  transform: scale(1.3);
}

.pin-label {
  position: absolute;
  left: calc(100% + 6px);
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 4px;
  padding: 2px 6px;
  background: var(--bg-overlay);
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  pointer-events: none;
  align-items: center;
}

.pin-label__category {
  color: rgba(255, 255, 255, 0.65);
}
.pin-label__icon {
  width: 17px;
}
.pin-label__brand {
  color: #fff;
  font-weight: 600;
}

/* ── Brands panel ── */
.brands-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  max-width: 320px;
}

.brands-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brands-count {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
}

.brands-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  padding-right: 4px;
}

.brand-row {
  display: grid;
  grid-template-columns: 24px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px;
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  background: var(--bg-surface-secondary);
}

.brand-row__number {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.remove-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-xs);
  background: transparent;
  color: var(--icon-muted);
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: var(--danger-soft);
    color: var(--danger);
  }
}

.brands-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 16px;
  border: 1px dashed var(--accent-border);
  border-radius: var(--radius-md);
  background: var(--bg-surface-secondary);
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;

  svg {
    color: var(--icon-muted);
  }
}

/* ── Footer ── */
.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 20px;
  border-top: 1px solid var(--border-primary);
}

.footer-left,
.footer-right {
  display: flex;
  gap: 10px;
}

/* ── Responsive ── */
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

  .dialog-body--editor {
    grid-template-columns: 1fr;
  }

  .upload-area {
    aspect-ratio: 16 / 10;
  }
}
</style>
