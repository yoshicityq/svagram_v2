<template>
  <span ref="anchorRef" style="display: none" />
  <Teleport v-if="isVisible" to="body">
    <div
      ref="tooltipRef"
      :class="['tooltip-container', directionClass]"
      :style="tooltipStyle"
      @mouseover="onTooltipMouseOver"
      @mouseleave="onTooltipMouseLeave"
    >
      <div class="tooltip f-12 fw-600">
        <slot />
      </div>
      <div class="tooltip-arrow">
        <TooltipArrow />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import TooltipArrow from '@/assets/icons/TooltipArrow.vue'

const props = defineProps({
  direction: { type: String, default: 'TOP' },
})

// Refs
const tooltipRef = ref(null)
const anchorRef = ref(null)
const isVisible = ref(false)
const tooltipStyle = ref({})

// State
let parentElement = null
let isOverParent = false
let isOverTooltip = false
let hideTimeout = null

// Computed
const directionClass = computed(() => String(props.direction).toUpperCase())

// Constants
const TOOLTIP_OFFSET = 7
const SIDE_OFFSET = 24
const EDGE_MARGIN = 10
const HIDE_DELAY = 10

// Methods
const showTooltip = () => {
  isVisible.value = true
  nextTick(updatePosition)
}

const hideTooltip = () => {
  isVisible.value = false
}

const clearHideTimeout = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
}

const scheduleHide = () => {
  clearHideTimeout()
  hideTimeout = setTimeout(checkHide, HIDE_DELAY)
}

const checkHide = () => {
  if (!isOverParent && !isOverTooltip) {
    hideTooltip()
  }
}

const onParentMouseOver = (e) => {
  if (parentElement?.contains(e.target)) {
    isOverParent = true
    clearHideTimeout()
    showTooltip()
  }
}

const onParentMouseLeave = () => {
  isOverParent = false
  scheduleHide()
}

const onTooltipMouseOver = () => {
  isOverTooltip = true
  clearHideTimeout()
}

const onTooltipMouseLeave = () => {
  isOverTooltip = false
  scheduleHide()
}

const calculatePosition = (parentRect, tooltipRect) => {
  const { direction } = props
  let left, top

  switch (direction.toUpperCase()) {
    case 'TOP':
      left = parentRect.left + parentRect.width / 2 - tooltipRect.width / 2
      top = parentRect.top - tooltipRect.height - TOOLTIP_OFFSET
      break
    case 'BOTTOM':
      left = parentRect.left + parentRect.width / 2 - tooltipRect.width / 2
      top = parentRect.bottom + TOOLTIP_OFFSET
      break
    case 'LEFT':
      left = parentRect.left - tooltipRect.width - TOOLTIP_OFFSET
      top = parentRect.top + parentRect.height / 2 - tooltipRect.height / 2
      break
    case 'RIGHT':
      left = parentRect.right + TOOLTIP_OFFSET
      top = parentRect.top + parentRect.height / 2 - tooltipRect.height / 2
      break
    case 'BOTTOM_LEFT':
      left = parentRect.left + SIDE_OFFSET
      top = parentRect.bottom + TOOLTIP_OFFSET
      break
    case 'BOTTOM_RIGHT':
      left = parentRect.right - tooltipRect.width - SIDE_OFFSET
      top = parentRect.bottom + TOOLTIP_OFFSET
      break
    default:
      left = parentRect.left + parentRect.width / 2 - tooltipRect.width / 2
      top = parentRect.top - tooltipRect.height - TOOLTIP_OFFSET
  }

  return { left, top }
}

const constrainToViewport = (left, top, tooltipRect) => {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  return {
    left: Math.max(EDGE_MARGIN, Math.min(left, viewportWidth - tooltipRect.width - EDGE_MARGIN)),
    top: Math.max(EDGE_MARGIN, Math.min(top, viewportHeight - tooltipRect.height - EDGE_MARGIN)),
  }
}

const updatePosition = () => {
  if (!parentElement || !tooltipRef.value) return

  const parentRect = parentElement.getBoundingClientRect()
  const tooltipRect = tooltipRef.value.getBoundingClientRect()

  const { left: initialLeft, top: initialTop } = calculatePosition(parentRect, tooltipRect)
  const { left, top } = constrainToViewport(initialLeft, initialTop, tooltipRect)

  tooltipStyle.value = {
    position: 'fixed',
    left: `${left}px`,
    top: `${top}px`,
    zIndex: 99999,
  }
}

const setupParentListeners = () => {
  if (!parentElement) return

  const events = [
    ['mouseover', onParentMouseOver],
    ['mouseleave', onParentMouseLeave],
    ['focusin', showTooltip],
    ['focusout', hideTooltip],
  ]

  events.forEach(([event, handler]) => {
    parentElement.addEventListener(event, handler)
  })
}

const removeParentListeners = () => {
  if (!parentElement) return

  const events = [
    ['mouseover', onParentMouseOver],
    ['mouseleave', onParentMouseLeave],
    ['focusin', showTooltip],
    ['focusout', hideTooltip],
  ]

  events.forEach(([event, handler]) => {
    parentElement.removeEventListener(event, handler)
  })
}

const setupGlobalListeners = () => {
  window.addEventListener('resize', updatePosition)
  window.addEventListener('scroll', updatePosition)
}

const removeGlobalListeners = () => {
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition)
}

// Lifecycle
onMounted(() => {
  nextTick(() => {
    if (anchorRef.value) {
      parentElement = anchorRef.value.parentNode
    }
    setupParentListeners()
  })
  setupGlobalListeners()
})

onUnmounted(() => {
  removeParentListeners()
  removeGlobalListeners()
  clearHideTimeout()
})

// Watchers
watch(
  () => props.parent?.value,
  (newVal, oldVal) => {
    if (oldVal) removeParentListeners()
    parentElement = newVal
    setupParentListeners()
  },
)
</script>

<style lang="scss" scoped>
.tooltip-container {
  position: fixed;
  z-index: 99999;
  color: var(--text-primary);
}
.tooltip {
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  white-space: nowrap;
}

.tooltip-arrow {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tooltip-arrow > svg {
  stroke: var(--bg-secondary);
  fill: var(--bg-secondary);
}

// Позиционирование стрелок
.TOP .tooltip-arrow {
  bottom: -7px;
  left: 50%;
  transform: translateX(-50%);
}

.BOTTOM .tooltip-arrow {
  top: -7px;
  left: 50%;
  transform: translateX(-50%) rotate(180deg);
}

.BOTTOM_LEFT .tooltip-arrow {
  top: -7px;
  left: 24px;
  transform: rotate(180deg);
}

.BOTTOM_RIGHT .tooltip-arrow {
  top: -7px;
  right: 24px;
  transform: rotate(180deg);
}

.LEFT .tooltip-arrow {
  right: -7px;
  top: 50%;
  transform: translateY(-50%);
}

.RIGHT .tooltip-arrow {
  left: -7px;
  top: 50%;
  transform: translateY(-50%) rotate(90deg);
}
</style>
