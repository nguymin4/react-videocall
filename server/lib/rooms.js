const rooms = {}
/* A room is a named object with a list of members and the identity of the last to join
*/
exports.exists = (roomName) => {
    return rooms[roomName]
}
exports.create = (roomName)=> {
    return rooms[roomName] = {count:0,members:{}}
}
exports.join = (roomName,id) => {
    rooms[roomName].members[id]={}
    rooms[roomName].lastId = id
}
exports.leave = (roomName,id) => {
    delete rooms[roomName].members[id]
}
exports.lastId= (roomName) =>{
    return rooms[roomName].lastId
}