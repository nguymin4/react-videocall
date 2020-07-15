import { json } from "overmind";
import { toast } from 'react-toastify';
import labeledStream from '../streamutils/labeledStream'
const actions = {
    startCascade({ state, actions, effects }) {
        if (state.members.length < 2) {
            actions.setMessage("Can't start a cascade with only you in the room.")
            return
        }
        effects.socket.actions.emit('cascade', { room: state.attrs.room })


    },
    setUserEntries({ state }, id) {
        if (!state.users[id]) state.users[id] = {}
        if (!state.roomStreams[id]) state.roomStreams[id] = {}
    },
    setMembers({ state, effects }, data) {
        state.members = data.members
        state.cascade = data.cascade
        state.members.forEach(id => {
            effects.socket.actions.relay(id, 'getInfo')

        })
        for (const key in json(state.roomStreams)) {
            console.log(" Roomstream Key")
            if (!(key in state.members)) {
                delete state.roomStreams[key]
            }
        }

    },
    sendUserInfo({ state, effects }, request) {
        console.log("REQUEST", request)
        const data = Object.assign(json(state.attrs), request)

        effects.socket.actions.relay(request.from, 'info', data)
    },
    setUserInfo({ state, actions }, data) {
        const id = data.id
        delete data.id
        actions.setUserEntries(id)
        state.roomStreams[id].name = data.name
        state.roomStreams[id].control = data.control
        for (const key in data) {
            state.users[id][key] = data[key]
        }
    },
    setMessage({ state, actions }, value = "default message") {
        state._message.text = value;
        toast(value, {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        })
        setTimeout(actions.clearMessage, state._message.delay);
    },
    clearMessage({ state, actions }) {
        state._message.text = "";
    },
    fakeStreams({ state }) {
        state.roomStreams = {
            'Session-1': {
                name: 'Noel',
                stream: null
            }, 'Session-2': {
                name: 'Jess',
                stream: null
            }
        }
    },
    diag({ state }, diag) {
        state.diags.push(diag)
    },
    clearCascade({ state }) {
        state.showCascade = false
        delete state.streams.cascade
        if (state.streams.cascadeMerger) {
            json(state.streams.cascadeMerger).destroy()
            delete state.streams.cascadeMerger
        } ``

    },
    // flashCascade({ state, actions }) {
    //     state.showCascade = true
    //     setTimeout(() => actions.clearCascade(), 5000)
    // },
    addStream({ state }, { name, stream }) {
        console.log('add stream', name, stream)
        state.streams[name] = stream
    },
    addPeerToCascade({ state }, src) {
        state.streams.peer = src
        if (state.cascade.index !== 0) {

            const merger = json(state.streams.cascadeMerger)
            merger.addStream(src, {
                index: -1,
                x: 0, // position of the topleft corner
                y: 0,
                width: merger.width,
                height: merger.height,
            })
        }
    },
    setCascade({ state, actions }, opts) {
        if (state.cascade.index !== opts.index || !state.streams.cascade) {
            if (state.streams.cascade) {
                json(state.streams.cascade).merger.destroy()
            }
            const merger = labeledStream(json(state.streams.local), state.attrs.name,
                opts.index,
                opts.members)
            state.streams.cascadeMerger = merger
            actions.addStream({ name: 'cascade', stream: merger.result })
            state.cascade.index = opts.index
        }
        state.cascade.members = opts.members
        state.showCascade = true
    },
    logEvent({ state }, { evType, message, zargs, cb }) {
        const lastEvent = { evType, message, zargs }
        if (message === 'ping' || message === 'pong')
            state.lastEvent = lastEvent
        // state.events.push(lastEvent)
    },
    clearEvents({ state }) { state.events = [] },

    setAttrs({ state, effects }, attrs) {
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

    setId({ state, effects }, id) {
        state.attrs.id = id
        effects.storage.setAttrs(json(state.attrs))
    },
    setControl({ state, effects }, control) {
        state.attrs.control = control
        effects.storage.setAttrs(json(state.attrs))
    },
    register({ state, actions, effects }, data) {
        let error = false
        if (data.controlValue !== 'undefined') { state.attrs.control = data.controlValue } else {
            actions.setMessage('Missing control value')
            error = true
        }
        if (data.userID !== 'undefined') { state.attrs.name = data.userID } else {
            actions.setMessage('Missing user name')
            error = true

        }
        if (data.roomID !== 'undefined') { state.attrs.room = data.roomID } else {
            actions.setMessage('Missing room name')
            error = true
        }
        // console.log('registering ', json(state.attrs))
        effects.storage.setAttrs(json(state.attrs))
        if (!error) {
            effects.socket.actions.register(json(state.attrs))
        }
    }

}
export default actions