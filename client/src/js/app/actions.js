import { json } from "overmind";
import { toast } from "react-toastify";
import labeledStream from "../streamutils/labeledStream";
import PeerConnection from "../PeerConnection";
import VideoStreamMerger from "../streamutils/video-stream-merger";

const actions = {
    setAppState({ state }, { prop, value }) {
        state.AppState[prop] = value;
    },
    relayAction({ state, effects }, { to, op, data }) {
        effects.socket.actions.relayEffect(to, op, data);
    },
    startCascade({ state, actions, effects }) {
        console.clear();
        if (state.members.length < 2) {
            actions.setMessage("Can't start a cascade with only you in the room.");
            return;
        }
        actions.startCascaders();
        actions.startControllers();
        actions.startViewers();
    },
    startChat({ state, actions }) {
        state.members.forEach(id => {
            actions.relayAction({
                to: id,
                op: "startChat",
                data: { from: state.attrs.id }
            });
        });
    },
    endChat({ state, actions }) {
        state.members.forEach(id => {
            actions.relayAction({
                to: id,
                op: "endChat",
                data: { from: state.attrs.id }
            });
        });
    },
    initiatesTo({ state }, member) {
        return state.attrs.id < member
    },
    startChatters({ state, actions }) {
        state.isChatting = true
        actions.setStatus('chatting')

        state.members.map((member, sequence) => {
            if (!state.users[member]) return // not set up yet
            if (!state.users[member].remoteStream) state.users[member].remoteStream = new MediaStream()
            if (actions.initiatesTo(member) && (state.users[member].status !== 'connected')) {
                actions.diag("initiating chat")
                if (state.users[member]) {
                    state.users[member].status = 'calling'
                    actions.relayAction({
                        to: member,
                        op: "calljoin",
                        data: { jointo: state.attrs.id, role: 'chat' }
                    });
                }
            }
        });
    },
    endChatters({ state, actions, effects }, data) {
        console.log("ENDING CHATTERS    ")
        state.isChatting = false;
        actions.setStatus('registered')
        actions.setMessage(`Ending chat for room '${state.attrs.room}'.`);
        // actions.endCall({ from: state.attrs.id })
        state.members.forEach(id => {
            actions.relayAction({
                to: id,
                op: "end",
                data: { from: state.attrs.id }
            });
            if (state.users[id] && state.users[id].remoteStream) {
                const stream = json(state.users[id].remoteStream)
                state.users[id].remoteStream = new MediaStream()
                stream.getTracks().forEach(track => {
                    track.stop()
                    stream.removeTrack(track)
                })
            }
        }
        )

    },
    startCascaders({ state, actions }) {
        state.sessions.cascaders.slice(0, -1).map((member, sequence) => {
            state.nextMember = state.sessions.cascaders[sequence + 1];
            actions.relayAction({
                to: member,
                op: "calljoin",
                data: { jointo: state.nextMember, role: 'cascade' }
            });
        });
    },
    startControllers({ state, actions }) {
        state.sessions.controllers.map((member, sequence) => {
            actions.relayAction({
                to: state.nextMember,
                op: "calljoin",
                data: { jointo: member, role: 'control' }
            });
            state.nextMember = member;
        });
    },
    startViewers({ state, actions }) {
        const nControllers = state.sessions.controllers.length;
        state.sessions.viewers.map((member, sequence) => {
            const controller = state.sessions.controllers[sequence % nControllers];
            actions.relayAction({
                to: controller,
                op: "calljoin",
                data: { jointo: member, role: 'view' }
            });
        });
    },
    startCall({ state, actions }, { isCaller, friendID, config, data }) {
        // if (state.callInfo[friendID]) {
        // }
        if (!state.isChatting) {
            actions.setStatus('connecting')
            actions.setupStreams();
            actions.showCallPage();
        }
        const pc = new PeerConnection(friendID);
        state.callInfo[friendID] = {
            pc,
            config,
            isCaller,
            data
        };
        pc
            .on('localStream', (src) => {
            })
            .on('peerTrackEvent', (e) => {
                const src = e.streams[0]
                actions.peerTrackEvent({ friendID, event: e })
            })
            .startPeer(isCaller, config, state);
        return pc;
    },
    showCallPage({ state }) {
        if (state.index !== -1) {
            //part of cascade
            state.showCascade = true;
        } else if (
            parseInt(state.attrs.control, 10) ||
            state.attrs.control.toLowerCase() === "control" ||
            state.attrs.control.toLowerCase() === "viewer"
        ) {
            state.showControlRoom = true;
            state.showCascade = true;
        }
    },

    // setupStreams({ st`ate, actions }, opts) {
    //   const id = state.attrs.id;
    //   actions.createCasdadeStream();
    // },
    createCascadeStream({ state, actions }) {
        if (!state.streams.cascadeStream) {
            const merger = labeledStream(
                json(state.streams.localStream),
                state.attrs.name,
                state.index,
                state.sessions.cascaders.length
            );
            state.streams.cascadeMerger = merger;
            state.streams.cascadeStream = merger.result;
        }
    },
    endCall({ state, actions }, { isStarter, from }) {
        actions.clearCascade();
        state.users[from].status = 'disconnected'
        if (state.callInfo[from] && !state.callInfo[from].stopped) {
            const callInfo = json(state.callInfo[from]);
            callInfo.pc.stop(isStarter.from);
            state.callInfo[from] = {
                pc: null,
                stopped: true
            };
        }
    },
    peerTrackEvent({ state, actions }, { friendID, event: e }) {
        const src = e.streams[0];
        const stream = json(state.users[friendID].remoteStream)
        if (state.isChatting) {
            state.users[state.attrs.id].status
            state.users[friendID].status = 'connected'
            const tracks = src.getTracks()
            tracks.forEach(track => {
                console.log("adding a track")
                stream.addTrack(track, src)
            })
        } else {
            const pc = json(state.callInfo[friendID].pc);
            pc.peerSrc = src;
            state.callInfo[friendID] = {
                pc,
                stopped: false
            };
            actions.addPeerToCascade(src);
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
        console.log("clear cascade")
        state.showCascade = false;
        state.showControlRoom = false;
        delete state.streams.cascadeStream;
        if (state.streams.cascadeMerger) {
            json(state.streams.cascadeMerger).destroy();
            delete state.streams.cascadeMerger;
        }
    },
    broadcastToRoom({ state, effects, actions }, { message, data }) {
        state.members.forEach(id => {
            effects.socket.actions.relay(id, message, data);
        });
    },

    endCascade({ state, actions, effects }, data) {
        actions.setMessage(`Ending cascade for room '${state.attrs.room}'.`);
        actions.endCall({ from: state.attrs.id })
        state.members.forEach(id => {
            actions.relayAction({
                to: id,
                op: "end",
                data: { from: state.attrs.id }
            });
        });
    },
    createUser({ state }, id) {
        if (!state.users[id]) state.users[id] = {};
    },
    deleteUserEntry({ state }, id) {
        const user = state.users[id]
        if (user.remoteStream) {
            const stream = json(user.remoteStream)
            stream.getTracks().forEach(track => {
                track.stop()
                stream.removeTrack(track)
            })
        }
        delete state.users[id]
    },
    fadeUserEntry({ state }, id) {
        const user = state.users[id]
        user.opacity = user.opacity

    },
    setMembers({ state, actions }, data) {
        const inArray = (val, array) => {
            return array.filter(e => e === val);
        };
        const droppedMembers = []
        data.members.forEach(member => {
            if (!inArray(member, state.members) || !state.users[member]) {
                // of user is not in the array then send a
                actions.relayAction({ to: member, op: "getInfo" });
            } else {
                droppedMembers.push(member)
            }
        });
        state.members = data.members;
        droppedMembers.forEach(member => {
            const user = json(state.users[member])
            if (!user) return
            if (user.timeOut) return
            user.timeOut = setTimeout(() => {
                actions.fadeUserEntry(member)
            }, 2000)

        })
        actions.computeCategories();
    },
    computeCategories({ state }) {
        let cascaders = [];
        const controllers = [];
        const viewers = [];
        state.members.forEach(key => {
            const user = state.users[key];
            if (!user) return;
            const control = user.control;
            const seq = parseInt(control, 10);
            if (seq) {
                if (!cascaders[seq]) cascaders[seq] = [];
                cascaders[seq].push(key);
            } else if (control.toLowerCase() === "control") {
                controllers.push(key);
            } else if (control.toLowerCase() === "viewer") {
                viewers.push(key);
            } else {
                actions.setMessage(
                    'Control must be a number, or "control" or "viewer"'
                );
            }
        });
        cascaders = cascaders.flat().filter(a => a);
        state.allSessions = cascaders.concat(controllers).concat(viewers);
        state.sessions = {
            cascaders,
            controllers,
            viewers
        };
        state.index = state.sessions.cascaders.findIndex(e => e === state.attrs.id);
    },
    sendUserInfo({ state, actions, effects }, request) {
        const data = Object.assign(json(state.attrs), request);
        actions.relayAction({ to: request.from, op: "info", data });
    },
    broadcastUserInfo({ state, actions }) {
        state.members.map(member => {
            actions.relayAction({ to: member, op: "info", data: json(state.attrs) });
        })
    },
    setUserInfo({ state, actions }, data) {
        const id = data.id;
        delete data.id;
        console.log("got user info for ", id)
        actions.createUser(id);
        for (const key in data) {
            state.users[id][key] = data[key];
        }
        state.users[id].opacity = 1
        actions.computeCategories();
        if (state.isChatting) {
            // actions.startChatters(data)
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
            progress: undefined
        });
        setTimeout(actions.clearMessage, state._message.delay);
    },
    clearMessage({ state, actions }) {
        state._message.text = "";
    },

    diag({ state }, diag) {
        console.log(diag);
        state.diags.push(diag);
    },

    // flashCascade({ state, actions }) {
    //     state.showCascade = true
    //     setTimeout(() => actions.clearCascade(), 5000)
    // },
    addStream({ state }, { name, stream }) {
        state.streams[name] = stream;
    },
    addControllerPeer({ state }, src) { },
    addPeerToCascade({ state, actions }, src) {
        const id = state.attrs.id;
        // const control = state.users[id].control;

        state.streams.peerStream = src;

        if (state.sessions.cascaders[0] !== id) {
            const merger = json(state.streams.cascadeMerger);
            merger.addStream(src, {
                index: -1,
                x: 0, // position of the topleft corner
                y: 0,
                width: merger.width,
                height: merger.height
            });
        }
    },
    setupStreams({ state, actions }, opts) {
        // const id = state.attrs.id;
        if (!state.streams.cascadeStream) {
            const merger = labeledStream(
                json(state.streams.localStream),
                state.attrs.name,
                state.index,
                state.sessions.cascaders.length
            );
            actions.addStream({ name: "cascadeMerger", stream: merger });

            actions.addStream({ name: "cascadeStream", stream: merger.result });
        }
    },
    logEvent({ state }, { evType, message, zargs, cb }) {
        const lastEvent = { evType, message, zargs };
        if (message === "ping" || message === "pong") state.lastEvent = lastEvent;
        // state.events.push(lastEvent)
    },
    clearEvents({ state }) {
        state.events = [];
    },
    setStatus({ state }, status) {
        state.attrs.status = status;
    },

    setAttrs({ state, effects }, attrs) {
        if (!attrs)
            attrs = {
                name: "undefined",
                room: "main",
                role: "undefined",
                control: "undefined",
                id: null
            };
        state.attrs = attrs;
        effects.storage.setAttrs(json(state.attrs));
    },

    setId({ state, effects }, id) {
        state.attrs.id = id;
        effects.storage.setAttrs(json(state.attrs));
    },
    setControl({ state, effects }, control) {
        state.attrs.control = control;
        effects.storage.setAttrs(json(state.attrs));
    },
    register({ state, actions, effects }, data) {
        let error = false;
        if (data.controlValue !== "undefined") {
            state.attrs.control = data.controlValue;
        } else {
            actions.setMessage("Missing control value");
            error = true;
        }
        if (data.userID !== "undefined") {
            state.attrs.name = data.userID;
        } else {
            actions.setMessage("Missing user name");
            error = true;
        }
        if (data.roomID !== "undefined") {
            state.attrs.room = data.roomID;
        } else {
            actions.setMessage("Missing room name");
            error = true;
        }
        // console.log('registering ', json(state.attrs))
        effects.storage.setAttrs(json(state.attrs));
        if (!error) {
            actions.setStatus('registered')
            actions.broadcastUserInfo()
            effects.socket.actions.register(json(state.attrs));
        }
    }
};
export default actions;
