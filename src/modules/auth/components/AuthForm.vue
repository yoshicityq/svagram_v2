<template>
  <form class="form" ref="form" @submit.prevent="login">
    <div class="form_header">
      <div class="brand">
        <div class="brand-icon">
          <LogoIcon />
        </div>
        <h1 class="brand-title">SWAGRAM</h1>
        <span class="brand-subtitle">{{ $t('helpers.sign_cont') }}</span>
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
            :placeholder="$t('placeholder.login')"
            class="form-input"
            v-model="username"
            v-bind="usernameAttrs"
          />
        </div>
        <Transition name="error-fade">
          <div v-if="errors.username" class="field-error">{{ errors.username }}</div>
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
        <Transition name="error-fade">
          <div v-if="errors.password" class="field-error">{{ errors.password }}</div>
        </Transition>
      </div>

      <!-- Server error -->
      <Transition name="error-fade">
        <div v-if="serverError" class="server-error">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{{ serverError }}</span>
        </div>
      </Transition>
    </div>

    <div class="form_footer">
      <MyButton
        type="submit"
        color="primary"
        size="m"
        class="submit-btn"
        :disabled="isLoading"
        :class="{ 'submit-btn--loading': isLoading }"
      >
        <span v-if="isLoading" class="spinner" />
        {{ isLoading ? $t('buttons.entering') : $t('buttons.sign_in') }}
      </MyButton>

      <div class="divider">
        <span class="divider-line" />
        <span class="divider-text">{{ $t('helpers.or') }}</span>
        <span class="divider-line" />
      </div>

      <MyButton
        type="button"
        color="transparent"
        size="m"
        class="register-btn"
        @click="router.push('/reg')"
        :disabled="isLoading"
      >
        {{ $t('buttons.create_account') }}
      </MyButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { loginUser } from '../api/auth'
import { useRouter } from 'vue-router'
import MyButton from '@/components/UI/MyButton.vue'
import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'
import { useForm } from 'vee-validate'
import { useI18n } from 'vue-i18n'
import LogoIcon from '@/assets/icons/LogoIcon.vue'

const router = useRouter()
const form = useTemplateRef('form')
const { t } = useI18n()

const showPassword = ref(false)
const isLoading = ref(false)
const serverError = ref('')

const { errors, defineField } = useForm({
  validationSchema: toTypedSchema(
    yup.object({
      username: yup
        .string()
        .required(t('validation.required'))
        .min(4, t('validation.username_length')),
      password: yup.string().required(t('validation.required')),
    }),
  ),
})

const [username, usernameAttrs] = defineField('username', { validateOnModelUpdate: false })
const [password, passwordAttrs] = defineField('password', { validateOnModelUpdate: false })

async function login() {
  if (isLoading.value) return
  isLoading.value = true
  serverError.value = ''

  const formData = new FormData(form.value as HTMLFormElement)

  for (const value of formData.values()) {
    if (!value) {
      serverError.value = t('validation.empty_fields')
      isLoading.value = false
      return
    }
  }

  try {
    const ok = await loginUser(formData)
    if (ok) {
      router.push('/feed')
    } else {
      serverError.value = t('validation.invalid_credentials')
    }
  } catch (e) {
    console.error(e)
    serverError.value = t('validation.somth_wrong')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.form {
  width: 100%;
  max-width: 420px;
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
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--icon-primary);
}

.brand-subtitle {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.4;
}

/* ── Body ── */

.form_body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
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

/* Error state */
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

/* ── Server error ── */

.server-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: var(--radius-sm, 6px);
  background: rgba(239, 68, 68, 0.08);
  color: var(--danger);
  font-size: 13px;
  line-height: 1.4;
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
  gap: 14px;
}

.submit-btn {
  width: 100%;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn--loading {
  pointer-events: none;
}

.register-btn {
  width: 100%;
}

/* ── Divider ── */

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: var(--card-border, #e5e7eb);
}

.divider-text {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
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

/* ── Mobile ── */

@media (max-width: 640px) {
  .form {
    padding: 24px 18px;
    border-radius: var(--radius-lg);
    gap: 18px;
  }

  .brand-title {
    font-size: 28px;
  }
}
</style>
