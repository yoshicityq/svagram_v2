const http = require('http')
const app = require('./app.cjs')
const { initWs } = require('./websocket.cjs')

const PORT = process.env.PORT || 3000

const server = http.createServer(app)
const { wss, sendToUser, userSockets } = initWs(server)

app.set('sendToUser', sendToUser)
app.set('userSockets', userSockets)

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})
