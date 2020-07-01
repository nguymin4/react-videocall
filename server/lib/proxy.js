const users = require('./users');
const rooms = require('./rooms')

let history = []
const global = 0
const emitters = []
const cl = (...args) => {
    console.log(...args)
}
// export const removeEmitter = (e)=> emitters = emitters.filter(entry => entry !== e)
exports.proxyMethods = (name, obj, ident) => {
    cl('proxy', name)
    const oldOn = obj.on.bind(obj)
    const oldEmit = obj.emit.bind(obj)
    let seq = 0
    obj.emit = (message, args) => {
        seq++
        oldEmit(message, args)
        if (message !== 'ping' && message !== 'pong' && message !== "history") {
            try {
                JSON.stringify(args)
            } catch (e) {
                args = "Cannot stringify"
            }
            // const constructor = args && args.constructor && args.constructor.name ? args.constructor.name : undefined
            history.push({ evType: `${name}-Emit`, seq, message, zargs: args })
        }
        return obj
    }
    obj.on = (message, cb) => {
        seq++
        const cb1 = (args) => {
            cb(args)
            const constructor = args && args.constructor && args.constructor.name ? args.constructor.name : undefined

            history.push({ evType: `${name}-On`, seq, message, zargs: args })
        }
        oldOn(message, cb1)
        return obj
    }
    const HISTORY_INTERVAL = 40000
    const ENABLE_SEND = false
    if (ENABLE_SEND && name.match(/^socket/)) {
        setInterval(() => {
            console.log("print history")
            history.map((line) => {
                try {
                    console.log(JSON.stringify(line))
                } catch (e) {
                    line.zargs = 'FAIL'
                    console.log(JSON.stringify(line))
                }
            })
            // if (history.length > 10) history = history.slice(-10)
            history = []
            obj.emit('history', history)
            // obj.emit('users', users.all())
            // obj.emit('rooms', rooms.all())
        }, HISTORY_INTERVAL)
    }
}
