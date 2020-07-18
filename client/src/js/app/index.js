import { createHook } from 'overmind-react';
import { createOvermind } from 'overmind';
import { logLoader } from '../../util/logloader';
import { toast } from 'react-toastify';
import labeledStream from '../streamutils/labeledStream'
import actions from './actions'
import effects from './effects'
import state from './state'
import { proxyMethods, setProxyActions } from './proxyMethods'
export { proxyMethods }

logLoader(module);


let theActions
// console.log('conform source code', effects.socket.onConfirm + '')
// actions.actionCB()

const onInitialize = (
    {
        //   state,
        actions,
        effects
        //
    }
    //  , 

) => {
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
    setProxyActions(app.actions)
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
