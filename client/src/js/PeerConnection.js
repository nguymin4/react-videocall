import MediaDevice from './MediaDevice';
import Emitter from './Emitter';
import socket from './socket';
import labeledStream from './streamutils/labeledStream'
import { json } from 'overmind'

import { proxyMethods } from './app'
console.log('Peer loaded')
const debug = (message) => {
    console.log(message)
    socket.emit('debug', message)
}
const PC_CONFIG = { iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] };

class PeerConnection extends Emitter {
    /**
       * Create a PeerConnection.
       * @param {String} friendID - ID of the friend you want to call.
       */
    static instance = 0
    constructor(friendID, opts, oState, actions) {
        super();
        PeerConnection.instance++
        // debug(`PeerConnection from ${friendID} to ${opts.id}`)
        this.pc = new RTCPeerConnection(PC_CONFIG);
        this.tracks = 0
        this.state = oState
        this.actions = actions
        this.opts = opts
        this.pc.onicecandidate = (event) => socket.emit('call', {
            to: this.friendID,
            candidate: event.candidate
        });
        this.pc.ontrack = (event) => {
            console.log('On track')
            event.trackNo = this.tracks++
            if (!this.isCaller && (this.tracks === 1)) this.emit('peerTrackEvent', event);
        }

        this.mediaDevice = new MediaDevice();
        // proxyMethods(`pc-${PeerConnection.instance}`, this)
        // proxyMethods(`media-${PeerConnection.instance}`, this.mediaDevice)


        this.friendID = friendID;
    }

    /**
     * Starting the call
     * @param {Boolean} isCaller
     * @param {Object} config - configuration for the call {audio: boolean, video: boolean}
     */
    start(isCaller, config, pcs) {
        this.isCaller = isCaller
        let stream
        stream = json(this.state.streams.cascade)
        if (isCaller) {
            this.actions.diag('NotCaller');
            stream = json(this.state.streams.empty)
            stream = json(this.state.streams.cascade)

        }
        else {
            this.actions.diag('Caller')
            stream = json(this.state.streams.cascade)
        }
        stream.getTracks().forEach((track) => {
            this.pc.addTrack(track, stream);
            console.log('Add cascadeTrack')
        });
        this.emit('localStream', stream);
        if (isCaller) socket.emit('request', { to: this.friendID });
        else this.createOffer();
        return this;
    }

    /**
     * Stop the call
     * @param {Boolean} isStarter
     */
    stop(isStarter) {
        if (isStarter) {
            socket.emit('end', { to: this.friendID });
        }
        // this.mediaDevice.stop();
        this.pc.close();
        this.pc = null;
        this.off();
        return this;
    }

    createOffer() {
        this.pc.createOffer()
            .then(this.getDescription.bind(this))
            .catch((err) => console.log(err));
        return this;
    }

    createAnswer() {
        this.pc.createAnswer()
            .then(this.getDescription.bind(this))
            .catch((err) => console.log(err));
        return this;
    }

    getDescription(desc) {
        this.pc.setLocalDescription(desc);
        socket.emit('call', { to: this.friendID, sdp: desc });
        return this;
    }

    /**
     * @param {Object} sdp - Session description
     */
    setRemoteDescription(sdp) {
        const rtcSdp = new RTCSessionDescription(sdp);
        this.pc.setRemoteDescription(rtcSdp);
        return this;
    }

    /**
     * @param {Object} candidate - ICE Candidate
     */
    addIceCandidate(candidate) {
        if (candidate) {
            const iceCandidate = new RTCIceCandidate(candidate);
            this.pc.addIceCandidate(iceCandidate);
        }
        return this;
    }
}

export default PeerConnection;
