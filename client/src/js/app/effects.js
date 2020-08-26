import socket from '../socket';

const effects = {
    actions: null,
    state: {},
    setActionsAndState: (actions, state) => {
        effects.actions = actions
        effects.state = state
    },
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
            relayEffect(to, op, params = {}) {
                socket.emit('relay', { ...params, to, op, from: effects.state.attrs.id })
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
            },
            emit(event, data) {
                socket.emit(event, data)
            }
        },
        events: { //socket on-events
            registerAction: null,
            startChat(data) {
                effects.actions.startChatters()
            },
            // endChat(data) {
            //     effects.actions.endChatters()
            // },
            getInfo(data) {
                effects.actions.sendUserInfo(data)
            },
            info(data) { //response from room member to getinfo query
                effects.actions.setUserInfo(data)

            },
            members(data) {
                effects.actions.setMembers(data)
            },
            setRegisterAction(func) {
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