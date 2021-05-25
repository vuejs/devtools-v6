const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const path = require('path')
const fs = require('fs')

const port = process.env.PORT || 8098

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

http.listen(port, '0.0.0.0', () => {
  console.log('listening on 0.0.0.0:' + port)
})
