let theActions
export const proxyMethods = (name, obj) => {
    const oldOn = obj.on.bind(obj)
    const oldEmit = obj.emit.bind(obj)
    obj.emit = (message, args) => {
        if (message !== 'ping' && message !== 'pong') {
            theActions.logEvent({ evType: `${name}Emit`, message, zargs: args })
        }
        oldEmit(message, args)
        return obj
    }
    obj.on = (message, cb) => {
        const cb1 = (args) => {
            theActions.logEvent({ evType: `${name}`, message, zargs: args, cb: () => console.log('did it!') })
            cb(args)
        }
        oldOn(message, cb1)
        return obj
    }

}
export const setProxyActions = (actions) =>{
    theActions = actions
}
