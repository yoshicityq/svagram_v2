const { WebSocketServer } = require('ws')
const jwt = require('jsonwebtoken')

function initWs(server) {
  const wss = new WebSocketServer({ server })

  // userId -> Set<socket>
  const userSockets = new Map()

  function addUserSocket(userId, socket) {
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set())
    }
    userSockets.get(userId).add(socket)
  }

  function removeUserSocket(userId, socket) {
    const sockets = userSockets.get(userId)
    if (!sockets) return

    sockets.delete(socket)

    if (sockets.size === 0) {
      userSockets.delete(userId)
      console.log(`User ${userId} is offline`)
    }
  }

  function sendToUser(userId, payload) {
    const sockets = userSockets.get(userId)
    if (!sockets) return

    const message = JSON.stringify(payload)

    for (const socket of sockets) {
      if (socket.readyState === socket.OPEN) {
        socket.send(message)
      }
    }
  }

  function isUserOnline(userId) {
    const sockets = userSockets.get(userId)
    return !!sockets && sockets.size > 0
  }

  wss.on('connection', (socket, req) => {
    console.log('WS client connected')

    socket.isAuthed = false
    socket.userId = null

    const authTimeout = setTimeout(() => {
      if (!socket.isAuthed) {
        socket.send(
          JSON.stringify({
            type: 'auth_error',
            message: 'Authentication timeout',
          }),
        )
        socket.close()
      }
    }, 5000)

    socket.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString())

        if (data.type === 'auth') {
          const token = data.token

          if (!token) {
            socket.send(
              JSON.stringify({
                type: 'auth_error',
                message: 'Token is required',
              }),
            )
            return
          }

          try {
            const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
            const userId = payload.sub

            if (!userId) {
              socket.send(
                JSON.stringify({
                  type: 'auth_error',
                  message: 'Token payload does not contain user id',
                }),
              )
              socket.close()
              return
            }

            if (socket.userId !== null) {
              removeUserSocket(socket.userId, socket)
            }

            socket.isAuthed = true
            socket.userId = userId

            clearTimeout(authTimeout)
            addUserSocket(userId, socket)

            socket.send(
              JSON.stringify({
                type: 'auth_success',
                userId,
                notification: {
                  title: 'notification.sm_welcome_title',
                  text: 'notification.sm_welcome_text',
                  type: 'system',
                },
              }),
            )

            console.log(`Socket authenticated: user ${userId}`)
          } catch (err) {
            socket.send(
              JSON.stringify({
                type: 'auth_error',
                message: 'Invalid token',
              }),
            )
            socket.close()
          }

          return
        }

        if (!socket.isAuthed) {
          socket.send(
            JSON.stringify({
              type: 'error',
              message: 'Unauthorized',
            }),
          )
          return
        }

        if (data.type === 'online-check') {
          socket.send(
            JSON.stringify({
              type: 'online-check',
              res: isUserOnline(data.userId),
            }),
          )
        }
        console.log(`Message from user ${socket.userId}:`, data)

        // Здесь будет Ваша остальная логика
      } catch (err) {
        socket.send(
          JSON.stringify({
            type: 'error',
            message: 'Invalid JSON',
          }),
        )
      }
    })

    socket.on('close', () => {
      console.log('WS client disconnected')

      if (socket.userId !== null) {
        removeUserSocket(socket.userId, socket)
        clearTimeout(authTimeout)
      }
    })

    socket.on('error', (err) => {
      console.error('WS socket error:', err)
    })

    socket.send(JSON.stringify({ type: 'connected' }))
  })

  return {
    wss,
    sendToUser,
    userSockets,
    isUserOnline,
  }
}

module.exports = { initWs }
