const io = require('socket.io')
const users = require('./users')

/**
 * Initialize when a connection is made
 * @param {SocketIO.Socket} socket
 */
function initSocket(socket) {
  let id
  socket
    .on('init', async () => {
      id = await users.create(socket)
      if (id) {
        socket.emit('init', { id })
      }
      else {
        socket.emit('error', { message: 'Failed to generating user id' })
      }
    })
    .on('request', (data) => {
      const receiver = users.get(data.to)
      if (receiver) {
        receiver.emit('request', { from: id })
      }
    })
    .on('call', (data) => {
      const receiver = users.get(data.to)
      if (receiver) {
        receiver.emit('call', { ...data, from: id })
      }
      else {
        socket.emit('failed')
      }
    })
    .on('end', (data) => {
      const receiver = users.get(data.to)
      if (receiver) {
        receiver.emit('end')
      }
    })
    .on('disconnect', () => {
      users.remove(id)
      console.log(id, 'disconnected')
    })
}

// Only allow the socket handshake to proceed when it originates from this
// same application (i.e. a page actually served by this server). This stops
// arbitrary external clients/pages from opening a connection and immediately
// gaining a valid user session via `users.create(socket)`.
function allowRequest(req, callback) {
  const { origin } = req.headers
  const { host } = req.headers
  let allowed = false
  try {
    allowed = Boolean(origin) && Boolean(host) && new URL(origin).host === host
  }
  catch {
    allowed = false
  }
  callback(null, allowed)
}

module.exports = (server) => {
  io({ path: '/bridge', serveClient: false, allowRequest })
    .listen(server, { log: true })
    .on('connection', initSocket)
}
