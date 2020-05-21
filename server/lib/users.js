/* eslint-disable no-await-in-loop */
const haiku = require('./haiku');

const users = {};
const userRoles = {}

// Random ID until the ID is not in use
let count = 1
async function randomID() {
    let id = //haiku();//
        "user-" + count++
    while (id in users) {
        await Promise.delay(5);
        id = haiku();
    }
    return id;
}

exports.create = async (socket, oldId) => {
    let id
    if (oldId) {
        id = oldId
    } else {
        id = await randomID();
    }
    users[id] = socket;
    userRoles[id] = ''
    return id;
};

exports.get = (id) => users[id];

exports.remove = (id) => delete users[id];

exports.setRole = (id, role) => userRoles[id] = role

exports.getRole = (role) => {
    let id
    Object.keys(userRoles).forEach((key) => { if (userRoles[key] === role) id = key })
    return id
}

exports.broadcast = (message, data) => {
    users.forEach((socket) => { socket.emit(message, data) })
}
