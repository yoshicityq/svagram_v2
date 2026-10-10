<template>
  <form class="form" @submit.prevent="$emit('submit')">
    <header class="form__header">
      <slot name="header"></slot>
    </header>
    <div class="form__body">
      <slot></slot>
    </div>
    <footer class="form__footer">
      <slot name="footer"></slot>
    </footer>
  </form>
</template>

<script setup lang="ts">
defineEmits<{ (e: 'submit'): void }>()
</script>

<style scoped lang="scss">
.form {
  display: flex;
  flex-direction: column;
}
</style>
