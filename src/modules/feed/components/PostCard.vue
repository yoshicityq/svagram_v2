<template>
  <div class="post-card">
    <div class="header">
      <UserProfile :username="post.user" :closable="false" />
      <div class="header-stats">
        <span class="header-coords">
          <LocationIcon class="header-coords-icon" />{{ post.latitude.toFixed(3) }}
          {{ post.longitude.toFixed(3) }}</span
        >
        <span>·</span>
        <span class="header-time">{{ formatTime(post.date) }}</span>
      </div>
    </div>

    <div class="body">
      <div class="post-image">
        <img
          class="image"
          :src="`http://localhost:3000${post.imageUrl}`"
          alt="post image"
          @mouseenter="isBrandsVisible = true"
          @mouseout="isBrandsVisible = false"
        />
        <span
          v-show="post && isBrandsVisible"
          v-for="pin in post.category_list"
          :key="pin.id"
          class="image-editor__pin"
          :style="{ left: `${pin.xPercent}%`, top: `${pin.yPercent}%` }"
          @mouseenter="isBrandsVisible = true"
        >
          <span class="pin-dot" />
          <span v-if="pin.category && pin.brand" class="pin-label">
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
      </div>

      <!-- <div class="sidebar">
        <div v-if="brandEntries.length" class="brands-section">
          <span class="brands-label">{{ $t('helpers.brands') }}</span>

          <div class="brands-list">
            <div v-for="[category, brands] in brandEntries" :key="category" class="brand-row">
              <div class="brand-icon-wrapper">
                <component :is="getBrandIcon(category)" class="brand-icon" />
              </div>

              <div class="brand-names">
                <span v-for="brand in brands" :key="`${category}-${brand}`" class="brand-name">
                  {{ brand }}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div> -->
      <div class="sidebar-footer">
        <EstimatePost :post-id="post.id" :is-clickable="true" />

        <div v-if="post.description" class="post-description">
          <span>{{ post.description }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type Component } from 'vue'

import HatIcon from '@/assets/icons/categories/HatIcon.vue'
import JacketIcon from '@/assets/icons/categories/JacketIcon.vue'
import PantsIcon from '@/assets/icons/categories/PantsIcon.vue'
import ShoesIcon from '@/assets/icons/categories/ShoesIcon.vue'
import TshirtIcon from '@/assets/icons/categories/TshirtIcon.vue'
import FavBrandsIcon from '@/assets/icons/FavBrandsIcon.vue'

import EstimatePost from '@/components/EstimatePost.vue'
import UserProfile from '@/components/UserProfile.vue'
import { CategoryBackend, CategoryReadable } from '@/enums/categories'

import type { Post } from '@/types/post'
import AccessoryIcon from '@/assets/icons/categories/AccessoryIcon.vue'
import BagIcon from '@/assets/icons/categories/BagIcon.vue'
import GlassesIcon from '@/assets/icons/categories/GlassesIcon.vue'
import { useI18n } from 'vue-i18n'
import LocationIcon from '@/assets/icons/LocationIcon.vue'

const props = defineProps<{
  post: Post
}>()

function parseBrands(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}
const isBrandsVisible = ref(false)
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
const brandEntries = computed<Array<[string, string[]]>>(() => {
  return Object.entries(props.post).flatMap(([key, value]) => {
    if (!key.startsWith('brand')) {
      return []
    }

    if (typeof value === 'string') {
      const brands = parseBrands(value)
      return brands.length ? [[key, brands]] : []
    }

    if (Array.isArray(value)) {
      const brands = value.map((item) => String(item).trim()).filter(Boolean)
      return brands.length ? [[key, brands]] : []
    }

    return []
  })
})
const now = ref(Date.now())
const { t } = useI18n()
function getPluralKey(value: number, unit: 'minute' | 'hour' | 'day' | 'week'): string {
  const mod10 = value % 10
  const mod100 = value % 100

  if (mod10 === 1 && mod100 !== 11) {
    return `time.${unit}_ago_1`
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `time.${unit}_ago_2_4`
  }

  return `time.${unit}_ago_5`
}
function formatTime(ts: number): string {
  const diff = now.value - ts
  const m = Math.floor(diff / 60000)

  if (m < 1) return t('time.just_now')
  if (m < 60) return m === 1 ? t('time.minute_ago_1') : `${m} ${t(getPluralKey(m, 'minute'))}`

  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ${t(getPluralKey(h, 'hour'))}`

  const d = Math.floor(h / 24)
  if (d < 7) return `${d} ${t(getPluralKey(d, 'day'))}`

  const w = Math.floor(d / 7)
  return `${w} ${t(getPluralKey(w, 'week'))}`
}
function getBrandIcon(category: string) {
  const iconMap: Record<string, unknown> = {
    brand_hat: HatIcon,
    brand_outwear: JacketIcon,
    brand_top: TshirtIcon,
    brand_bottom: PantsIcon,
    brand_shoes: ShoesIcon,
    brand_accessory: AccessoryIcon,
    brand_bag: BagIcon,
    brand_glasses: GlassesIcon,
  }

  return iconMap[category] ?? FavBrandsIcon
}
</script>

<style scoped lang="scss">
.post-card {
  display: inline-flex;
  flex-direction: column;
  width: fit-content;
  max-width: 100%;
  border-radius: var(--radius-sm);
  background: var(--card-bg);
  color: var(--text-primary);
}

.header {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-stats {
  display: flex;
  align-items: center;
  gap: 3px;
}
.header-coords {
  font-size: 11px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 2px;
  &-icon {
    width: 15px;
  }
}
.header-time {
  font-size: 11px;
  color: var(--text-secondary);
}
.body {
  display: flex;
  flex-direction: column;
  width: fit-content;
  max-width: 100%;
}

.post-image {
  flex: 1;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  background: var(--image-bg);
  // border-bottom-left-radius: var(--radius-sm);
  border: 1px solid var(--chip-border);

  position: relative;
}

.image {
  display: block;
  width: auto;
  height: auto;
  max-height: 700px;
  max-width: 100%;
}

.sidebar {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.brands-section {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.brands-label {
  display: block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  font-weight: 500;
  margin-bottom: 10px;
}

.brands-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border-radius: var(--radius-sm);
  transition: background 0.15s ease;
}

.brand-icon-wrapper {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: var(--chip-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-icon {
  width: 16px;
  height: 16px;
  color: var(--icon-primary);
}

.brand-names {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
}

.brand-name {
  font-size: 13px;
  color: var(--text-primary);
  white-space: nowrap;
}

.sidebar-footer {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  margin-top: auto;
}

.post-description {
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-secondary);
  word-break: break-word;
  overflow-wrap: anywhere;
  padding-top: 10px;
  max-height: 150px;
  overflow-y: auto;
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
</style>
