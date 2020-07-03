const users = require('./users');
const rooms = {}
/* A room is a named object with a list of members and the identity of the last to join
*/
exports.all = () => {
    return rooms
}

exports.exists = (roomName) => {
    return rooms[roomName]
}
exports.connect = (roomName) => {
    const room = exports.exists(roomName)
    const cascade = []
    Object.keys(room.members).map(key=>{
        const control = users.getControlOf(key)
        console.log("key/control",key,control)
        const seq = parseInt(control)
        if(seq){
            cascade[seq-1] = key
        }
    })
    console.log("cascade", cascade)
    cascade.map((member, sequence) => {
        console.log("cascade", member)
        const socket = users.getReceiver(member)
        socket.emit("cascade", { index: sequence, members: room.order.length })
    })
    cascade.slice(0, -1).map((member, sequence) => {
        console.log("calljoin", member)
        const socket = users.getReceiver(member)
        const nextMember = cascade[sequence + 1]
        socket.emit("calljoin", { jointo: nextMember, opts: {type: "cascade", index: sequence, members: room.order.length }})
    })
    const control = users.getByRole("control")
    if(control){
        console.log("Cascade to control")
        socket.emit("calljoin", { jointo: nextMember, opts: {type: "cascadeToControl", index: sequence, members: room.order.length }})

    }
}



exports.create = (roomName) => {
    if (!rooms[roomName]) rooms[roomName] = { count: 0, members: {}, order: [] }
}
exports.join = (roomName, id) => {
    const room = exports.exists(roomName)
    if (room.members[id]) return
    room.members[id] = {}
}
exports.leave = (roomName, id) => {
    delete exports.exists(roomName).members[id]
}
exports.lastId = (roomName) => {
    return exports.exists(roomName).lastId
}

exports.members = (roomName) => {
    return Object.keys(exports.exists(roomName).members)
}

