<template>
  <div class="page__wrapper">
    <div class="page__content">
      <figure>
        <img src="@/assets/images/home_image.png" alt="" class="image" />
      </figure>
      <div>
        <auth-form />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MyButton from '@/components/UI/MyButton.vue'
import AuthForm from '../components/AuthForm.vue'
</script>

<style scoped lang="scss">
.page__wrapper {
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.page__content {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 75%;
}

.image {
  width: 550px;
}
</style>
