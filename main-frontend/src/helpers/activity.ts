import { closeWs, handleActivity } from '@/services/ws'

let inactivityTimeout: number | null = null
const INACTIVITY_LIMIT = 0.5 * 60 * 1000 // 5 min

function resetInactivityTimer() {
  if (inactivityTimeout) {
    clearTimeout(inactivityTimeout)
  }
  inactivityTimeout = setTimeout(() => {
    closeWs()
  }, INACTIVITY_LIMIT)
}

function addActivityListeners() {
  window.addEventListener('mousemove', handleActivity)
  window.addEventListener('keydown', handleActivity)
  window.addEventListener('click', handleActivity)
}

function removeActivityListeners() {
  window.removeEventListener('mousemove', handleActivity)
  window.removeEventListener('keydown', handleActivity)
  window.removeEventListener('click', handleActivity)
}

export { addActivityListeners, removeActivityListeners, resetInactivityTimer }
