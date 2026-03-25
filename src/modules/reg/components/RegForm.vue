<template>
  <form class="form" ref="form" @submit.prevent="sendData">
    <div class="form_header">
      <h1>{{ $t('registration.page_title') }}</h1>
      <p>{{ $t('registration.enter_information') }}</p>
    </div>
    <div class="form_body">
      <div class="form_body__field">
        <input
          name="username"
          type="text"
          placeholder="username"
          class="form-input"
          v-model="username"
          v-bind="usernameAttrs"
        />
        <div class="field-error">{{ errors.username }}</div>
      </div>
      <div class="form_body__field">
        <input name="city" type="text" placeholder="city" class="form-input" />
      </div>
      <div class="form_body__field">
        <input
          name="email"
          type="text"
          placeholder="email"
          class="form-input"
          v-model="email"
          v-bind="emailAttrs"
        />
        <div class="field-error">{{ errors.email }}</div>
      </div>
      <div class="form_body__field">
        <input
          name="password"
          type="password"
          placeholder="password"
          class="form-input"
          v-model="password"
          v-bind="passwordAttrs"
        />
        <div class="field-error">{{ errors.password }}</div>
      </div>
    </div>
    <div class="form_footer">
      <MyButton
        type="submit"
        color="primary"
        :disabled="!isSubmitAvailable"
        :class="{ disabled: !isSubmitAvailable }"
        >{{ $t('buttons.submit') }}</MyButton
      >
      <MyButton type="button" color="transparent" @click="router.push('/auth')">< Назад</MyButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { registerUser } from '../api/registration'
import { useRouter } from 'vue-router'
import MyButton from '@/components/UI/MyButton.vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api/apiFetch'
const router = useRouter()
const form = useTemplateRef('form')
const { t } = useI18n()
const { errors, defineField } = useForm({
  validationSchema: toTypedSchema(
    yup.object({
      username: yup
        .string()
        .required(t('validation.required'))
        .min(4, t('validation.username_length'))
        .test('unique-username', t('validation.username_not_available'), async (value: string) => {
          if (!value) return true
          try {
            const response = await apiFetch(`/users/check-username/${value}`)
            const data = await response.json()
            return data.isAvailable
          } catch (e) {
            console.log(e)
          }
        }),
      email: yup
        .string()
        .required(t('validation.required'))
        .email(t('validation.email_not_valid'))
        .test('unique-email', t('validation.email_not_available'), async (value: string) => {
          if (!value) return true
          try {
            const response = await apiFetch(`/users/check-email/${value}`)
            const data = await response.json()
            return data.isAvailable
          } catch (e) {
            console.log(e)
          }
        }),
      password: yup
        .string()
        .required(t('validation.required'))
        .min(6, t('validation.password_length')),
    }),
  ),
})
const [username, usernameAttrs] = defineField('username', {
  validateOnModelUpdate: false,
})
const [email, emailAttrs] = defineField('email', {
  validateOnModelUpdate: false,
})
const [password, passwordAttrs] = defineField('password', {
  validateOnModelUpdate: false,
})
const isSubmitAvailable = computed(() => {
  if (Object.keys(errors.value).length < 1) {
    if (email.value && username.value && password.value) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
})
async function sendData() {
  try {
    const formData = new FormData(form.value as HTMLFormElement)

    const ok = await registerUser(formData)

    if (ok) {
      alert('You successfully created an account!')
      router.push('/auth')
    }
  } catch (e) {
    console.log(e)
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

    input {
      width: 100%;
    }
  }
}

.form_footer {
  margin-top: 30px;
  align-self: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}

.icon {
  width: 50px;
  height: 50px;
}
.field-error {
  font-size: 12px;
  color: red;
  height: 15px;
}
.disabled {
  opacity: 0.5;
  &:hover {
    box-shadow: none;
  }
}
</style>
