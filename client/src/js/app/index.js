import { createHook } from 'overmind-react';
import { json, createOvermind } from 'overmind';
import socket from '../socket';
import { logLoader } from '../../util/logloader';
import { toast } from 'react-toastify';
import labeledStream from '../streamutils/labeledStream'
import actions from './actions'
import effects from './effects'
logLoader(module);
const state = {
    title: 'This title',
    diags: [],
    showCascade: false,
    members: [], //array of member session numbers
    users: {}, // keyed list of users with their data
    roomStreams: { //keyed list of stream information with names
    },
    _message: {
        text: '',
        delay: 1000
    },
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
    cascade: { index: null, members: 0 },
    otherRoles: {

    }
}

let theActions
// console.log('conform source code', effects.socket.onConfirm + '')
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
            theActions.logEvent({ evType: `${name}`, message, zargs: args, cb: () => console.log('did it!') })
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
    console.log('INITTED')
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
        devtools: 'localhost:3031'
    });
    console.log(app.state);
    useApp = createHook();
    console.log('Set attrs')
    // app.actions.setAttrs(app.effects.getAttrs())
};
// const {actions,state} = useApp()
if (!module.hot) {
    console.log('not hot');
    //   initialize();
    initialize();
} else {
    module.hot.dispose(data => {
        // console.log('disposing of the CB ', cb + '')
        // socket.off('confirm', cb)
        // data.cb = cb
        if (data.cb) console.log('THIS IS JUST TO KEEP THIS ALIVE')
    });
    if (!module.hot.data) {
        console.log('no hot data');
        initialize();
        /** Now we should always have module.hot.data */
    } else {
        console.log('Hot data output');
        // console.log('disposing', data.cb + '', cb + '')

        initialize();
    }
}
