const io = require('socket.io');
const users = require('./users');
const rooms = require('./rooms')
const { proxyMethods } = require('./proxy')


const awaitUsers = (room, n) => new Promise((resolve, reject) => {
    const N_TRIES = 100
    const retries = 0;
    const retry = () => {
        if (rooms.members(room).length >= n) resolve();
        if (retries++ < N_TRIES) setTimeout(retry, 200); else reject()
    };
    retry();

});
const delayFor = (timeout) => new Promise(resolve =>
    setTimeout(resolve, timeout)
)
const N_USERS = 1
const joinByName = (name) => {
    rooms.join("main", users.nameToSession(name))
}

const doConnect = async (room) => {
    await awaitUsers(room, 2)
    console.log("Two users")
    rooms.create(room)
    rooms.connect(room)
}
const handleRegistration = async (socket, data) => {
    const broadcast = (message) => {
        socket.broadcast.emit("message", { message })
    }
    const reply = (message) => {
        console.log("reply with ", message)
        socket.emit("message", { message })
    }

    const roomName = data.room || "main"
    if (!rooms.exists(roomName)) {
        rooms.create(roomName, data.id)
    }
    rooms.join(roomName, data.id)
    return
}

/**
 * Initialize when a connection is made
 * @param {SocketIO.Socket} socket
 */
let socketNo = 0
let messageNo = 0

function initSocket(socket) {
    let id;
    // proxyMethods('socket-' + (socketNo + 1), socket)
    const registerOrIdentify = async (data) => {
        id = await users.create(socket, data);
        const roomName = data.room
        id = await users.create(socket, data);
        if (!rooms.exists(roomName)) {
            rooms.create(roomName, data.id)
        }
        if (data.room === 'undefined') return
        rooms.join(roomName, data.id)
        rooms.computeCascade(roomName)
        rooms.sendToMembers(roomName, 'members', { members: rooms.members(roomName), cascade: rooms.cascade(roomName) })
    }

    const doIdentify = () => {

        socket.emit('identify')
            .on('identified', async (data) => {
                console.log("identified client", data.id, data.name)
                registerOrIdentify(data)
            })
    }

    timeoutIdentify = setTimeout(doIdentify, 1)
    socket.on('init', () => clearTimeout(timeoutIdentify))
    socketNo++
    console.log(`Socket # ${socketNo} initialized`)
    socket
        .on('init', async (data) => {
            console.log("init message received with", data)
            id = await users.create(socket, data);
            console.log("Sending id", id)
            socket.emit('init', { id });
        })

        .on('peerconnect', (data) => {
            console.log('peerconnect', data.trackNo, data.room, data.from, data.friend, JSON.stringify(data.details))
            // rooms.next()
        })
        .on('cascade', async (data) => {
            console.log("GOT CASCADE")
            // doConnect(data.room)
        })
        .on('relay', (data) => {
            console.log("Relay ", data.op, "from", id, "to", data.to)
            const receiver = users.getReceiver(data.to);
            if (receiver) {
                receiver.emit(data.op, data);
            } else {
                socket.emit('relayError', data)
            }
        })
        .on('register', async (data) => {

            registerOrIdentify(data)

        })
        .on('debug', (message) => { console.log("debug", message) })
        .on('request', (data) => {
            console.log(`request to ${data.to}`)
            const receiver = users.getReceiver(data.to);
            if (receiver) {
                receiver.emit('request', { from: id });
            }
        })
        .on('call', (data) => {
            const receiver = users.getReceiver(data.to);
            if (receiver) {
                receiver.emit('call', { ...data, from: id });
            } else {
                socket.emit('failed');
            }
        })
        .on('end', (data) => {
            // if (version) {
            //     rooms.clearRoom(users.getRoom(id))
            // }
            const receiver = users.getReceiver(data.to);
            if (receiver) {
                receiver.emit('end', { from: id });
            }
        })
        .on('disconnect', () => {
            roomName = users.getRoom(id)
            rooms.leave(roomName, id)
            users.remove(id);
            console.log(id, 'disconnected');
            rooms.sendToMembers(roomName, 'members', { members: rooms.members(roomName), cascade: rooms.cascade(roomName) })
        })
}



module.exports = (server) => {
    const ioSocket = io({ path: '/bridge', serveClient: false })
        .listen(server, { log: true })
        .on('connection', initSocket);
    // proxyMethods('io', ioSocket)
};
const test = () => {
    const user1 = { id: "u1", room: "room1" }
    const user2 = { id: "u2", room: "room1" }
    users.create(null, user)
}
// test()