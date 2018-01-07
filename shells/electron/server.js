const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const path = require('path')

const port = process.env.PORT || 8098

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/build/backend.js'))
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
