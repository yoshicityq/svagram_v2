<template>
  <label class="switch">
    <input type="checkbox" v-model="switchValue" class="switch__input" />
    <span class="switch__track">
      <span class="switch__thumb">
        <SunIcon class="switch__icon switch__icon--sun" />
        <MoonIcon class="switch__icon switch__icon--moon" />
      </span>
    </span>
  </label>
</template>

<script setup>
import { computed } from 'vue'
import SunIcon from '@/assets/icons/SunIcon.vue'
import MoonIcon from '@/assets/icons/MoonIcon.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
})

const emits = defineEmits(['update:modelValue'])

const switchValue = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emits('update:modelValue', value)
    localStorage.setItem('isLightTheme', value)
  },
})
</script>

<style scoped lang="scss">
.switch {
  display: inline-flex;
  position: relative;
  cursor: pointer;
}

.switch__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.switch__track {
  width: 64px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid var(--switch-track-border);
  background: var(--switch-track);
  box-shadow:
    inset 0 1px 2px rgba(16, 24, 40, 0.06),
    var(--shadow-sm);
  position: relative;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.switch__thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--switch-thumb);
  border: 1px solid var(--switch-thumb-border);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
  transition:
    transform 0.22s ease,
    background-color 0.22s ease,
    border-color 0.22s ease;
}

.switch__icon {
  position: absolute;
  width: 16px;
  height: 16px;
  color: var(--icon-primary);
  transition:
    opacity 0.2s ease,
    transform 0.22s ease;
}

.switch__icon--sun {
  opacity: 0;
  transform: scale(0.8);
}

.switch__icon--moon {
  opacity: 1;
  transform: scale(1);
}

.switch__input:checked + .switch__track {
  background: var(--switch-track-active);
  border-color: var(--accent-border-strong);
}

.switch__input:checked + .switch__track .switch__thumb {
  transform: translateX(28px);
}

.switch__input:checked + .switch__track .switch__icon--sun {
  opacity: 1;
  transform: scale(1);
}

.switch__input:checked + .switch__track .switch__icon--moon {
  opacity: 0;
  transform: scale(0.8);
}

.switch__input:focus-visible + .switch__track {
  box-shadow: var(--focus-ring), var(--shadow-sm);
}

.switch:hover .switch__track {
  border-color: var(--accent-border-strong);
}
</style>
