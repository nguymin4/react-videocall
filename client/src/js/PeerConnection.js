import MediaDevice from "./MediaDevice";
import Emitter from "./Emitter";
import socket from "./socket";

const pc_config = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };

class PeerConnection extends Emitter {
	/**
     * Create a PeerConnection.
     * @param {String} friendID - ID of the friend you want to call.
     */
	constructor(friendID) {
		super();
		this.pc = new RTCPeerConnection(pc_config);
		this.pc.onicecandidate = event => socket.emit("call", {
			to: this.friendID,
			candidate: event.candidate
		});
		this.pc.onaddstream = event => this.emit("peerStream", URL.createObjectURL(event.stream));

		this.mediaDevice = new MediaDevice();
		this.friendID = friendID;
	}
	/**
	 * Starting the call
	 * @param {Boolean} isCaller
	 * @param {Object} config - configuration for the call {audio: boolean, video: boolean}
	 */
	start(isCaller, config) {
		var pc = this.pc;

		this.mediaDevice
			.on("stream", stream => {
				pc.addStream(stream);
				this.emit("localStream", URL.createObjectURL(stream));
				if (isCaller) socket.emit("request", { to: this.friendID });
				else this.createOffer();
			})
			.start(config);

		return this;
	}
	/**
	 * Stop the call
	 * @param {Boolean} isStarter
	 */
	stop(isStarter) {
		if (isStarter) socket.emit("end", { to: this.friendID });
		this.mediaDevice.stop();
		this.pc.close();
		this.pc = null;
		this.off();
		return this;
	}
	
	createOffer() {
		this.pc.createOffer()
			.then(this.getDescription.bind(this))
			.catch(err => console.log(err));
		return this;
	}
	
	createAnswer() {
		this.pc.createAnswer()
			.then(this.getDescription.bind(this))
			.catch(err => console.log(err));
		return this;
	}

	getDescription(desc) {
		this.pc.setLocalDescription(desc);
		socket.emit("call", { to: this.friendID, sdp: desc });
		return this;
	}

	/**
	 * @param {Object} sdp - Session description
	 */
	setRemoteDescription(sdp) {
		sdp = new RTCSessionDescription(sdp);
		this.pc.setRemoteDescription(sdp);
		return this;
	}
	/**
	 * @param {Object} candidate - ICE Candidate
	 */
	addIceCandidate(candidate) {
		if (candidate) {
			candidate = new RTCIceCandidate(candidate);
			this.pc.addIceCandidate(candidate);
		}
		return this;
	}
}

export default PeerConnection;