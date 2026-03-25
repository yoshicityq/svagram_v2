<template>
  <form class="form" ref="form" @submit.prevent="login">
    <div class="form_header">
      <h1>SWAGRAM</h1>
    </div>
    <div class="form_body">
      <div class="field">
        <input
          name="username"
          type="text"
          :placeholder="$t('placeholder.login')"
          class="form-input"
          v-model="username"
          v-bind="usernameAttrs"
        />
        <div class="field-error">{{ errors.username }}</div>
      </div>
      <div class="field">
        <input
          name="password"
          type="password"
          :placeholder="$t('placeholder.password')"
          class="form-input"
          v-model="password"
          v-bind="passwordAttrs"
        />
        <div class="field-error">{{ errors.password }}</div>
      </div>
    </div>
    <div class="form_footer">
      <MyButton type="submit">{{ $t('buttons.sign_in') }}</MyButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import MyForm from '@/components/MyForm.vue'
import { ref, useTemplateRef } from 'vue'
import { loginUser } from '../api/auth'
import { useRouter } from 'vue-router'
import MyButton from '@/components/UI/MyButton.vue'
import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'
import { useForm } from 'vee-validate'
import { useI18n } from 'vue-i18n'
const router = useRouter()
const form = useTemplateRef('form')
const { t } = useI18n()
const { errors, defineField } = useForm({
  validationSchema: toTypedSchema(
    yup.object({
      username: yup
        .string()
        .required(t('validation.required'))
        .min(4, t('validation.username_length')),
      password: yup.string().required(t('validation.required')),
      // .min(6, t('validation.password_length')),
    }),
  ),
})
const [username, usernameAttrs] = defineField('username', { validateOnModelUpdate: false })
const [password, passwordAttrs] = defineField('password', { validateOnModelUpdate: false })

async function login() {
  const formData = new FormData(form.value as HTMLFormElement)
  try {
    const ok = await loginUser(formData)
    if (ok) {
      router.push('/feed')
    }
  } catch (e) {
    console.log(e)
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
.field-error {
  font-size: 12px;
  color: red;
}
</style>
