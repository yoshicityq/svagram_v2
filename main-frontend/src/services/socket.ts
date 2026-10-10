import useAuthStore from '@/stores/auth'
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null
export function startSocket(token: string) {
  if (socket) return socket
  socket = io('http://localhost:3000', {
    auth: {
      token: token,
    },
  })
}

export function getSocket() {
  return socket
}

export function closeSocket() {
  socket?.disconnect()
  socket = null
}

export function checkOnline(userId: number): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (!socket) {
      reject(new Error('Socket is not initialized'))
      return
    }

    socket.emit('online_check', { userId }, (response: { isOnline: boolean }) => {
      resolve(response.isOnline)
    })
  })
}
