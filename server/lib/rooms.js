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
    room.order.map((member, sequence) => {
        console.log("cascade", member)
        const socket = users.getReceiver(member)
        socket.emit("cascade", { index: sequence, members: room.order.length })
    })
    room.order.slice(0, -1).map((member, sequence) => {
        console.log("calljoin", member)
        const socket = users.getReceiver(member)
        const nextMember = room.order[sequence + 1]
        socket.emit("calljoin", { jointo: nextMember, opts: {index: sequence, members: room.order.length }})
    })
}



exports.create = (roomName) => {
    if (!rooms[roomName]) rooms[roomName] = { count: 0, members: {}, order: [] }
}
exports.join = (roomName, id) => {
    const room = exports.exists(roomName)
    if (room.members[id]) return
    room.members[id] = {}
    room.order.push(id)
}
exports.leave = (roomName, id) => {
    delete exports.exists(roomName).members[id]
    room.order = room.order.filter(theId => id !== theId)
}
exports.lastId = (roomName) => {
    return exports.exists(roomName).lastId
}

exports.members = (roomName) => {
    return Object.keys(exports.exists(roomName).members)
}

