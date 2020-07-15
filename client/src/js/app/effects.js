import socket from '../socket';

const effects = {
    actions: null,
    setActions: (actions) => effects.actions = actions,
    storage: {
        setAttrs(attrs) {
            sessionStorage.setItem('attrs', JSON.stringify(attrs))
        },
        getAttrs() {
            const item = sessionStorage.getItem('attrs')
            if (item) return JSON.parse(item)
            return null
        }

    },

    socket: {
        actions: {
            relay(to,op,params={}){
                socket.emit('relay', {to,op, ...params})
            },
            register(data) {
                console.log('send register', data)
                socket.emit('register', data)
            },
            debug(data) {
                socket.emit('debug', data)
            },
            gotEvent(data) {
                console.log('got event', JSON.stringify(data))
            }
        },
        events: { //socket on-events
            registerAction: null,
            info(data){ //response from room member to getinfo query
                effects.actions.setUserInfo(data)

            },
            members(data) {
                console.log('Members message', data.members)
                effects.actions.setMembers(data.members)
            },
            setRegisterAction(func) {
                console.log('register action called')
                effects.socket.events.registerAction = func
            },

            confirm(data) {
                toast(`confirmed ${JSON.stringify(data)}`)

                socket.emit('debug', 'the onconfirm ' + JSON.stringify(data))
            },
            message(data) {
                console.log('Message received', data)
                toast(data.message)
            },
            identify() {
                console.log('IN THE IDENTIFY')
                const attrs = effects.storage.getAttrs()
                if (attrs) socket.emit('identified', attrs)
            },
            unenrole(data) {
                console.log('Unenroled')
                if (events.socket.actions.registerAction) {
                    console.log('Invoke register action')
                    // evemts.socket.actions.registerAction({roleID: data.role})
                }
            }
        }

    }
}
Object.keys(effects.socket.events).forEach(key => {
    socket.off(key); socket.on(key, effects.socket.events[key])
})
export default effects