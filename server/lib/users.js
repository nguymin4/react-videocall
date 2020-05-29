/* eslint-disable no-await-in-loop */
const haiku = require('./haiku');

const users = {};

// Random ID until the ID is not in use
let count = 1
async function randomID() {
    let id = //haiku();//
        "session-" + count++
    // while (id in users) {
    //     await Promise.delay(5);
    //     id = haiku();
    // }
    return id;
}

exports.create = async (socket, attrs) => {
    let id
    if (attrs && attrs.id) {
        id = attrs.id
    } else {
        id = await randomID();
        attrs = {}
    }
    attrs.id = id
    users[id] = {...attrs}
    users[id].receiver = socket
    users[id].connections = {}
    return id;

};

exports.getReceiver = (id) => users[id] ? users[id].receiver : null;

exports.remove = (id) => delete users[id];

exports.setProp = (id, prop, value) => {
    // if (!exports.getReceiver(id)) users.create(socket, id)

    if(users[id]) users[id][prop] = value
}

exports.connect = (id,target,connect) => {
    const user1 = users[id]
    const user2 = users[target]
    if(!user1){
        console.error(`${id} does not exist`)
    } else if(!user2){
        console.error(`${target} does not exist`)
    
    } else if(connect) {
        user1.connections[target] = true
        user2.connections[id] = true
    } else {
        delete user1.connections[target]
        delete user2.connections[id]
    }
    
}

exports.getRole = (role) => {
    let id
    Object.keys(users).forEach((key) => { if (users[key].role === role) id = key })
    return id
}

exports.broadcast = (message, data) => {
    Object.keys(users).forEach((key) => { 
        if(users[key].receiver) {
            console.log("broadcasting to", users[key].id)
            users[key].receiver.emit(message, data)
     }})
}
