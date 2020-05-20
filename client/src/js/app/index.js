import { createHook } from "overmind-react";

import { createOvermind } from "overmind";
import socket from '../socket';
// import { createOvermind } from "../util/statemanager";
// import { namespaced } from "overmind/config";
// import dev from "./dev";
// import errorhandler from "./errorhandler";
// import demo from "./demo";
// import counters from "./counters";
console.log("loaded index")
import { logLoader } from "../../util/logloader";
logLoader(module);
const state = {
    title: "This title",
    role: 'und'
}
// socket.off('confirm')
const cb = () => { console.log('FFF in app mpw been received') }
socket.on('confirm', cb)

// socket.off('confirm',cb)
const actions = {
    setRole({ state }, role) {
        state.role = role
        socket.emit('setrole', { role })
        console.log("set the role")
    }
}
const metaconfig = {};
metaconfig.main =
    {
        state,
        actions
    }
// metaconfig.counters = counters;
// metaconfig.errorhandler = errorhandler;
// metaconfig._dev = dev;
// metaconfig._demo = demo;

const config = metaconfig.main //namespaced(metaconfig);
console.log("Config", config);

// console.log("state", state);
export let app;
export let useApp;

const initialize = () => {
    app = createOvermind(config, {
        // devtools: 'penguin.linux.test:8080', //
        // devtools: "localhost:3031"
    });
    console.log(app.state);
    useApp = createHook();
};

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
        console.log("Hot data");
        // console.log("disposing", data.cb + "", cb + "")

        initialize();
    }
}
