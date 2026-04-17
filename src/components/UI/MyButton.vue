<template>
  <button
    class="my-button"
    :class="[
      `my-button--${color || 'default'}`,
      `my-button--${size}`,
      { 'my-button--icon-only': icon && !isSidebarOpened },
    ]"
  >
    <component :is="icon" v-if="icon" class="my-button__icon" :class="{ active: active }" />
    <span v-if="isSidebarOpened" class="my-button__label">
      <slot></slot>
    </span>
    <span v-if="$slots.chip" class="my-button__chip">
      <slot name="chip"></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
defineProps({
  icon: {
    type: [Object, Function],
    required: false,
  },
  isSidebarOpened: {
    type: Boolean,
    required: false,
    default: true,
  },
  color: {
    type: String,
    default: 'default',
  },
  size: {
    type: String,
    default: 's',
  },
  active: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped lang="scss">
.my-button {
  appearance: none;
  border: 1px solid var(--button-border);
  background: var(--button-bg);
  color: var(--button-text);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  cursor: pointer;

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  font-weight: 600;
  font-family: inherit;
  text-align: center;
  white-space: nowrap;

  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.12s ease;
}

.my-button:hover {
  background: var(--button-bg-hover);
  border-color: var(--button-border-hover);
}

.my-button:active {
  background: var(--button-bg-active);
  transform: scale(0.98);
}

.my-button:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring), var(--shadow-sm);
}

.my-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.my-button__icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  transition: transform 0.25s ease;
}

.my-button__icon.active {
  transform: rotate(180deg);
}

.my-button__label {
  display: inline-flex;
  align-items: center;
}
.my-button__chip {
  position: absolute;
  right: 13%;
  top: 0;
  bottom: 0;
  width: 20px;
  height: 20px;
  // position: absolute;
  font-size: 11px;
  background-color: var(--accent);
  border: 1px solid var(--border-primary);
  color: var(--text-on-accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
/* default */
.my-button--default {
  border-color: var(--button-border);
  background: var(--button-bg);
  color: var(--button-text);
}

.my-button--default:hover {
  background: var(--button-bg-hover);
  border-color: var(--button-border-hover);
}

.my-button--default:active {
  background: var(--button-bg-active);
}

/* primary */
.my-button--primary {
  border-color: var(--button-primary-border);
  background: var(--button-primary-bg);
  color: var(--button-primary-text);
  box-shadow: var(--shadow-md);
}

.my-button--primary:hover {
  background: var(--button-primary-bg-hover);
  border-color: var(--button-primary-bg-hover);
}

.my-button--primary:active {
  background: var(--button-primary-bg-active);
  border-color: var(--button-primary-bg-active);
}

/* transparent / ghost */
.my-button--transparent {
  border-color: var(--button-ghost-border);
  background: var(--button-ghost-bg);
  color: var(--button-ghost-text);
  box-shadow: none;
}

.my-button--transparent:hover {
  background: var(--button-ghost-bg-hover);
  border-color: var(--button-ghost-border);
}

.my-button--transparent:active {
  background: var(--button-ghost-bg-active);
}

.my-button--danger {
  border: 1px solid var(--danger-border);
  border-radius: var(--radius-sm);
  background: var(--danger-soft);
  color: var(--danger);
}

.my-button--danger:hover {
  background: var(--danger-soft);
}
.my-button--danger:active {
  background: var(--danger-soft);
}
/* sizes */
.my-button--xs {
  min-height: 32px;
  padding: 0 12px;
  font-size: 12px;
  line-height: 16px;
}

.my-button--s {
  min-height: 38px;
  padding: 0 14px;
  font-size: 14px;
  line-height: 20px;
}

.my-button--m {
  min-height: 42px;
  padding: 0 16px;
  font-size: 14px;
  line-height: 20px;
}

.my-button--l {
  min-height: 46px;
  padding: 0 18px;
  font-size: 15px;
  line-height: 22px;
}

.my-button--xl {
  min-height: 52px;
  padding: 0 22px;
  font-size: 16px;
  line-height: 24px;
}

/* icon only */
.my-button--icon-only {
  padding-left: 0;
  padding-right: 0;
  aspect-ratio: 1 / 1;
}
.my-button--icon-only .my-button__chip {
  right: -10%;
}
.my-button--icon-only.my-button--xs {
  width: 32px;
}

.my-button--icon-only.my-button--s {
  width: 38px;
}

.my-button--icon-only.my-button--m {
  width: 42px;
}

.my-button--icon-only.my-button--l {
  width: 46px;
}

.my-button--icon-only.my-button--xl {
  width: 52px;
}
</style>
