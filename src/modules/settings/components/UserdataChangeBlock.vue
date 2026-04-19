<template>
  <div class="change-block">
    <span v-if="section === 'email'" class="current-email">
      {{ $t('helpers.your_email') }}: {{ authStore.user?.email }}
    </span>

    <!-- Step 1: Verify current password -->
    <div class="step">
      <div class="step-row">
        <div
          class="field"
          :class="{ 'field--error': passwordError, 'field--success': passwordVerified }"
        >
          <div class="input-wrapper">
            <LockedIcon class="input-icon" />
            <input
              :type="showPassword ? 'text' : 'password'"
              :placeholder="
                $t(
                  section === 'password'
                    ? 'placeholder.current_password'
                    : 'placeholder.enter_password',
                )
              "
              class="form-input form-input--password"
              v-model="currentPassword"
              @blur="validatePassword"
              :disabled="passwordVerified"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
              tabindex="-1"
            >
              <EyeOnIcon v-if="!showPassword" />
              <EyeOffIcon v-else />
            </button>
          </div>
          <Transition name="msg-fade">
            <span v-if="passwordError" class="field-message field-message--error">
              {{ passwordError }}
            </span>
            <span v-else-if="passwordVerified" class="field-message field-message--success">
              <CheckCircleIcon class="field-message-icon" />
              {{ $t('helpers.password_correct') || 'Password verified' }}
            </span>
          </Transition>
        </div>
        <MyButton :disabled="!passwordVerified || codeSent" @click="sendCode" class="action-btn">
          <template v-if="isSendingCode">
            <span class="btn-loader" />
            <span>{{ $t('buttons.sending_code') }}</span>
          </template>
          <template v-else>
            {{ $t('buttons.send_code') }}
          </template>
        </MyButton>
      </div>
    </div>

    <!-- Step 2: Enter verification code -->
    <Transition name="step-slide">
      <div v-if="codeSent" class="step">
        <span class="step-hint">
          <MailIcon class="step-hint-icon" />
          {{ $t('helpers.code_sent_to_email') }}
        </span>

        <div class="code-input-wrapper">
          <div class="code-slots">
            <div
              v-for="(digit, i) in codeDigits"
              :key="i"
              class="code-slot"
              :class="{
                'code-slot--filled': digit !== '',
                'code-slot--active': focusedSlot === i,
                'code-slot--error': codeError,
                'code-slot--success': codeVerified,
              }"
            >
              <input
                ref="slotRefs"
                type="text"
                inputmode="numeric"
                maxlength="1"
                class="code-slot-input"
                :value="digit"
                @input="onSlotInput(i, $event)"
                @keydown="onSlotKeydown(i, $event)"
                @focus="focusedSlot = i"
                @blur="focusedSlot = -1"
                @paste="onPaste"
                :disabled="codeVerified"
              />
            </div>
          </div>
          <Transition name="msg-fade">
            <span v-if="codeError" class="field-message field-message__code field-message--error">
              {{ codeError }}
            </span>
            <span
              v-else-if="isVerifyingCode"
              class="field-message field-message__code field-message--loading"
            >
              <span class="inline-loader" />
              {{ $t('helpers.verifying_code') }}
            </span>
            <span
              v-else-if="codeVerified"
              class="field-message field-message__code field-message--success"
            >
              <CheckCircleIcon class="field-message-icon" />
              {{ $t('helpers.code_verified') }}
            </span>
          </Transition>
        </div>
      </div>
    </Transition>

    <!-- Step 3: New password or new email -->
    <Transition name="step-slide">
      <div v-if="codeVerified" class="step">
        <div class="step-row">
          <div
            class="field"
            :class="{
              'field--error': section === 'password' ? newPasswordError : newEmailError,
              'field--success':
                section === 'password' ? changeSuccess : emailAvailable || changeSuccess,
            }"
          >
            <div class="input-wrapper">
              <LockedIcon v-if="section === 'password'" class="input-icon" />
              <MailIcon v-else class="input-icon" />

              <!-- Password input -->
              <input
                v-if="section === 'password'"
                :type="showNewPassword ? 'text' : 'password'"
                :placeholder="$t('placeholder.new_password')"
                class="form-input form-input--password"
                v-model="newValue"
                :disabled="changeSuccess"
              />

              <!-- Email input -->
              <input
                v-else
                type="email"
                :placeholder="$t('placeholder.new_email') || 'New email'"
                class="form-input"
                style="padding-left: 42px"
                v-model="newValue"
                :disabled="changeSuccess"
                @blur="validateNewEmail"
                @input="onNewEmailInput"
              />

              <button
                v-if="section === 'password'"
                type="button"
                class="toggle-password"
                @click="showNewPassword = !showNewPassword"
                tabindex="-1"
              >
                <EyeOnIcon v-if="!showNewPassword" />
                <EyeOffIcon v-else />
              </button>
            </div>

            <Transition name="msg-fade">
              <!-- Password errors -->
              <span
                v-if="section === 'password' && newPasswordError"
                class="field-message field-message--error"
              >
                {{ newPasswordError }}
              </span>

              <!-- Email checking -->
              <span
                v-else-if="section === 'email' && isCheckingEmail"
                class="field-message field-message--loading"
              >
                <span class="inline-loader" />
                {{ $t('helpers.checking_email') }}
              </span>

              <!-- Email error -->
              <span
                v-else-if="section === 'email' && newEmailError"
                class="field-message field-message--error"
              >
                {{ newEmailError }}
              </span>

              <!-- Email available -->
              <span
                v-else-if="section === 'email' && emailAvailable && !changeSuccess"
                class="field-message field-message--success"
              >
                <CheckCircleIcon class="field-message-icon" />
                {{ $t('helpers.email_available') }}
              </span>

              <!-- Success -->
              <span v-else-if="changeSuccess" class="field-message field-message--success">
                <CheckCircleIcon class="field-message-icon" />
                {{
                  section === 'password'
                    ? $t('helpers.password_changed')
                    : $t('helpers.email_changed')
                }}
              </span>
            </Transition>
          </div>

          <MyButton
            color="primary"
            :disabled="submitDisabled"
            @click="section === 'password' ? submitNewPassword() : submitNewEmail()"
            class="action-btn"
          >
            <template v-if="isChanging">
              <span class="btn-loader btn-loader--white" />
              <span>{{ $t('buttons.saving') }}</span>
            </template>
            <template v-else>
              {{
                section === 'password'
                  ? $t('buttons.change_password')
                  : $t('buttons.change_email') || 'Change email'
              }}
            </template>
          </MyButton>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import LockedIcon from '@/assets/icons/utils/LockedIcon.vue'
import EyeOnIcon from '@/assets/icons/utils/EyeOnIcon.vue'
import EyeOffIcon from '@/assets/icons/utils/EyeOffIcon.vue'
import MyButton from '@/components/UI/MyButton.vue'
import { h, type FunctionalComponent } from 'vue'
import { apiFetch } from '@/api/apiFetch'
import useAuthStore from '@/stores/auth'

const CheckCircleIcon: FunctionalComponent = () =>
  h(
    'svg',
    {
      viewBox: '0 0 20 20',
      fill: 'currentColor',
      width: '16',
      height: '16',
    },
    [
      h('path', {
        'fill-rule': 'evenodd',
        'clip-rule': 'evenodd',
        d: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z',
      }),
    ],
  )

const MailIcon: FunctionalComponent = () =>
  h(
    'svg',
    {
      viewBox: '0 0 20 20',
      fill: 'currentColor',
      width: '16',
      height: '16',
    },
    [
      h('path', {
        d: 'M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z',
      }),
      h('path', {
        d: 'M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z',
      }),
    ],
  )

const props = defineProps({
  section: {
    type: String,
    required: true,
  },
})

const authStore = useAuthStore()

// ─── State: Step 1 — verify current password ───
const currentPassword = ref('')
const showPassword = ref(false)
const passwordError = ref('')
const passwordVerified = ref(false)
const isValidating = ref(false)

// ─── State: Step 2 — verification code ───
const isSendingCode = ref(false)
const codeSent = ref(false)
const codeDigits = ref<string[]>(['', '', '', '', '', ''])
const focusedSlot = ref(-1)
const slotRefs = ref<HTMLInputElement[]>([])
const codeError = ref('')
const codeVerified = ref(false)
const isVerifyingCode = ref(false)

// ─── State: Step 3 — new password or email ───
const newValue = ref('')
const showNewPassword = ref(false)
const newPasswordError = ref('')
const newEmailError = ref('')
const isCheckingEmail = ref(false)
const emailAvailable = ref(false)
const isChanging = ref(false)
const changeSuccess = ref(false)

// ─── Computed ───
const submitDisabled = computed(() => {
  if (isChanging.value || changeSuccess.value) return true
  if (props.section === 'password') {
    return !newValue.value
  }
  return !emailAvailable.value
})

// ─── Helpers ───
function isEmailFormatValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// ─── Step 1: Validate password on blur ───
async function validatePassword() {
  if (!currentPassword.value) {
    passwordError.value = ''
    passwordVerified.value = false
    return
  }

  isValidating.value = true
  passwordError.value = ''

  try {
    const response = await apiFetch('/users/check-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword: currentPassword.value }),
      credentials: 'include',
    })
    if (!response.ok) throw new Error()

    const data = await response.json()

    if (data.isValid) {
      passwordVerified.value = true
      passwordError.value = ''
    } else {
      throw new Error()
    }
  } catch {
    passwordVerified.value = false
    passwordError.value = 'Wrong password'
  } finally {
    isValidating.value = false
  }
}

// ─── Step 1→2: Send code ───
async function sendCode() {
  isSendingCode.value = true

  try {
    const endpoint =
      props.section === 'password'
        ? '/account/password-change/request'
        : '/account/email-change/request'

    const response = await apiFetch(endpoint, {
      method: 'POST',
      credentials: 'include',
    })
    if (!response.ok) throw new Error()

    codeSent.value = true

    await nextTick()
    setTimeout(() => slotRefs.value[0]?.focus(), 320)
  } catch (e) {
    console.error('[sendCode]', e)
  } finally {
    isSendingCode.value = false
  }
}

// ─── Step 2: Code input ───
function onSlotInput(index: number, event: Event) {
  const input = event.target as HTMLInputElement
  const val = input.value.replace(/\D/g, '')

  if (!val) {
    codeDigits.value[index] = ''
    return
  }

  codeDigits.value[index] = val[0]!
  codeError.value = ''

  if (index < 5) {
    nextTick(() => slotRefs.value[index + 1]?.focus())
  }

  if (codeDigits.value.every((d) => d !== '')) {
    verifyCode()
  }
}

function onSlotKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace') {
    if (codeDigits.value[index] === '' && index > 0) {
      codeDigits.value[index - 1] = ''
      nextTick(() => slotRefs.value[index - 1]?.focus())
    } else {
      codeDigits.value[index] = ''
    }
    codeError.value = ''
  }

  if (event.key === 'ArrowLeft' && index > 0) {
    slotRefs.value[index - 1]?.focus()
  }
  if (event.key === 'ArrowRight' && index < 5) {
    slotRefs.value[index + 1]?.focus()
  }
}

function onPaste(event: ClipboardEvent) {
  event.preventDefault()
  const pasted = (event.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6)

  for (let i = 0; i < 6; i++) {
    codeDigits.value[i] = pasted[i] || ''
  }

  const nextEmpty = codeDigits.value.findIndex((d) => d === '')
  const focusIdx = nextEmpty === -1 ? 5 : nextEmpty
  nextTick(() => slotRefs.value[focusIdx]?.focus())

  if (pasted.length === 6) {
    verifyCode()
  }
}

async function verifyCode() {
  const code = codeDigits.value.join('')
  isVerifyingCode.value = true
  codeError.value = ''

  try {
    const endpoint =
      props.section === 'password'
        ? '/account/password-change/verify_code'
        : '/account/email-change/verify_code'

    const response = await apiFetch(endpoint, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ code }),
    })
    if (!response.ok) throw new Error()

    const data = await response.json()

    if (data.isValid) {
      codeVerified.value = true
    } else {
      throw new Error()
    }
  } catch {
    codeError.value = 'Invalid code. Try again.'
    codeDigits.value = ['', '', '', '', '', '']
    nextTick(() => slotRefs.value[0]?.focus())
  } finally {
    isVerifyingCode.value = false
  }
}

// ─── Step 3: Email validation ───
function onNewEmailInput() {
  // Сбрасываем статус при любом изменении текста
  emailAvailable.value = false
  newEmailError.value = ''
}

async function validateNewEmail() {
  emailAvailable.value = false
  newEmailError.value = ''

  if (!newValue.value) return

  if (!isEmailFormatValid(newValue.value)) {
    newEmailError.value = 'Invalid email format'
    return
  }

  // Нельзя поставить текущую почту
  if (newValue.value === authStore.user?.email) {
    newEmailError.value = 'This is your current email'
    return
  }

  isCheckingEmail.value = true

  try {
    const response = await apiFetch(`/users/check-email/${newValue.value}`)
    const data = await response.json()

    if (!data.isAvailable) {
      newEmailError.value = 'This email is already taken'
      emailAvailable.value = false
    } else {
      emailAvailable.value = true
      newEmailError.value = ''
    }
  } catch (e) {
    console.log(e)
    newEmailError.value = 'Failed to check email'
  } finally {
    isCheckingEmail.value = false
  }
}

// ─── Step 3: Submit new password ───
async function submitNewPassword() {
  if (!newValue.value) return

  if (newValue.value.length < 6) {
    newPasswordError.value = 'Password must be at least 6 characters'
    return
  }

  isChanging.value = true
  newPasswordError.value = ''

  try {
    const response = await apiFetch('/account/password-change/confirm', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ newPassword: newValue.value }),
    })
    if (!response.ok) throw new Error()

    const data = await response.json()
    changeSuccess.value = data.isChanged
  } catch {
    newPasswordError.value = 'Failed to change password'
  } finally {
    isChanging.value = false
  }
}

// ─── Step 3: Submit new email ───
async function submitNewEmail() {
  if (!newValue.value || !emailAvailable.value) return

  isChanging.value = true
  newEmailError.value = ''

  try {
    const response = await apiFetch('/account/email-change/confirm', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ newEmail: newValue.value }),
    })
    if (!response.ok) throw new Error()
    const data = await response.json()

    changeSuccess.value = data.isChanged

    if (authStore.user) {
      authStore.user.email = newValue.value
    }
  } catch {
    newEmailError.value = 'Failed to change email'
  } finally {
    isChanging.value = false
  }
}
</script>

<style scoped lang="scss">
.change-block {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 4px 0;
}

.current-email {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  padding-left: 2px;
}

.step {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.step-hint {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  padding: 8px 14px;
  background: var(--accent-soft);
  border-radius: var(--radius-sm);
}

.step-hint-icon {
  flex-shrink: 0;
  color: var(--accent);
}

/* ── Field ── */

.field {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: var(--input-placeholder);
  pointer-events: none;
  transition: color 0.18s ease;
  flex-shrink: 0;
}

.input-wrapper:focus-within .input-icon {
  color: var(--accent);
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

.form-input:hover:not(:disabled) {
  background: var(--input-bg-hover);
  border-color: var(--input-border-hover);
}

.form-input:focus {
  outline: none;
  border-color: var(--input-border-active);
  box-shadow: var(--focus-ring);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.field--error .form-input {
  border-color: var(--danger);
}

.field--error .form-input:focus {
  box-shadow: 0 0 0 3px rgba(217, 45, 32, 0.12);
}

.field--success .form-input {
  border-color: var(--success);
}

.field--success .form-input:focus {
  box-shadow: 0 0 0 3px rgba(18, 183, 106, 0.12);
}

.toggle-password {
  position: absolute;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--input-placeholder);
  cursor: pointer;
  transition:
    color 0.18s ease,
    background-color 0.18s ease;
}

.toggle-password:hover {
  color: var(--text-secondary);
  background: var(--input-bg-hover);
}

/* ── Field messages ── */

.field-message {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12.5px;
  font-weight: 500;
  padding-left: 2px;
}

.field-message__code {
  justify-content: center;
}

.field-message--error {
  color: var(--danger);
}

.field-message--success {
  color: var(--success);
}

.field-message--loading {
  color: var(--text-muted);
}

.field-message-icon {
  flex-shrink: 0;
}

/* ── Action button ── */

.action-btn {
  flex-shrink: 0;
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

/* ── Code input ── */

.code-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.code-slots {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.code-slot {
  position: relative;
  width: 48px;
  height: 56px;
  border: 2px solid var(--input-border);
  border-radius: var(--radius-sm);
  background: var(--input-bg);
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.15s ease;
}

.code-slot--active {
  border-color: var(--accent);
  box-shadow: var(--focus-ring);
  transform: translateY(-1px);
}

.code-slot--filled {
  border-color: var(--accent-border-strong);
  background: var(--accent-soft);
}

.code-slot--filled.code-slot--active {
  border-color: var(--accent);
}

.code-slot--error {
  border-color: var(--danger);
  background: var(--danger-soft);
  animation: slot-shake 0.35s ease;
}

.code-slot--success {
  border-color: var(--success);
  background: rgba(18, 183, 106, 0.08);
}

.code-slot-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  caret-color: var(--accent);
  outline: none;
}

.code-slot-input:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

/* ── Loaders ── */

.btn-loader {
  width: 16px;
  height: 16px;
  border: 2px solid var(--accent-border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.65s linear infinite;
}

.btn-loader--white {
  border-color: rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
}

.inline-loader {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid var(--border-secondary);
  border-top-color: var(--text-muted);
  border-radius: 50%;
  animation: spin 0.65s linear infinite;
  flex-shrink: 0;
}

/* ── Animations ── */

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes slot-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-4px);
  }
  40% {
    transform: translateX(4px);
  }
  60% {
    transform: translateX(-3px);
  }
  80% {
    transform: translateX(2px);
  }
}

.step-slide-enter-active {
  animation: step-in 0.35s ease;
}

.step-slide-leave-active {
  animation: step-in 0.25s ease reverse;
}

@keyframes step-in {
  from {
    opacity: 0;
    transform: translateY(12px);
    max-height: 0;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    max-height: 200px;
  }
}

.msg-fade-enter-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.msg-fade-leave-active {
  transition: opacity 0.15s ease;
}

.msg-fade-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}

.msg-fade-leave-to {
  opacity: 0;
}

/* ── Responsive ── */

@media (max-width: 600px) {
  .step-row {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }

  .code-slot {
    width: 44px;
    height: 50px;
  }

  .code-slot-input {
    font-size: 20px;
  }
}
</style>
