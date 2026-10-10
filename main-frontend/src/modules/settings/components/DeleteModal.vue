<template>
  <Teleport to="#portal">
    <div v-if="modalStore.isDeleteUserOpen" class="modal__wrapper">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="delete-title">
        <!-- Шаг 1: подтверждение -->
        <div v-if="currentStep === 1" class="step">
          <div class="modal__icon">
            <span>!</span>
          </div>

          <h2 id="delete-title" class="modal__title">Удалить аккаунт?</h2>

          <p class="modal__description">
            Вы уверены, что хотите удалить свой аккаунт? Это действие нельзя будет отменить.
          </p>

          <div class="modal__actions">
            <MyButton size="l" @click="cancelDelete"> Отмена </MyButton>

            <MyButton color="primary" size="l" @click="currentStep = 2"> Удалить </MyButton>
          </div>
        </div>

        <!-- Шаг 2: обратный отсчёт -->
        <div v-else-if="currentStep === 2" class="step">
          <h2 id="delete-title" class="modal__title">Удаление аккаунта</h2>

          <p class="modal__description">Аккаунт будет удалён после окончания обратного отсчёта.</p>

          <div class="timer">
            <svg class="timer__svg" viewBox="0 0 120 120">
              <!-- Фоновый круг -->
              <circle class="timer__track" cx="60" cy="60" :r="radius" />

              <!-- Прогресс -->
              <circle
                class="timer__progress"
                cx="60"
                cy="60"
                :r="radius"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="dashOffset"
              />
            </svg>

            <div class="timer__content">
              <span class="timer__count">{{ count }}</span>
              <span class="timer__label">секунд</span>
            </div>
          </div>

          <p class="modal__hint">Вы ещё можете отменить удаление</p>

          <div class="modal__actions">
            <MyButton size="l" @click="cancelDelete" :disabled="isDeleting">
              Отменить удаление
            </MyButton>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { apiFetch } from '@/api/apiFetch'
import MyButton from '@/components/UI/MyButton.vue'
import useModalStore from '@/stores/modals'
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const modalStore = useModalStore()
const router = useRouter()

const DURATION = 10

const currentStep = ref<1 | 2>(1)
const count = ref(DURATION)
const isDeleting = ref(false)

let intervalId: ReturnType<typeof setInterval> | null = null

// Параметры SVG-круга
const radius = 49
const circumference = 2 * Math.PI * radius

const dashOffset = computed(() => {
  const progress = count.value / DURATION

  return circumference * (1 - progress)
})

async function deleteUser() {
  if (isDeleting.value) return

  isDeleting.value = true

  try {
    const response = await apiFetch('/users/me/delete', {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.status}`)
    }

    const data = await response.json()

    if (data?.success) {
      modalStore.isDeleteUserOpen = false
      await router.push('/auth')
    } else {
      throw new Error('Deletion was not confirmed')
    }
  } catch (error) {
    console.error('Не удалось удалить пользователя:', error)

    // Возвращаем возможность повторить
    currentStep.value = 1
  } finally {
    isDeleting.value = false
  }
}

function stopTimer() {
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
}

function startTimer() {
  stopTimer()

  count.value = DURATION

  intervalId = setInterval(() => {
    count.value = Math.max(0, count.value - 1)

    if (count.value === 0) {
      stopTimer()
      void deleteUser()
    }
  }, 1000)
}

function cancelDelete() {
  if (isDeleting.value) return

  stopTimer()

  currentStep.value = 1
  count.value = DURATION

  modalStore.isDeleteUserOpen = false
}

// Запуск таймера на втором шаге
watch(currentStep, (step) => {
  if (step === 2 && modalStore.isDeleteUserOpen) {
    startTimer()
  } else {
    stopTimer()
  }
})

// Сброс при закрытии модалки извне
watch(
  () => modalStore.isDeleteUserOpen,
  (isOpen) => {
    if (!isOpen) {
      stopTimer()
      currentStep.value = 1
      count.value = DURATION
    }
  },
)

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped lang="scss">
.modal__wrapper {
  position: fixed;
  inset: 0;
  z-index: 21;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  background: var(--bg-overlay);
  backdrop-filter: blur(6px);
}

.modal {
  width: 100%;
  max-width: 380px;

  padding: 32px 28px;

  background: var(--card-bg);
  border: 1px solid var(--border-muted);
  border-radius: var(--radius-xl);

  box-shadow: var(--shadow-lg);

  animation: modal-appear 0.25s ease;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;

  gap: 16px;
}

.modal__icon {
  width: 56px;
  height: 56px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;

  font-size: 26px;
  font-weight: 700;
}

.modal__title {
  margin: 0;

  font-size: 21px;
  font-weight: 650;
  line-height: 1.3;
  text-align: center;

  color: var(--text-primary);
}

.modal__description {
  margin: 0;

  font-size: 14px;
  line-height: 1.6;
  text-align: center;

  color: var(--text-secondary);
}

.modal__hint {
  margin: 0;

  font-size: 12px;
  text-align: center;

  color: var(--text-muted);
}

.modal__actions {
  display: flex;
  justify-content: center;
  gap: 12px;

  width: 100%;
  margin-top: 12px;
}

/* Круговой таймер */

.timer {
  position: relative;

  width: 140px;
  height: 140px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin: 12px 0 4px;
}

.timer__svg {
  position: absolute;
  inset: 0;

  width: 100%;
  height: 100%;

  transform: rotate(-90deg);
}

.timer__track,
.timer__progress {
  fill: none;
  stroke-width: 6;
}

.timer__track {
  stroke: var(--border-muted);
}

.timer__progress {
  stroke: #ef4444;
  stroke-linecap: round;

  transition: stroke-dashoffset 1s linear;
}

.timer__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.timer__count {
  font-size: 42px;
  font-weight: 700;
  line-height: 1.1;

  font-variant-numeric: tabular-nums;

  color: var(--text-primary);
}

.timer__label {
  margin-top: 4px;

  font-size: 12px;
  color: var(--text-muted);
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.97);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 480px) {
  .modal {
    padding: 28px 20px;
  }
}
</style>
