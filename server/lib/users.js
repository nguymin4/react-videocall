/* eslint-disable no-await-in-loop */
const haiku = require('./haiku');

const users = {};

exports.all = ()=> {
    return Object.values(users).map(user=>{user.socket = undefined; return user})
}

// Random ID until the ID is not in use
let count = 1
async function randomID() {
    let id = //haiku();//
        "session-" + count++
    // while (id in users) {
    //     await Promise.delay(5);
    //     id = haiku();
    // }
    if(users[id]) return randomID()
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
exports.getControlOf = (id) => users[id] ? users[id].control : null;

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

exports.getByRole = (role) => {
    let id
    Object.keys(users).forEach((key) => { if (users[key].role === role) id = key })
    return id
}


exports.getName = (id) =>{
    return users[id] && users[id].name
}
exports.dump = () => {
    Object.keys(users).forEach((key)=>{
        const user = {...users[key]}
        user.receiver = "socket"
        console.log(key,user)
    }) 
}

exports.broadcast = (message, data) => {
    Object.keys(users).forEach((key) => { 
        if(users[key].receiver) {
            console.log("broadcasting to", users[key].id)
            users[key].receiver.emit(message, data)
     }})
}
exports.nameToSession = (name) => {
    return Object.keys(users).find(key=>users[key].name ===name)
}
exports.namesToSessions = (list) => {
    return list.map(name=>exports.nameToSession(name)).filter(session=>session)
}
