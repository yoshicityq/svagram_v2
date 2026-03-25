<template>
  <div class="page__wrapper">
    <div class="page__content">
      <figure>
        <img src="@/assets/images/home_image.png" alt="" class="image" />
      </figure>
      <div>
        <auth-form />
        <div style="display: flex; flex-direction: column; align-items: center; margin-top: 10px">
          <span style="font-size: 13px; color: rgb(147, 147, 147)">{{ $t('helpers.no_acc') }}</span>
          <router-link to="/reg">
            <my-button color="transparent">{{ $t('buttons.sign_up') }}</my-button>
          </router-link>
        </div>
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
  width: 500px;
}
</style>
