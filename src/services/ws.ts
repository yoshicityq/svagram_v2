import useAuthStore from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { useNotification } from '@kyvg/vue3-notification'

let socket: WebSocket | null = null
const { notify } = useNotification()
export function connectWs() {
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)
  ) {
    return socket
  }

  socket = new WebSocket('ws://localhost:3000')

  const profileStore = useProfileStore()
  const authStore = useAuthStore()

  //открыли соединение
  socket.onopen = () => {
    console.log('Connected to WS server')

    let token = authStore.accessToken
    sendWsMessage({ type: 'auth', token: token })
  }

  //получение сообщение с сервера
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      if ('notification' in data) {
        notify({
          title: data.notification.title,
          text: data.notification.text,
          type: data.notification.type,
        })
      }

      if (data.type === 'online-check') profileStore.isOpenedUserOnline = data.res
    } catch (error) {
      console.log('WS raw message:', event.data)
    }
  }

  //закрыли соединение
  socket.onclose = () => {
    console.log('Disconnected from WS server')
  }

  //при ошибке
  socket.onerror = (error) => {
    console.error('WS error:', error)
  }

  return socket
}

export function getWs() {
  return socket
}

export function sendWsMessage(payload: unknown) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload))
  }
}

export function closeWs() {
  if (socket) {
    socket.close()
    socket = null
  }
}
