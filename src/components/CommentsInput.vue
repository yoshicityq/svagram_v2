<template>
  <div class="comm-input">
    <input type="text" class="input" placeholder="Type smth..." />
    <SendCommIcon class="icon" color="blueviolet" />
  </div>
</template>

<script setup lang="ts">
import SendCommIcon from '@/assets/icons/SendCommIcon.vue'
</script>

<style scoped lang="scss">
.comm-input {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border-top: 2px solid blueviolet;
}
.input {
  width: 100%;
  border: none;
  font-size: 15px;
}
.input:focus {
  outline: none;
}
.icon {
  width: 40px;
}
</style>
