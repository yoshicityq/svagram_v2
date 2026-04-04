<template>
  <form class="form" ref="form" @submit.prevent="sendData">
    <div class="form_header">
      <div class="brand">
        <div class="brand-icon">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="12" fill="var(--primary)" />
            <path
              d="M20 10c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm0 3a3.5 3.5 0 110 7 3.5 3.5 0 010-7zm0 14.5c-2.97 0-5.58-1.51-7.12-3.81a7.028 7.028 0 0114.24 0A8.462 8.462 0 0120 27.5z"
              fill="white"
            />
          </svg>
        </div>
        <h1 class="brand-title">{{ $t('title.reg_title') }}</h1>
        <p class="brand-subtitle">{{ $t('description.reg_description') }}</p>
      </div>
    </div>

    <div class="form_body">
      <!-- Username -->
      <div class="field" :class="{ 'field--error': errors.username }">
        <div class="input-wrapper">
          <svg
            class="input-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <input
            name="username"
            type="text"
            :placeholder="$t('placeholder.username')"
            class="form-input"
            v-model="username"
            v-bind="usernameAttrs"
          />
        </div>
        <Transition name="error-fade">
          <div v-if="errors.username" class="field-error">{{ errors.username }}</div>
        </Transition>
      </div>

      <!-- City -->
      <div class="field" :class="{ 'field--error': errors.city }">
        <div class="input-wrapper">
          <svg
            class="input-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <input
            name="city"
            type="text"
            :placeholder="$t('placeholder.city')"
            class="form-input"
            v-model="city"
            v-bind="cityAttrs"
          />
        </div>
        <Transition name="error-fade">
          <div v-if="errors.city" class="field-error">{{ errors.city }}</div>
        </Transition>
      </div>

      <!-- Email -->
      <div class="field" :class="{ 'field--error': errors.email }">
        <div class="input-wrapper">
          <svg
            class="input-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M22 4l-10 8L2 4" />
          </svg>
          <input
            name="email"
            type="text"
            :placeholder="$t('placeholder.email')"
            class="form-input"
            v-model="email"
            v-bind="emailAttrs"
          />
        </div>
        <Transition name="error-fade">
          <div v-if="errors.email" class="field-error">{{ errors.email }}</div>
        </Transition>
      </div>

      <!-- Password -->
      <div class="field" :class="{ 'field--error': errors.password }">
        <div class="input-wrapper">
          <svg
            class="input-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <input
            name="password"
            :type="showPassword ? 'text' : 'password'"
            :placeholder="$t('placeholder.password')"
            class="form-input form-input--password"
            v-model="password"
            v-bind="passwordAttrs"
          />
          <button
            type="button"
            class="toggle-password"
            @click="showPassword = !showPassword"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            tabindex="-1"
          >
            <!-- Eye open -->
            <svg
              v-if="!showPassword"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <!-- Eye closed -->
            <svg
              v-else
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
              />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </button>
        </div>

        <!-- Password strength indicator -->
        <div v-if="password" class="password-strength">
          <div class="strength-bars">
            <span
              v-for="i in 4"
              :key="i"
              class="strength-bar"
              :class="{ 'strength-bar--active': i <= passwordStrength.level }"
              :style="{
                backgroundColor: i <= passwordStrength.level ? passwordStrength.color : undefined,
              }"
            />
          </div>
          <span class="strength-label" :style="{ color: passwordStrength.color }">
            {{ passwordStrength.text }}
          </span>
        </div>

        <Transition name="error-fade">
          <div v-if="errors.password" class="field-error">{{ errors.password }}</div>
        </Transition>
      </div>
    </div>

    <div class="form_footer">
      <MyButton
        type="submit"
        color="primary"
        size="m"
        :disabled="!isSubmitAvailable || isLoading"
        class="submit-btn"
        :class="{ 'submit-btn--loading': isLoading }"
      >
        <span v-if="isLoading" class="spinner" />
        {{ isLoading ? $t('buttons.loading') : $t('buttons.submit') }}
      </MyButton>

      <MyButton
        type="button"
        color="transparent"
        size="m"
        @click="router.push('/auth')"
        class="back-btn"
        :disabled="isLoading"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          style="margin-right: 4px"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        {{ $t('buttons.back') }}
      </MyButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
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

const showPassword = ref(false)
const isLoading = ref(false)

const { errors, defineField } = useForm({
  validationSchema: toTypedSchema(
    yup.object({
      username: yup
        .string()
        .required(t('validation.required'))
        .min(4, t('validation.username_length'))
        .test('unique-username', t('validation.username_not_available'), async (value: string) => {
          if (!value || value.length < 4) return true
          try {
            const response = await apiFetch(`/users/check-username/${value}`)
            const data = await response.json()
            return data.isAvailable
          } catch (e) {
            console.error(e)
            return true
          }
        }),
      city: yup.string().optional(),
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
            console.error(e)
            return true
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
const [city, cityAttrs] = defineField('city', {
  validateOnModelUpdate: false,
})
const [email, emailAttrs] = defineField('email', {
  validateOnModelUpdate: false,
})
const [password, passwordAttrs] = defineField('password', {
  validateOnModelUpdate: false,
})

const passwordStrength = computed(() => {
  const val = password.value || ''
  let score = 0

  if (val.length >= 6) score++
  if (val.length >= 10) score++
  if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++
  if (/[0-9]/.test(val)) score++
  if (/[^A-Za-z0-9]/.test(val)) score++

  const level = Math.min(score, 4)
  const map = [
    { text: '', color: 'transparent' },
    { text: t('password_strength.weak'), color: 'var(--danger)' },
    { text: t('password_strength.medium'), color: 'var(--warning, #f59e0b)' },
    { text: t('password_strength.good'), color: 'var(--info, #3b82f6)' },
    { text: t('password_strength.strong'), color: 'var(--success, #22c55e)' },
  ]

  return { level, ...map[level] }
})

const isSubmitAvailable = computed(() => {
  if (Object.keys(errors.value).length > 0) return false
  return !!(email.value && username.value && password.value)
})

async function sendData() {
  if (isLoading.value) return
  isLoading.value = true

  try {
    const formData = new FormData(form.value as HTMLFormElement)
    const ok = await registerUser(formData)

    if (ok) {
      router.push('/auth')
    }
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.form {
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 32px 28px;
  border: 1px solid var(--card-border);
  border-radius: var(--radius-xl);
  background: var(--card-bg);
  box-shadow: var(--card-shadow);
}

/* ── Header ── */

.form_header {
  display: flex;
  justify-content: center;
  text-align: center;
}

.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.brand-icon {
  margin-bottom: 4px;
}

.brand-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.brand-subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.4;
}

/* ── Body ── */

.form_body {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

/* ── Input wrapper with icon ── */

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: var(--input-placeholder, #9ca3af);
  pointer-events: none;
  transition: color 0.18s ease;
  flex-shrink: 0;
}

.input-wrapper:focus-within .input-icon {
  color: var(--primary);
}

.form-input {
  width: 100%;
  min-height: 46px;
  padding: 0 14px 0 42px;
  border: 1px solid var(--input-border);
  border-radius: var(--radius-sm);
  background: var(--input-bg);
  font-size: 14px;
  color: var(--text-secondary);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.18s ease;
}

.form-input--password {
  padding-right: 44px;
}

.form-input::placeholder {
  color: var(--input-placeholder);
}

.form-input:hover {
  background: var(--input-bg-hover);
  border-color: var(--input-border-hover);
}

.form-input:focus {
  outline: none;
  border-color: var(--input-border-active);
  box-shadow: var(--focus-ring);
}

/* Error state on input */
.field--error .form-input {
  border-color: var(--danger);
}

.field--error .form-input:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

.field--error .input-icon {
  color: var(--danger);
}

/* ── Password toggle ── */

.toggle-password {
  position: absolute;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm, 6px);
  background: transparent;
  color: var(--input-placeholder, #9ca3af);
  cursor: pointer;
  transition:
    color 0.18s ease,
    background-color 0.18s ease;
}

.toggle-password:hover {
  color: var(--text-secondary);
  background: var(--input-bg-hover, rgba(0, 0, 0, 0.04));
}

/* ── Password strength ── */

.password-strength {
  display: flex;
  align-items: center;
  gap: 10px;
}

.strength-bars {
  display: flex;
  gap: 4px;
  flex: 1;
}

.strength-bar {
  height: 4px;
  flex: 1;
  border-radius: 2px;
  background: var(--input-border, #e5e7eb);
  transition: background-color 0.3s ease;
}

.strength-label {
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  transition: color 0.3s ease;
}

/* ── Error message ── */

.field-error {
  font-size: 12px;
  line-height: 1.3;
  color: var(--danger);
}

.error-fade-enter-active,
.error-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.error-fade-enter-from,
.error-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ── Footer ── */

.form_footer {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.submit-btn,
.back-btn {
  width: 100%;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn--loading {
  pointer-events: none;
}

/* ── Spinner ── */

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  vertical-align: middle;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Back button layout ── */

.back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* ── Mobile ── */

@media (max-width: 640px) {
  .form {
    padding: 24px 18px;
    border-radius: var(--radius-lg);
    gap: 18px;
  }

  .brand-title {
    font-size: 24px;
  }
}
</style>
