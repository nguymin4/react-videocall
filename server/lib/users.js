/* eslint-disable no-await-in-loop */
const haiku = require('./haiku');

const users = {};

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

exports.create = async (socket, attrs) => {
    let id
    console.log("creating f ", attrs)
    if (attrs && attrs.id) {
        id = attrs.id
    } else {
        id = await randomID();
        attrs = {}
    }
    attrs.id = id
    attrs.receiver = socket
    users[id] = attrs
    return id;

};

exports.getReceiver = (id) => users[id] ? users[id].receiver : null;

exports.remove = (id) => delete users[id];

exports.setProp = (id, prop, value) => {
    // if (!exports.getReceiver(id)) users.create(socket, id)

    if(users[id]) users[id][prop] = value
}

exports.getRole = (role) => {
    let id
    Object.keys(users).forEach((key) => { if (users[key].role === role) id = key })
    return id
}

exports.broadcast = (message, data) => {
    console.log("broadcasting",users)
    Object.keys(users).forEach((key) => { 
        const thisUser = users[key]
        // thisUser.receiver = 'receiver'
        console.log(message, thisUser)
        console.log('emit',users[key].receiver.emit)
        if(users[key].receiver) users[key].receiver.emit(message, data)
     })
}
