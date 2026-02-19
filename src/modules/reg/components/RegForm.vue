<template>
  <form class="form" ref="form" @submit.prevent="sendData">
    <div class="form_header">
      <h1>Registration</h1>
      <p>Please enter the required information</p>
    </div>
    <div class="form_body">
      <div class="form_body__field">
        <input name="username" type="text" placeholder="username" class="form-input" />
      </div>
      <div class="form_body__field">
        <input name="city" type="text" placeholder="city" class="form-input" />
      </div>
      <div class="form_body__field">
        <input name="email" type="text" placeholder="email" class="form-input" />
      </div>
      <div class="form_body__field">
        <input name="password" type="password" placeholder="password" class="form-input" />
      </div>
    </div>
    <div class="form_footer">
      <MyButton type="submit" color="primary">Submit</MyButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { registerUser } from '../api/registration'
import { useRouter } from 'vue-router'
import MyButton from '@/components/UI/MyButton.vue'
const router = useRouter()
const form = useTemplateRef('form')
async function sendData() {
  const formData = new FormData(form.value as HTMLFormElement)

  const ok = await registerUser(formData)

  if (ok) {
    alert('You successfully created an account!')
    router.push('/auth')
  }
}
</script>

<style scoped lang="scss">
.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.form_header p {
  font-size: 13px;
  color: rgb(147, 147, 147);
}
.form_body {
  width: 100%;
  display: flex;
  gap: 20px;
  &__field {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;

    input {
      width: 100%;
    }
  }
}

.form_footer {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.icon {
  width: 50px;
  height: 50px;
}
</style>
