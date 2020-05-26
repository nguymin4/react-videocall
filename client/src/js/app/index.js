import { createHook } from "overmind-react";
import { json, createOvermind } from "overmind";
import socket from '../socket';
import { logLoader } from "../../util/logloader";
import { toast } from 'react-toastify';
logLoader(module);
const state = {
    title: "This title",
    attrs: {},
    control: null,
    leader: null,
    otherRoles: {

    }
}
socket.off('confirm')
// const cb = () => { console.log('F in app mpw been received') }
// socket.on('confirm', cb)

// socket.off('confirm',cb)
const actions = {
    setAttrs({ state }, attrs) {
        if (!attrs) attrs = {
            name: 'undefined',
            role: 'undefined',
            id: null
        }
        state.attrs = attrs
        effects.storage.setAttrs(json(state.attrs))
    },

    setId({ state }, id) {
        state.attrs.id = id
        effects.storage.setAttrs(json(state.attrs))
    },
    register({ state, effects }, data) {
        state.attrs.role = data.roleID
        state.attrs.name = data.userID
        state.attrs.room = data.roomID
        console.log('registering ', json(state.attrs))
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
        },
        events: {

            confirm(data) {
                toast('confirmed ')
                socket.emit("debug", "the onconfirm " + data)
            },
            message(data) {
                console.log("Message received", data)
                toast(data.message)
            },
            identify() {
                console.log("IN THE IDENTIFY")
                const attrs = effects.storage.getAttrs()
                if (attrs) socket.emit('identified', attrs)
            }
        }

    }
}
Object.keys(effects.socket.events).forEach(key => {
    socket.off(key); socket.on(key, effects.socket.events[key])
})
// console.log("conform source code", effects.socket.onConfirm + "")
// actions.actionCB()
const onInitialize = (
    {
        //   state,
        actions,
        effects
        //
    }
    //  , overmind
) => {
    console.log("INITTED")
    socket.emit('debug', 'it is initialized')
    // debugger
    const attrs = effects.storage.getAttrs()
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
        // devtools: 'penguin.linux.test:8080', //
        // devtools: "localhost:3031"
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
