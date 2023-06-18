const path = require('path')
const fs = require('fs')
const express = require('express')
const app = express()
const { createServer } = require('http')
const { Server } = require('socket.io')

const port = process.env.PORT || 8098
const localIp = require('ip').address()

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: true,
  },
})

app.use(express.static(path.join(__dirname, './')))
app.get('/local_ip', function (req, res) {
  res.header('Content-Type', 'application/javascript')
  res.send(`window.process = {
    env: {
      PORT: ${port},
      HOST: '${localIp}'
    }
  }`)
})
app.get('/', function (req, res) {
  const hookContent = fs.readFileSync(path.join(__dirname, '/build/hook.js'), 'utf8')
  const backendContent = fs.readFileSync(path.join(__dirname, '/build/backend.js'), 'utf8')
  res.send([hookContent, backendContent].join('\n'))
})

// Middleman
io.on('connection', function (socket) {
  // Disconnect any previously connected apps
  socket.broadcast.emit('vue-devtools-disconnect-backend')

  socket.on('vue-devtools-init', () => {
    socket.broadcast.emit('vue-devtools-init')
  })

  socket.on('disconnect', (reason) => {
    if (reason.indexOf('client')) {
      socket.broadcast.emit('vue-devtools-disconnect-devtools')
    }
  })

  socket.on('vue-message', data => {
    socket.broadcast.emit('vue-message', data)
  })
})

httpServer.listen(port, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`listening on 0.0.0.0:${port}
open this link http://${localIp}:${port}/app.html when you need remote vue-devtools.`)
})
