import React, { useEffect, Component } from 'react';
import _ from 'lodash';
import socket from './socket';
import PeerConnection from './PeerConnection';
import MainWindow from './MainWindow';
import CascadeWindow from './CascadeWindow';

import CallModal from './CallModal';
import MediaDevice from './MediaDevice';
import EmptyStream from './streamutils/EmptyStream';
import { json } from 'overmind'

// import logloader from '../util/logloader'
import { useApp, proxyMethods } from './app'
import { ToastContainer } from 'react-toastify'
// import { getActionPaths } from 'overmind/lib/utils';
class App extends Component {
    constructor(props) {
        super();
        this.oState = props.overmind.state
        this.actions = props.overmind.actions
        this.effects = props.overmind.effects
        this.state = {
            room: this.oState.attrs.room,
            clientId: this.oState.attrs.id || '',
            callWindow: '',
            callModal: '',
            callFrom: '',
            localSrc: null,
            peerSrc: null,
            // nPCs:0
        };

        this.pcs = {}; //array of peer connections
        this.config = null;
        this.startCallHandler = this.startCall.bind(this);
        this.endCallHandler = this.endCall.bind(this);
        this.rejectCallHandler = this.rejectCall.bind(this);

    }

    componentDidMount() {
        'init,calljoin,request,call,end'.split(',').forEach(key => socket.off(key))
        const cl = (...args) => {
            console.log(...args)
            socket.emit('debug')

        }

        // proxyMethods('socket', socket)
        socket
            .on('init', (attrs) => {
                this.effects.socket.actions.gotEvent('init')
                const clientId = attrs.id
                this.actions.setId(attrs.id)
                document.title = `${clientId} - VideoCall`;
                this.setState({ clientId });
                // socket.emit('debug', `App initted ${clientId}`)

            })
            .on('calljoin', (data) => {
                const leader = data.jointo
                // socket.emit('debug', 'calljoin received')
                // console.log('join received', data)
                data.opts.id = this.state.clientId
                this.startCallHandler(true, leader, { video: true, audio: true }, data.opts)
            })
            .on('cascade', (data) => {
                this.actions.setCascade({ index: data.index, members: data.members })

            }

            )
            .on('request', ({ from: callFrom }) => {
                const opts = { id: this.state.clientId + 'R' }
                this.startCallHandler(false, callFrom, { video: true, audio: true }, opts)
                // return
                // this.setState({ callModal: 'active', callFrom });
            })
            .on('call', (data) => {
                console.log('Call from ', data.from)
                const pc = this.pcs[data.from]
                if (data.sdp) {
                    pc.setRemoteDescription(data.sdp);
                    if (data.sdp.type === 'offer') pc.createAnswer();
                } else pc.addIceCandidate(data.candidate);
            })
            .on('end', (data) => this.endCall.bind(this, false)(data.from))
            .emit('init', this.oState.attrs);
    }

    startCall(isCaller, friendID, config, opts = {}) {
        this.config = config;

        // const pc = new PeerConnection(friendID, opts, this.oState, this.actions)
        const pc = this.actions.startCall({ isCaller, friendID, config, opts });
        this.pcs[friendID] = pc

        // this.setState({nPCs: Object.keys(this.pcs).length})
        pc
            .on('localStream', (src) => {
                // if(this.oState.cascade.index === 0 )return
                // const newState = { callWindow: 'active', localSrc: src };
                // if (!isCaller) newState.callModal = '';
                // this.setState(newState);
            })
            .on('peerTrackEvent', (e) => {
                this.actions.peerTrackEvent({ friendID, event: e })
                const src = e.streams[0]
                this.setState({ peerSrc: src })
            })
            .start(isCaller, config, this.pcs);
    }

    rejectCall() {
        const { callFrom } = this.state;
        socket.emit('end', { to: callFrom });
        this.setState({ callModal: '' });
    }

    endCall(isStarter, from) {
        this.actions.endCall({ isStarter, from })
        let keys
        if (from) {
            keys = Object.keys(this.pcs).filter(key => (key === from) || key.startsWith('X' + from))
            // keys = [from]
        } else {
            keys = Object.keys(this.pcs)
        }
        keys.forEach(
            (key) => {
                const pc = this.pcs[key]
                if (_.isFunction(pc.stop)) {
                    pc.stop(isStarter, key);
                }
                delete this.pcs[key]
            }
        )
        if (_.isEmpty(this.pcs)) {
            this.config = null;
            this.pcs = {}
            this.setState({
                callWindow: '',
                callModal: '',
                localSrc: null,
                peerSrc: null,
                // nPCs: 0
            })

        } else {
            // this.setState({nPCs: Object.keys(this.pcs).length})

        };
    }

    render() {
        const { clientId, callFrom, callModal, callWindow, localSrc, peerSrc } = this.state;
        const pc = this.pcs[Object.keys(this.pcs)[0]]

        return (
            <div>
                <ToastContainer />

                {
                    !this.oState.showCascade ?
                        <MainWindow
                            clientId={ clientId }
                            startCall={ this.startCallHandler }
                        />
                        :
                        <CascadeWindow
                            // allpcs={this.pcs}
                            // nPCs={Object.keys(this.pcs).length}
                            // status={callWindow}
                            // localSrc={localSrc}
                            // peerSrc={peerSrc}
                            config={ this.config }
                            // mediaDevice={pc ? pc.mediaDevice : {}}
                            endCall={ this.endCallHandler }
                        />
                }
                {/* {!_.isEmpty(this.config) && false (

                    <CallWindow
                        allpcs={this.pcs}
                        nPCs={Object.keys(this.pcs).length}
                        status={callWindow}
                        localSrc={localSrc}
                        peerSrc={peerSrc}
                        config={this.config}
                        mediaDevice={pc ? pc.mediaDevice : {}}
                        endCall={this.endCallHandler}
                    />
                )} */}
                <CallModal
                    status={ callModal }
                    startCall={ this.startCallHandler }
                    rejectCall={ this.rejectCallHandler }
                    callFrom={ callFrom }
                />
            </div>
        );
    }
}
let seq = 1
const mediaDevice = new MediaDevice()
mediaDevice.name = 'Name ' + seq++
const emptyStream = new EmptyStream()
emptyStream.setTitle('Mike')
const WrapApp = () => {
    const { state, actions, effects } = useApp()
    const [stream, setStream] = React.useState(null)
    useEffect(() => {
        // console.log('Effect is applied')
        if (!state.streams.emptyStream) {
            actions.addStream({ name: 'emptyStream', stream: emptyStream })
        }
        effects.setActionsAndState(actions, state)
        effects.socket.events.setRegisterAction(actions.register)
        if (state.streams.cascadeStream) {
            // console.log('using cascade stream', json(state.streams.cascade))
            setStream(json(state.streams.cascadeStream))
        } else if (state.streams.localStream) {
            setStream(json(state.streams.localStream))
        } else {
            mediaDevice.start()
            mediaDevice.on('stream', (stream) => {
                actions.addStream({ name: 'localStream', stream })
                setStream(stream)
            })

        }


    }, [state.streams.localStream, state.streams.cascadeStream])


    const localVideo = React.useRef(null)

    React.useEffect(() => {
        if (localVideo && localVideo.current && stream) {
            // console.log('Using The Effect',  stream)
            localVideo.current.srcObject = stream
        }

    }, [localVideo, stream])
    return <div>

        { state.cascadeVideo ? null : (<React.Fragment>
            <div className="flex" >
                <div className="mt-2 h-25 w-40">
                    <div className=" h-25 w-40">
                        <video ref={ localVideo } autoPlay muted />

                    </div>
                    <div className=" p-1 h-8 text-black bg-yellow-100">{ state.attrs.name !== 'undefined' ? `${state.attrs.name} (${state.attrs.id})` : state.attrs.id }</div>
                </div>
                { state.allSessions.map(key => {
                    const user = state.users[key]
                    return <div key={ key } className="m-2 h-25 w-40" >
                        <div className=" h-24 text-black bg-gray-800  "> </div>
                        <div className="p-1 h-8 text-black bg-yellow-100" > { user.name } ({ user.control })</div>
                    </div>
                }) }
            </div>
        </React.Fragment>)
        }
        <App overmind={ { state, actions, effects } } />
    </div>

}


export default WrapApp;
