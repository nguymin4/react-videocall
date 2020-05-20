const io = require('socket.io');
const users = require('./users');

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
        .on('debug', (message) => { console.log("debug", message) })
        .on('request', (data) => {
            const receiver = users.get(data.to);
            if (receiver) {
                receiver.emit('request', { from: id });
            }
        })
        .on('setrole', (data) => {
            console.log("seting role", data.role)
            socket.emit('confirm',{message: 'confirm'})
            return
            oldUser = user.getRole(data.role)
            if (oldUser) {
                const receiver = user.get(oldUser)
                receiver.emit('unenrole', { role: oldRole })
                if (data.role === 'leader') users.sendMessage('disconnectleader')
                else if (data.role === 'control') users.sendMessage('disconnectcontrol')
                else {
                    receiver.emit('disconnectleader')
                    receiver.emit('disconnectcontrol')
                }
            }
            users.setRole(id, data.role)
            if (data.role === 'leader') {
                users.broadcast('connectleader', { leader: id })
            } else if (data.role === 'control') {
                users.broadcast('connectcontrol', { control: id })
            } else {
                const receiver = users.get(id)
                const leader = users.getRole('leader')
                const control = users.getRole('control')
                if (leader) receiver.emit('connectleader', { leader: users.getRole('leader') })
                if (control) receiver.emit('connectcontrol', { leader: users.getRole('leader') })
            }
        }
        )
        .on('call', (data) => {
            const receiver = users.get(data.to);
            if (receiver) {
                receiver.emit('call', { ...data, from: id });
            } else {
                socket.emit('failed');
            }
        })
        .on('end', (data) => {
            const receiver = users.get(data.to);
            if (receiver) {
                receiver.emit('end');
            }
        })
        .on('disconnect', () => {
            users.remove(id);
            console.log(id, 'disconnected');
        });
}

module.exports = (server) => {
    io({ path: '/bridge', serveClient: false })
        .listen(server, { log: true })
        .on('connection', initSocket);
};
