<template>
  <div class="category-block">
    <CategorySelect
      :model-value="currentCategory"
      @update:model-value="chooseCategory"
      :id="categoryObj.id!"
    />
    <BrandSelect
      v-if="currentCategory"
      :model-value="currentBrand"
      @update:model-value="chooseBrand"
    />
  </div>
</template>

<script setup lang="ts">
import BrandSelect from '@/components/BrandSelect.vue'
import CategorySelect from '@/components/CategorySelect.vue'
import type { BrandCategory } from '@/types/category'
import { ref } from 'vue'

const props = defineProps({
  categoryObj: {
    type: Object as () => BrandCategory,
    required: true,
  },
})

const currentCategory = ref('')
const currentBrand = ref('')
const emits = defineEmits(['update:categoryName', 'update:categoryVal'])
function chooseCategory(category: string) {
  currentCategory.value = category
  emits('update:categoryName', category)
}
function chooseBrand(brand: string) {
  currentBrand.value = brand
  emits('update:categoryVal', brand)
}
</script>

<style scoped lang="scss">
.category-block {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
</style>
