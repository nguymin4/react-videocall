
import { json } from "overmind";
import { toast } from 'react-toastify';
import labeledStream from '../streamutils/labeledStream'
import PeerConnection from "../PeerConnection"
import VideoStreamMerger from '../streamutils/video-stream-merger';

const actions = {
    relayAction({ state, effects }, { to, op, data }) {
        effects.socket.actions.relayEffect(to, op, data)
    },
    startCascade({ state, actions, effects }) {
        console.clear()
        if (state.members.length < 2) {
            actions.setMessage("Can't start a cascade with only you in the room.")
            return
        }
        actions.startCascaders()
        actions.startControllers()
        actions.startViewers()
    },
    startCascaders({ state, actions }) {
        state.sessions.cascaders.slice(0, -1).map((member, sequence) => {
            state.nextMember = state.sessions.cascaders[sequence + 1]
            actions.relayAction({
                to: member,
                op: "calljoin",
                data: { jointo: state.nextMember }
            })
        })
    },
    startControllers({ state, actions }) {
        state.sessions.controllers.map((member, sequence) => {
            actions.relayAction({
                to: state.nextMember,
                op: "calljoin",
                data: { jointo: member }
            })
            state.nextMember = member
        })
    },
    startViewers({ state, actions }) {
        const nControllers = state.sessions.controllers.length
        state.sessions.viewers.map((member, sequence) => {
            const controller = state.sessions.controllers[sequence % nControllers]
            actions.relayAction({
                to: controller,
                op: "calljoin",
                data: { jointo: member }
            })
        })
    },
    startCall({ state, actions }, { isCaller, friendID, config, opts }) {
        // if (state.callInfo[friendID]) {
        // }
        actions.setupStreams()
        actions.showCallPage()
        const pc = new PeerConnection(friendID, opts, state, actions)
        state.callInfo[friendID] = {
            pc,
            config,
            isCaller,
            opts
        }
        return pc
    },
    showCallPage({ state }) {
        if (state.index !== -1) { //part of cascade
            state.showCascade = true
        } else if (state.attrs.control === 'control') {
            state.showControlRoom = true
            state.showCascade = true
        }
    },

    setupStreams({ state, actions }, opts) {
        const id = state.attrs.id
        if (state.index !== -1) { //part of cascade
            actions.createCasdadeStream(index)
        } else {
            console.log("set up control", json(state.sessions.controllers), id)
            if (state.attrs.control === 'control') {
                console.log("Show CONTROL")
            }
        }
    },
    createCascadeStream({ state, actions }) {
        if (!state.streams.cascadeStream) {
            const merger = labeledStream(json(state.streams.localStream), state.attrs.name,
                state.index,
                state.sessions.cascaders.length)
            state.streams.cascadeMerger = merger
            state.streams.cascadeStream = merger.result
        }

    },
    createControllerStream({ state, actions }, stream) {
        console.log(stream)
        const merger = new VideoStreamMerger({
            width: 800, // Width of the output video
            height: 600, // Height of the output video
            fps: 25, // Video capture frames per second
            clearRect: false, // Clear the canvas every frame
            audioContext: null // Supply an external AudioContext (for audio effects)
        })
        merger.addStream(stream, {
            mute: false, // we don't want sound from the screen (if there is any)
        });
        theMerger.start();
        state.streams.controllerStream = merger.result
        state.streams.controllerMerger = merger
    },

    endCall({ state, actions }, { isStarter, from }) {
        actions.clearCascade()
        if (state.callInfo[from] && !state.callInfo[from].stopped) {
            const callInfo = json(state.callInfo[from])
            callInfo.pc.stop(isStarter.from)
            state.callInfo[from] = {
                pc: null,
                stopped: true
            }
        }

    },
    peerTrackEvent({ state, actions }, { friendID, event: e }) {
        const src = e.streams[0]
        const pc = json(state.callInfo[friendID].pc)
        pc.peerSrc = src
        state.callInfo[friendID] = {
            pc,
            stopped: false
        }
        if (state.index != -1) {
            actions.addPeerToCascade(src)
        } else if (state.attrs.control === 'control') {
            actions.createControllerStream(src)
        }

    },
    // relayAction({ state, effects }, { to, op, data }) {
    //     effects.socket.actions.relayEffect(to, op, data)
    // },
    // startCascade({ state, actions, effects }) {
    //     if (state.members.length < 2) {
    //         actions.setMessage("Can't start a cascade with only you in the room.")
    //         return
    //     }
    //     actions.diag('start cascade')
    //     let nextMember
    //     state.sessions.cascaders.slice(0, -1).map((member, sequence) => {
    //         nextMember = state.sessions.cascaders[sequence + 1]
    //         actions.relayAction({
    //             to: member,
    //             op: "calljoin",
    //             data: { jointo: nextMember }
    //         })
    //     })
    //     state.sessions.controllers.map((member, sequence) => {

    //         actions.relayAction({
    //             to: nextMember,
    //             op: "calljoin",
    //             data: { jointo: member }
    //         })
    //         nextMember = member
    //     })
    // },
    clearCascade({ state }) {
        state.showCascade = false
        state.showControlRoom = false
        delete state.streams.cascadeStream
        if (state.streams.cascadeMerger) {
            json(state.streams.cascadeMerger).destroy()
            delete state.streams.cascadeMerger
        }
        if (state.streams.controllerMerger) {
            json(state.streams.controllerMerger).destroy()
            delete state.streams.controllerMerger
            delete state.streams.controllerStream
        }

    },
    broadcastToRoom({ state, actions }, { message, data }) {
        state.members.forEach(id => {
            effects.socket.actions.relay(id, message, data)
        })
    },
    endCascade({ state, actions, effects }, data) {
        actions.setMessage(`Ending cascade for room '${state.attrs.room}'.`)
        state.members.forEach(id => {
            actions.relayAction({ to: id, op: 'end', data: { from: state.attrs.id } })
        })


    },
    setUserEntries({ state }, id) {
        if (!state.users[id]) state.users[id] = {}
    },
    setMembers({ state, actions }, data) {
        const inArray = (val, array) => {
            return array.filter(e => e === val)
        }
        data.members.forEach(member => {
            if (!inArray(member, state.members) || !state.users[member]) {
                // of user is not in the array then send a 
                actions.relayAction({ to: member, op: 'getInfo' })

            }
        })
        state.members = data.members
        actions.computeCategories()


    },
    computeCategories({ state }) {
        let cascaders = []
        const controllers = []
        const viewers = []
        state.members.forEach(key => {
            const user = state.users[key]
            if (!user) return
            const control = user.control
            const seq = parseInt(control)
            if (seq) {
                if (!cascaders[seq]) cascaders[seq] = []
                cascaders[seq].push(key)
            } else if (control.match(/^c/)) {
                controllers.push(key)
            } else {
                viewers.push(key)
            }
        })
        cascaders = cascaders.flat().filter(a => a)
        state.allSessions = cascaders.concat(controllers).concat(viewers)
        state.sessions = {
            cascaders,
            controllers,
            viewers
        }
        state.index = state.sessions.cascaders.findIndex(e => e === state.attrs.id)

    }, sendUserInfo({ state, actions, effects }, request) {
        const data = Object.assign(json(state.attrs), request)
        actions.relayAction({ to: request.from, op: 'info', data })
    },
    setUserInfo({ state, actions }, data) {
        const id = data.id
        delete data.id
        actions.setUserEntries(id)
        // state.roomStreams[id].name = data.name
        // state.roomStreams[id].control = data.control
        for (const key in data) {
            state.users[id][key] = data[key]
        }
        actions.computeCategories()
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

    diag({ state }, diag) {
        console.log(diag)
        state.diags.push(diag)
    },

    // flashCascade({ state, actions }) {
    //     state.showCascade = true
    //     setTimeout(() => actions.clearCascade(), 5000)
    // },
    addStream({ state }, { name, stream }) {
        state.streams[name] = stream
    },
    addControllerPeer({ state }, src) {

    },
    addPeerToCascade({ state, actions }, src) {
        const id = state.attrs.id
        const control = state.users[id].control
        console.log("CONTROL IS ", control)
        let delta = -1
        if (control === 'control') {
            delta = 1
        }

        state.streams.peerStream = src

        if (state.index !== -1) {
            if (state.sessions.cascaders[0] !== id) {
                const merger = json(state.streams.cascadeMerger)
                merger.addStream(src, {
                    index: delta,
                    x: 0, // position of the topleft corner
                    y: 0,
                    width: merger.width,
                    height: merger.height,
                })
            } else if (state.attrs.controller === 'control') {
                actions.addControllerPeer(src)
            }
        }
    },
    setupStreams({ state, actions }, opts) {
        const id = state.attrs.id
        const index = state.sessions.cascaders.findIndex(e => e === id)
        if (index !== -1) { //part of cascade
            if (!state.streams.cascadeStream) {
                const merger = labeledStream(json(state.streams.localStream), state.attrs.name,
                    index,
                    state.sessions.cascaders.length)
                actions.addStream({ name: 'cascadeMerger', stream: merger })

                actions.addStream({ name: 'cascadeStream', stream: merger.result })
            }
            state.showCascade = true
        } else {
            console.log("set up control", json(state.sessions.controllers), id)
            if (json(state.sessions.controllers).find(e => state.users[e].control === 'control')) {
                console.log("Show")
                state.showControlRoom = true
                state.showCascade = true

            }
        }
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