const users = require('./users');
const rooms = {}
/* A room is a named object with a list of members and the identity of the last to join
*/
exports.exists = (roomName) => {
    if (!roomName || roomName === 'undefined') roomName = 'main'
    return rooms[roomName]
}
exports.connect = (roomName) => {
    exports.exists(roomName).sequence = 0
}

exports.next = (roomName) => {
    const room = exports.exists(roomName)
    const sequence = ++room.sequence
    const members = Object.keys(room.members)
    console.log("next", members, sequence)
    if (sequence >= members.length) return
    const thisMember = members[sequence - 1]
    const nextMember = members[sequence]
    const controlSocket = users.getReceiver(thisMember)
    console.log("connect ", thisMember, nextMember)
    controlSocket.emit("calljoin", { jointo: nextMember, version: 1 })
}
exports.create = (roomName) => {
    if(!rooms[roomName]) rooms[roomName] = { count: 0, members: {} }
}
exports.join = (roomName, id) => {
    const room = exports.exists(roomName)
    if (room.members[id]) return
    room.members[id] = { order: Object.keys(room.members).length }
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