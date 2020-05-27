import React, { Component } from 'react';
import _ from 'lodash';
import socket from './socket';
import PeerConnection from './PeerConnection';
import MainWindow from './MainWindow';
import CallWindow from './CallWindow';
import CallModal from './CallModal';
// import logloader from "../util/logloader"
import { useApp } from "./app"
import { ToastContainer } from 'react-toastify'
// import { getActionPaths } from 'overmind/lib/utils';

class App extends Component {
    constructor(props) {
        super();
        this.state = {
            clientId: props.attrs.id || '',
            callWindow: '',
            callModal: '',
            callFrom: '',
            localSrc: null,
            peerSrc: null
        };
        this.pcs = {}; //array of peer connections
        this.config = null;
        this.startCallHandler = this.startCall.bind(this);
        this.endCallHandler = this.endCall.bind(this);
        this.rejectCallHandler = this.rejectCall.bind(this);

    }

    componentDidMount() {
        console.log("component mounted!!")
        "init,calljoin,request,call,end".split(',').forEach(key => socket.off(key))
        socket
            .on('init', (attrs) => {
                const clientId = attrs.id
                document.title = `${clientId} - VideoCall`;
                this.setState({ clientId });
                this.props.setId(clientId)
                socket.emit('debug', `App initted ${clientId}`)

            })
            .on('calljoin', (data) => {
                socket.emit('debug', 'calljoin received')
                console.log('join received', data)
                this.startCallHandler(true, "session-14", { video: true, audio: true })
            })
            .on('request', ({ from: callFrom }) => {
                console.log("request from " + callFrom)
                this.startCallHandler(false, callFrom, { video: true, audio: true })
                // return
                // this.setState({ callModal: 'active', callFrom });
            })
            .on('call', (data) => {
                console.log("Call from ", data.from)
                const pc = this.pcs[data.from]
                if (data.sdp) {
                    pc.setRemoteDescription(data.sdp);
                    if (data.sdp.type === 'offer') pc.createAnswer();
                } else pc.addIceCandidate(data.candidate);
            })
            .on('end', this.endCall.bind(this, false))
            .emit('init', this.props.attrs);
    }

    startCall(isCaller, friendID, config) {
        this.config = config;
        const pc = new PeerConnection(friendID)

        this.pcs[friendID] = pc
        pc
            .on('localStream', (src) => {
                const newState = { callWindow: 'active', localSrc: src };
                if (!isCaller) newState.callModal = '';
                this.setState(newState);
            })
            .on('peerStream', (src) => {
                this.setState({ peerSrc: src })
                pc.peerSrc = src
            })
            .start(isCaller, config);
    }

    rejectCall() {
        const { callFrom } = this.state;
        socket.emit('end', { to: callFrom });
        this.setState({ callModal: '' });
    }

    endCall(isStarter) {
        const keys = Object.keys(this.pcs)
        keys.forEach(
            (key) => {
                const pc = this.pcs[key]
                if (_.isFunction(pc.stop)) {
                    pc.stop(isStarter, key);
                }
            }
        )
        this.config = null;
        this.pcs = {}
        this.setState({
            callWindow: '',
            callModal: '',
            localSrc: null,
            peerSrc: null
        });
    }

    render() {
        const { clientId, callFrom, callModal, callWindow, localSrc, peerSrc } = this.state;
        console.log('calll from', callFrom)
        const pc = this.pcs[Object.keys(this.pcs)[0]]
        return (
            <div>
                <ToastContainer />

                <MainWindow
                    clientId={clientId}
                    startCall={this.startCallHandler}
                />
                {!_.isEmpty(this.config) && (
                    <CallWindow
                        allpcs={this.pcs}
                        status={callWindow}
                        localSrc={localSrc}
                        peerSrc={peerSrc}
                        config={this.config}
                        mediaDevice={pc.mediaDevice}
                        endCall={this.endCallHandler}
                    />
                )}
                <CallModal
                    status={callModal}
                    startCall={this.startCallHandler}
                    rejectCall={this.rejectCallHandler}
                    callFrom={callFrom}
                />
            </div>
        );
    }
}
const WrapApp = () => {
    const { state, actions } = useApp()

    return <div>
        <div>The id is {state.attrs.id} role: {state.attrs.role}</div>
        <App setId={actions.setId} attrs={state.attrs} />
    </div>
}

export default WrapApp;
