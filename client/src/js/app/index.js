import { createHook } from "overmind-react";
import { json, createOvermind } from "overmind";
import socket from '../socket';
import { logLoader } from "../../util/logloader";
import { toast } from 'react-toastify';
logLoader(module);
const state = {
    title: "This title",
    streams: {
        empty: null,
        local: null,
        toControl: null,
        cascade: null,

    },
    attrs: {},
    events: [],
    lastEvent: {},
    control: null,
    leader: null,
    cascade: {index: null, members: 0},
    otherRoles: {

    }
}
socket.off('confirm')
// const cb = () => { console.log('F in app mpw been received') }
// socket.on('confirm', cb)

// socket.off('confirm',cb)
const actions = {
    addStream({state},{name,stream}){
        console.log("add stream",name,stream )
        state.streams[name]=stream
    },
    setCascade({state},opts) {
        state.cascade.index = opts.index
        state.cascade.members = opts.members
    },
    logEvent({ state }, { evType, message, zargs, cb }) {
        const lastEvent = { evType, message, zargs }
        if (message === 'ping' || message === 'pong')
            state.lastEvent = lastEvent
        state.events.push(lastEvent)
    },
    clearEvents({ state }) { state.events = [] },

    setAttrs({ state }, attrs) {
        if (!attrs) attrs = {
            name: 'undefined',
            room: 'main',
            role: 'undefined',
            control: 'undefined',
            id: null
        }
        state.attrs = attrs
        effects.storage.setAttrs(json(state.attrs))
    },

    setId({ state }, id) {
        state.attrs.id = id
        effects.storage.setAttrs(json(state.attrs))
    },
    setControl({ state }, control) {
        state.attrs.control = control
        effects.storage.setAttrs(json(state.attrs))
    },
    register({ state, effects }, data) {
        if (data.controlValue) state.attrs.control = data.controlValue
        if (data.userID) state.attrs.name = data.userID
        if (data.roomID) state.attrs.room = data.roomID
        // console.log('registering ', json(state.attrs))
        effects.socket.actions.register(json(state.attrs))
        effects.storage.setAttrs(json(state.attrs))
    }

}
const effects = {
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
            register(data) {
                console.log('send register', data)
                socket.emit('register', data)
            },
            debug(data) {
                socket.emit('debug', data)
            },
            gotEvent(data) {
                console.log("got event", JSON.stringify(data))
            }
        },
        events: {
            registerAction: null,
            members({ members }) {
                console.log("Members message", members)
                // theActions.setControl(members.join(','))
            },
            setRegisterAction(func) {
                console.log("register action called")
                effects.socket.events.registerAction = func
            },

            confirm(data) {
                toast(`confirmed ${JSON.stringify(data)}`)

                socket.emit("debug", "the onconfirm " + JSON.stringify(data))
            },
            message(data) {
                console.log("Message received", data)
                toast(data.message)
            },
            identify() {
                console.log("IN THE IDENTIFY")
                const attrs = effects.storage.getAttrs()
                if (attrs) socket.emit('identified', attrs)
            },
            unenrole(data) {
                console.log("Unenroled")
                if (events.socket.actions.registerAction) {
                    console.log("Invoke register action")
                    // evemts.socket.actions.registerAction({roleID: data.role})
                }
            }
        }

    }
}
Object.keys(effects.socket.events).forEach(key => {
    socket.off(key); socket.on(key, effects.socket.events[key])
})
let theActions
// console.log("conform source code", effects.socket.onConfirm + "")
// actions.actionCB()
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
            theActions.logEvent({ evType: `${name}`, message, zargs: args, cb: () => console.log("did it!") })
            cb(args)
        }
        oldOn(message, cb1)
        return obj
    }

}

const onInitialize = (
    {
        //   state,
        actions,
        effects
        //
    }
    //  , 

) => {
    console.log("INITTED")
    socket.emit('debug', 'it is initialized')
    const attrs = effects.storage.getAttrs()
    theActions = actions
    actions.setAttrs(attrs)

}
const config =
{
    state,
    actions,
    effects,
    onInitialize,
}
export let app;
export let useApp;

const initialize = () => {
    app = createOvermind(config, {
        // devtools: 'penguin.linux.test:3031',
        devtools: "localhost:3031"
    });
    console.log(app.state);
    useApp = createHook();
    console.log("Set attrs")
    // app.actions.setAttrs(app.effects.getAttrs())
};
// const {actions,state} = useApp()
if (!module.hot) {
    console.log("not hot");
    //   initialize();
    initialize();
} else {
    module.hot.dispose(data => {
        // console.log("disposing of the CB ", cb + "")
        // socket.off('confirm', cb)
        // data.cb = cb
        if (data.cb) console.log("THIS IS JUST TO KEEP THIS ALIVE")
    });
    if (!module.hot.data) {
        console.log("no hot data");
        initialize();
        /** Now we should always have module.hot.data */
    } else {
        console.log("Hot data output");
        // console.log("disposing", data.cb + "", cb + "")

        initialize();
    }
}
