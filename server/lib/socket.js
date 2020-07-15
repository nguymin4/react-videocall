const io = require('socket.io');
const users = require('./users');
const rooms = require('./rooms')
const { proxyMethods } = require('./proxy')
const version = 2
let leaderConnectedToControl = false


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
    // joinByName('Mike')
    // joinByName("Think")
    rooms.connect(room)
    // rooms.join("main","session-16")
}
// doConnect()
const handleRegistration = async (socket, data) => {
    const broadcast = (message) => {
        socket.broadcast.emit("message", { message })
    }
    const reply = (message) => {
        console.log("reply with ", message)
        socket.emit("message", { message })
    }

    const roomName = data.room || "main"
    if (version) {
        if (!rooms.exists(roomName) || ((data.control === 'reset') || (version === 2 && data.control === 'r'))) {
            console.log("reset")
            rooms.create(roomName, data.id)
            // broadcast(`${data.name} has created ${roomName}`)
        }
        // broadcast(`${data.name} has joined ${roomName}`)
        rooms.join(roomName, data.id)
        // if (data.control === 'connect' || (version === 2 && data.control === 'c')) {
        //     const members = rooms.members(roomName)
        //     console.log(`connecting ${members.join(',')}`)
        //     rooms.connect(roomName)

        // }

        return
    }
    // if (data.role === "leader" || data.role === "control") {
    //     socket.broadcast.emit("message", { message: `${data.name} has registered as ${data.role} for ${data.room}` })
    //     await users.create(socket, data)
    // } else {
    //     await users.create(socket, data)
    //     const leader = users.getByRole("leader")

    //     if (!leader) {
    //         socket.emit("message", { message: "no leader registered yet" })
    //     } else {
    //         socket.emit("calljoin", { jointo: leader })
    //         const control = users.getByRole("control")
    //         if (control) {
    //             socket.emit("calljoin", { jointo: control })
    //         }

    //         if (!leaderConnectedToControl) {
    //             console.log("connected to control")
    //             leaderConnectedToControl = true
    //             const controlSocket = users.getReceiver(control)
    //             if (controlSocket) {
    //                 controlSocket.emit("calljoin", { jointo: leader })
    //             } else {
    //                 console.log("no control socket")
    //             }
    //         }
    //     }

    //     // try {
    //     //     socket.emit("calljoin", { id })
    //     //     console.log("sent")
    //     // } catch (e) {
    //     //     console.log("EFFING", e)
    //     // }
    // }
    // return
    // //find if someone else had that role
    // oldUser = users.getByRole(data.role)
    // if (oldUser) {
    //     const receiver = user.get(oldUser)
    //     receiver.emit('unenrole', { role: oldRole })
    //     if (data.role === 'leader') users.sendMessage('disconnectleader')
    //     else if (data.role === 'control') users.sendMessage('disconnectcontrol')
    //     else {
    //         receiver.emit('disconnectleader')
    //         receiver.emit('disconnectcontrol')
    //     }
    // }
    // users.setProp(socket, id, 'role', data.role)
    // if (data.role === 'leader') {
    //     users.broadcast('connectleader', { leader: id })
    // } else if (data.role === 'control') {
    //     users.broadcast('connectcontrol', { control: id })
    // } else {
    //     const receiver = users.getReceiver(id)
    //     const leader = users.getByRole('leader')
    //     const control = users.getByRole('control')
    //     if (leader) receiver.emit('connectleader', { leader: users.getByRole('leader') })
    //     if (control) receiver.emit('connectcontrol', { leader: users.getByRole('leader') })
    // }

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
    const registerOrIdentify = (data) => {
        if (data.room === 'undefined') return
        const roomName = data.room
        rooms.join(roomName, data.id)
        rooms.computeCascade(roomName)
        rooms.sendToMembers(roomName, 'members', { members: rooms.members(roomName), cascade: rooms.cascade(roomName) })
    }

    const doIdentify = () => {

        socket.emit('identify')
            .on('identified', async (data) => {
                await handleRegistration(socket, data)
                console.log("identified client", data.id, data.name)
                id = await users.create(socket, data);
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
            doConnect(data.room)
        })
        .on('relay', (data) => {
            // console.log("Relay ", JSON.stringify(data))
            const receiver = users.getReceiver(data.to);
            if (receiver) {
                receiver.emit(data.op, data);
            } else {
                socket.emit('relayError', data)
            }
        })
        .on('register', async (data) => {
            const roomName = data.room
            id = await users.create(socket, data);
            if (!rooms.exists(roomName) || ((data.control === 'reset') || (version === 2 && data.control === 'r'))) {
                rooms.create(roomName, data.id)
            }
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

        // .on('setrole', (data) => {
        //     users.setProp(id, 'role', data.role)
        //     users.broadcast('message', { from: data.id, message: `${data.name} is ${data.role}` })
        // }
        // )

        // .on('setname', (data) => {
        //     console.log("seting name", data)
        //     if (!data) {
        //         socket.send('message', { message: "no was data sent" })
        //         return
        //     }
        //     users.setProp(id, 'name', data.name)
        //     users.broadcast('message', { from: data.name, message: `Session ${data.id} is ${data.name}` })
        // })
        .on('call', (data) => {
            const receiver = users.getReceiver(data.to);
            if (receiver) {
                receiver.emit('call', { ...data, from: id });
            } else {
                socket.emit('failed');
            }
        })
        .on('end', (data) => {
            if (version) {
                rooms.clearRoom(users.getRoom(id))
            }
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