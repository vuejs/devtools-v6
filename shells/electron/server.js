const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const path = require('path')

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/build/backend.js'))
})

// Middleman
io.on('connection', function (socket) {
  socket.on('vue-message', data => {
    socket.broadcast.emit('vue-message', data)
  })
})

http.listen(8098, () => {
  console.log('listening on *:8098')
})
