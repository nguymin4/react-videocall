const _ = require('lodash');
const io = require('socket.io');
const users = require('./users');

/**
 * Send data to friend
 */
function sendTo(to, done, fail) {
  const receiver = users.get(to);
  if (receiver) {
    const next = typeof done === 'function' ? done : _.noop;
    next(receiver);
  } else {
    const next = typeof fail === 'function' ? fail : _.noop;
    next();
  }
}

/**
 * Initialize when a connection is made
 * @param {SocketIO.Socket} socket
 */
function initSocket(socket) {
  let id;
  socket
    .on('init', async () => {
      id = await users.create(socket);
      socket.emit('init', { id });
    })
    .on('request', (data) => {
      sendTo(data.to, to => to.emit('request', { from: id }));
    })
    .on('call', (data) => {
      sendTo(
        data.to,
        to => to.emit('call', { ...data, from: id }),
        () => socket.emit('failed')
      );
    })
    .on('end', (data) => {
      sendTo(data.to, to => to.emit('end'));
    })
    .on('disconnect', () => {
      users.remove(id);
      console.log(id, 'disconnected');
    });

  return socket;
}

module.exports = (server) => {
  io
    .listen(server, { log: true })
    .on('connection', initSocket);
};
