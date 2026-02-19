<template>
  <form class="form" ref="form" @submit.prevent="login">
    <div class="form_header">
      <h1>SWAGRAM</h1>
    </div>
    <div class="form_body">
      <div class="field">
        <input name="username" type="text" placeholder="login" class="form-input" />
      </div>
      <div class="field">
        <input name="password" type="password" placeholder="password" class="form-input" />
      </div>
    </div>
    <div class="form_footer">
      <MyButton>Sign in</MyButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import MyForm from '@/components/MyForm.vue'
import { ref, useTemplateRef } from 'vue'
import { loginUser } from '../api/auth'
import { useRouter } from 'vue-router'
import MyButton from '@/components/UI/MyButton.vue'
const router = useRouter()
const form = useTemplateRef('form')
async function login() {
  const formData = new FormData(form.value as HTMLFormElement)

  const ok = await loginUser(formData)
  if (ok) {
    router.push('/feed')
  }
}
</script>

<style scoped lang="scss">
.login-form {
  display: flex;
  flex-direction: column;
}
.form_body {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 5px;
  .field {
    width: 100%;
    input {
      width: 100%;
    }
  }
}
.form_footer {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}
</style>
