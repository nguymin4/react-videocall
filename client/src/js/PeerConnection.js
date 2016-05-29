import MediaDevice from "./MediaDevice";
import socket from "./socket";

const pc_config = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };

class PeerConnection {
	/**
     * Create a PeerConnection.
     * @param {String} friendID - ID of the friend you want to call.
	 * @param {Element} localVideo - HTML Element for displaying your own video
	 * @param {Element} peerVideo - HTML Element for displaying your friend video
     */
	constructor(friendID, localVideo, peerVideo) {
		this.pc = new RTCPeerConnection(pc_config);
		this.pc.onicecandidate = event => socket.emit("call", {
			to: this.friendID,
			candidate: event.candidate
		});
		this.pc.onaddstream = event => peerVideo.src = URL.createObjectURL(event.stream);
		
		this.mediaDevice = new MediaDevice(localVideo);
		this.friendID = friendID;
	}
	/**
	 * Starting the call
	 * @param {Boolean} isCaller
	 * @param {Object} config - configuration for the call {audio: boolean, video: boolean}
	 */
	start(isCaller, config) {
		var pc = this.pc;

		var getDescription = desc => {
			pc.setLocalDescription(desc);
			socket.emit("call", { to: this.friendID, sdp: desc });
		};

		this.mediaDevice
			.onStream(stream => {
				pc.addStream(stream);
				if (isCaller) pc.createOffer().then(getDescription);
				else pc.createAnswer().then(getDescription);
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