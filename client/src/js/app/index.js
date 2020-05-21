import { createHook } from "overmind-react";
import { createOvermind } from "overmind";
import socket from '../socket';
import { logLoader } from "../../util/logloader";
logLoader(module);
const state = {
    title: "This title",
    role: 'undefined',
    control: null,
    leader: null ,
    otherRoles: {

    }
}
socket.off('confirm')
const cb = () => { console.log('F in app mpw been received') }
// socket.on('confirm', cb)

// socket.off('confirm',cb)
const actions = {
    setRole({ state }, role) {
        state.role = role
        socket.emit('setrole', { role })
        sessionStorage.setItem('role',role)
    },
    actionCB({state},data){
        console.log("ACTION CB has been called")
        socket.emit('debug', "From ActionCB")
        try{
            socket.emit('debug', state.title + "title")
        } catch (e){
            socket.emit('debug', "Error: " + e)
        }
    }
}
const effects = {
    socket: {
        onConfirm(data){
            socket.emit("debug", "the onconfirm " + data)
        }
    }
}
socket.on('confirm',effects.socket.onConfirm)
console.log("conform source code", effects.socket.onConfirm + "")
// actions.actionCB()
const onInitialize = (
    {
  state,
  actions,
  effects
}, overmind
) => {

  console.log("INITTED")
  socket.emit('debug','it is initialized')
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
        devtools: "localhost:3031"
    });
    console.log(app.state);
    useApp = createHook();
};
// const {actions,state} = useApp()
if (!module.hot) {
    console.log("not hot");
    //   initialize();
    initialize();
} else {
    module.hot.dispose(data => {
        console.log("disposing of the CB ", cb + "")
        socket.off('confirm', cb)
        data.cb = cb
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
