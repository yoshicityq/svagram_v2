const Categories = {
  BRAND_HAT: 'BRAND_HAT',
  BRAND_OUTWEAR: 'BRAND_OUTWEAR',
  BRAND_TOP: 'BRAND_TOP',
  BRAND_BOTTOM: 'BRAND_BOTTOM',
  BRAND_SHOES: 'BRAND_SHOES',
  BRAND_BAG: 'BRAND_BAG',
  BRAND_GLASSES: 'BRAND_GLASSES',
  BRAND_ACCESSORY: 'BRAND_ACCESSORY',
}

export function CategoryBackend(category: string) {
  return {
    ['brand_hat']: Categories.BRAND_HAT,
    ['brand_outwear']: Categories.BRAND_OUTWEAR,
    ['brand_top']: Categories.BRAND_TOP,
    ['brand_bottom']: Categories.BRAND_BOTTOM,
    ['brand_shoes']: Categories.BRAND_SHOES,
    ['brand_bag']: Categories.BRAND_BAG,
    ['brand_glasses']: Categories.BRAND_GLASSES,
    ['brand_accessory']: Categories.BRAND_ACCESSORY,
  }[category]
}

export function CategoryReadable(category: string) {
  return {
    [Categories.BRAND_HAT]: 'categories.hat',
    [Categories.BRAND_OUTWEAR]: 'categories.outwear',
    [Categories.BRAND_TOP]: 'categories.top',
    [Categories.BRAND_BOTTOM]: 'categories.bottom',
    [Categories.BRAND_SHOES]: 'categories.shoes',
    [Categories.BRAND_GLASSES]: 'categories.glasses',
    [Categories.BRAND_BAG]: 'categories.bag',
    [Categories.BRAND_ACCESSORY]: 'categories.accessory',
  }[category]
}
