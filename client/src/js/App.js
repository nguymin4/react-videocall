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
import { getActionPaths } from 'overmind/lib/utils';

console.log("version 566")



class App extends Component {
    constructor(props) {
        super();
        console.log("recovered ID", props.attrs.id)
        this.state = {
            clientId: props.attrs.id || '',
            callWindow: '',
            callModal: '',
            callFrom: '',
            localSrc: null,
            peerSrc: null
        };
        this.pc = {};
        this.config = null;
        this.startCallHandler = this.startCall.bind(this);
        this.endCallHandler = this.endCall.bind(this);
        this.rejectCallHandler = this.rejectCall.bind(this);

    }

    componentDidMount() {
        console.log("mounted", this.props.attrs)
        socket
            .on('init', (attrs) => {
                const clientId = attrs.id
                document.title = `${clientId} - VideoCall`;
                this.setState({ clientId });
                socket.emit('debug', `App initted ${clientId}`)
            })
            .on('confirm', () => { console.log('confirm in the App callback has been received') })
            .on('request', ({ from: callFrom }) => {
                console.log("request from " + callFrom)
                this.setState({ callModal: 'active', callFrom });
            })
            .on('call', (data) => {
                if (data.sdp) {
                    this.pc.setRemoteDescription(data.sdp);
                    if (data.sdp.type === 'offer') this.pc.createAnswer();
                } else this.pc.addIceCandidate(data.candidate);
            })
            .on('end', this.endCall.bind(this, false))
            .emit('init', this.props.attrs);
    }

    startCall(isCaller, friendID, config) {
        this.config = config;
        this.pc = new PeerConnection(friendID)
            .on('localStream', (src) => {
                const newState = { callWindow: 'active', localSrc: src };
                if (!isCaller) newState.callModal = '';
                this.setState(newState);
            })
            .on('peerStream', (src) => this.setState({ peerSrc: src }))
            .start(isCaller, config);
    }

    rejectCall() {
        const { callFrom } = this.state;
        socket.emit('end', { to: callFrom });
        this.setState({ callModal: '' });
    }

    endCall(isStarter) {
        if (_.isFunction(this.pc.stop)) {
            this.pc.stop(isStarter);
        }
        this.pc = {};
        this.config = null;
        this.setState({
            callWindow: '',
            callModal: '',
            localSrc: null,
            peerSrc: null
        });
    }

    render() {
        const { clientId, callFrom, callModal, callWindow, localSrc, peerSrc } = this.state;
        return (
            <div>
                <ToastContainer />

                <MainWindow
                    clientId={clientId}
                    startCall={this.startCallHandler}
                />
                {!_.isEmpty(this.config) && (
                    <CallWindow
                        status={callWindow}
                        localSrc={localSrc}
                        peerSrc={peerSrc}
                        config={this.config}
                        mediaDevice={this.pc.mediaDevice}
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
    
    return <div> <App attrs={state.attrs}/> </div>
}

export default WrapApp;
