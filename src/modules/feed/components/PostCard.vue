<template>
  <div class="post-card">
    <div class="header">
      <UserProfile :username="post.user" :closable="false" />
    </div>

    <div class="body">
      <div class="post-image">
        <img class="image" :src="`http://localhost:3000${post.imageUrl}`" alt="post image" />
      </div>

      <div class="sidebar">
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

        <div class="sidebar-footer">
          <EstimatePost :post-id="post.id" :is-clickable="true" />

          <div v-if="post.description" class="post-description">
            <span>{{ post.description }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import HatIcon from '@/assets/icons/HatIcon.vue'
import JacketIcon from '@/assets/icons/JacketIcon.vue'
import PantsIcon from '@/assets/icons/PantsIcon.vue'
import ShoesIcon from '@/assets/icons/ShoesIcon.vue'
import TshirtIcon from '@/assets/icons/TshirtIcon.vue'
import FavBrandsIcon from '@/assets/icons/FavBrandsIcon.vue'

import EstimatePost from '@/components/EstimatePost.vue'
import UserProfile from '@/components/UserProfile.vue'
import { CategoryBackend, CategoryReadable } from '@/components/enums/categories'

import type { Post } from '@/types/post'
import AccessoryIcon from '@/assets/icons/AccessoryIcon.vue'
import BagIcon from '@/assets/icons/BagIcon.vue'
import GlassesIcon from '@/assets/icons/GlassesIcon.vue'

const props = defineProps<{
  post: Post
}>()

function parseBrands(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
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
  border-bottom: 1px solid var(--chip-border);
}

.body {
  display: flex;
  width: fit-content;
  max-width: 100%;
}

.post-image {
  flex: 1;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  background: var(--image-bg);
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
  border-left: 1px solid var(--chip-border);
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
  border-top: 1px solid var(--chip-border);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: auto;
}

.post-description {
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-muted);
  word-break: break-word;
  overflow-wrap: anywhere;
  padding-top: 10px;
  border-top: 1px solid var(--chip-border);
  max-height: 150px;
  overflow-y: auto;
}
</style>
