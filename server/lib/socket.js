const io = require('socket.io');
const users = require('./users');
const rooms = require('./rooms')
const version = 2
let leaderConnectedToControl = false
const checkRoom = (socket, id) => {
    console.log("checking room")
}
rooms.create("main")
rooms.join("main","session-1")
rooms.join("main","session-3")
// rooms.join("main","session-4")

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
        console.log("testing new logic")
        if (!rooms.exists(roomName) || ((data.role === 'reset') || (version === 2 && data.role === 'r'))) {
            console.log("reset")
            rooms.create(roomName, data.id)
            broadcast(`${data.name} has created ${roomName}`)
        }
        broadcast(`${data.name} has joined ${roomName}`)
        rooms.join(roomName, data.id)
        if (data.role === 'connect' || (version === 2 && data.role === 'c')) {
            const members = rooms.members(roomName)
            console.log(`connecting ${members.join(',')}`)
            rooms.connect(roomName)
            rooms.next(roomName)
            const retry = () => setTimeout(()=> {
                console.log("retry")
                const done = rooms.next(roomName)
                if(!done) retry()
            },7000)
            retry()
            // for (let i = 0; i < members.length - 1; i++) {
            //     const thisMember = members[i]
            //     const nextMember = members[i + 1]
            //     const controlSocket = users.getReceiver(thisMember)
            //     console.log("connect ", thisMember, nextMember)
            //     controlSocket.emit("calljoin", { jointo: nextMember, version: 1})
            // }
        }

        return
    }
    if (data.role === "leader" || data.role === "control") {
        socket.broadcast.emit("message", { message: `${data.name} has registered as ${data.role} for ${data.room}` })
        await users.create(socket, data)
    } else {
        await users.create(socket, data)
        const leader = users.getRole("leader")

        if (!leader) {
            socket.emit("message", { message: "no leader registered yet" })
        } else {
            socket.emit("calljoin", { jointo: leader })
            const control = users.getRole("control")
            if (control) {
                socket.emit("calljoin", { jointo: control })
            }
            if (!leaderConnectedToControl) {
                console.log("connected to control")
                leaderConnectedToControl = true
                const controlSocket = users.getReceiver(control)
                if (controlSocket) {
                    controlSocket.emit("calljoin", { jointo: leader })
                } else {
                    console.log("no control socket")
                }
            }
        }

        // try {
        //     socket.emit("calljoin", { id })
        //     console.log("sent")
        // } catch (e) {
        //     console.log("EFFING", e)
        // }
    }
    return
    //find if someone else had that role
    oldUser = users.getRole(data.role)
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
    users.setProp(socket, id, 'role', data.role)
    if (data.role === 'leader') {
        users.broadcast('connectleader', { leader: id })
    } else if (data.role === 'control') {
        users.broadcast('connectcontrol', { control: id })
    } else {
        const receiver = users.getReceiver(id)
        const leader = users.getRole('leader')
        const control = users.getRole('control')
        if (leader) receiver.emit('connectleader', { leader: users.getRole('leader') })
        if (control) receiver.emit('connectcontrol', { leader: users.getRole('leader') })
    }

}

/**
 * Initialize when a connection is made
 * @param {SocketIO.Socket} socket
 */
let socketNo = 0
function initSocket(socket) {
    let id;
    const doIdentify = () => {

        socket.emit('identify')
            .on('identified', async (data) => {
                console.log("identified client", data)
                id = await users.create(socket, data);
                users.dump()
                // socket.emit("confirm")

                // if (data.id) id = data.id
                // handleRole(socket,data)

            })
    }

    timeoutIdentify = setTimeout(doIdentify, 1000)
    socket.on('init', () => clearTimeout(timeoutIdentify))

    console.log(`Socket # ${socketNo++} initialized`)
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
        .on('register', async (data) => {
            console.log("registering", data)
            await handleRegistration(socket, data)
        })

        .on('debug', (message) => { console.log("debug", message) })
        .on('request', (data) => {
            console.log(`request to ${data.to}`)
            const receiver = users.getReceiver(data.to);
            if (receiver) {
                receiver.emit('request', { from: id });
            }
        })
        .on('setrole', (data) => {
            users.setProp(id, 'role', data.role)
            users.broadcast('message', { from: data.id, message: `${data.name} is ${data.role}` })
        }
        )

        .on('setname', (data) => {
            console.log("seting name", data)
            if (!data) {
                socket.send('message', { message: "no was data sent" })
                return
            }
            users.setProp(id, 'name', data.name)
            users.broadcast('message', { from: data.name, message: `Session ${data.id} is ${data.name}` })
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
            if (version) {
                checkRoom(socket, id)
            }
            const receiver = users.getReceiver(data.to);
            if (receiver) {
                receiver.emit('end', { from: id });
            }
        })
        .on('disconnect', () => {
            users.remove(id);
            console.log(id, 'disconnected');
        })
}


module.exports = (server) => {
    io({ path: '/bridge', serveClient: false })
        .listen(server, { log: true })
        .on('connection', initSocket);
};
const test = () => {
    const user1 = { id: "u1", room: "room1" }
    const user2 = { id: "u2", room: "room1" }
    users.create(null, user)
}
// test()