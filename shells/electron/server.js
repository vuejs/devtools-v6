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
  socket.on('vue-message', data => {
    socket.broadcast.emit('vue-message', data)
  })
  socket.on('vue-devtools-init', () => {
    socket.broadcast.emit('vue-devtools-init')
  })
})

http.listen(port, () => {
  console.log('listening on *:' + port)
})
