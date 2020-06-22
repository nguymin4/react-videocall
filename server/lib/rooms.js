const users = require('./users');
const rooms = {}
/* A room is a named object with a list of members and the identity of the last to join
*/
exports.exists = (roomName) => {
    if (!roomName || roomName === 'undefined') roomName = 'main'
    return rooms[roomName]
}
exports.connect = (roomName) => {
    const room = exports.exists(roomName)
    room.sequence = 0

}

exports.next = (roomName) => {
    const room = exports.exists(roomName)
    const sequence = ++room.sequence
    const members = room.order
    // console.log("next", members, sequence)
    if (sequence >= members.length) return false
    const thisMember = members[sequence - 1]
    const nextMember = members[sequence]
    const controlSocket = users.getReceiver(thisMember)
    console.log("connect ", thisMember, nextMember)
    controlSocket.emit("calljoin", { opts: {index: sequence - 1, members: members.length}, jointo: nextMember })
    return true
    
}
exports.create = (roomName) => {
    if(!rooms[roomName]) rooms[roomName] = { count: 0, members: {}, order:[] }
}
exports.join = (roomName, id) => {
    const room = exports.exists(roomName)
    if (room.members[id]) return
    room.members[id] = { }
    room.order.push(id)
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