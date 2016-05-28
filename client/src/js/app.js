/* global SOCKET_HOST */
import React, {Component} from "react";
import {render} from "react-dom";

/** @type {Socket} */
var socket = io(SOCKET_HOST);

/** @type {RTCPeerConnection} */
var pc;
var friendID;
var calls = {};

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			id: "",
			callStatus: ""
		};
	}

	componentWillMount() {
		socket
			.on("init", data => this.setState({ id: data.id }))
			.on("call", data => {
				if (!pc) {
					friendID = data["from"];
					start.call(this, false, { video: true, audio: true });
				}
				var obj;
				if (data.sdp) {
					obj = new RTCSessionDescription(data.sdp);
					pc.setRemoteDescription(obj);
				}
				else {
					obj = new RTCIceCandidate(data.candidate);
					pc.addIceCandidate(obj);
				}
			})
			.on("end", stop.bind(this, false))
			.emit("init");
	}
	renderControlPanel() {
		return (
			<div className="container control-panel">
				<div>
					<h3>
						Hi, your ID is <span className="txt-clientId">
							{this.state.id}
						</span>
					</h3>
					<h4>Get started by calling a friend below</h4>
				</div>
				<div>
					<input type="text" className="txt-clientId"
						spellCheck={false} placeholder="Your friend ID"
						onChange={this.onFriendIDChange}/>
					<div>
						<i className="btn-action fa fa-video-camera"
							onClick={start.bind(this, true, { video: true, audio: true }) }></i>
						<i className="btn-action fa fa-phone"
							onClick={start.bind(this, true, { video: false, audio: true }) }></i>
					</div>
				</div>
			</div>
		);
	}
	renderVideoPanel() {
		return (
			<div className={"video-panel " + this.state.callStatus}>
				<video id="peerVideo" ref="peerVideo" autoPlay></video>
				<video id="localVideo" ref="localVideo" autoPlay></video>
				<div className="video-control">
					<i className="btn-action cam fa fa-video-camera"
						onClick={e => this.toggleMediaDevices(e, "Video") }></i>
					<i className="btn-action mic fa fa-microphone"
						onClick={e => this.toggleMediaDevices(e, "Audio") }></i>
					<i className="btn-action hangup fa fa-phone"
						onClick={stop.bind(this, true) }></i>
				</div>
			</div>
		);
	}
	render() {
		return (
			<div>
				{this.renderControlPanel() }
				{this.renderVideoPanel() }
			</div>
		);
	}
	onFriendIDChange(event) {
		friendID = event.target.value;
	}

	toggleMediaDevices(event, deviceType) {
		var btn = event.target;
		btn.className = btn.className.indexOf("disable") === -1 ?
			btn.className + " disable" :
			btn.className.replace(/\s?disable/g, "");

		/** @type {MediaStream} */
		var media = calls[friendID];

		/** @type {MediaStreamTrack} */
		var device = media[`get${deviceType}Tracks`]()[0];
		if (device.kind === "audio") this.refs.localVideo.muted = device.enabled;
		device.enabled = !device.enabled;
	}
}



function start(isCaller, config) {
	var pc_config = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };
	pc = new RTCPeerConnection(pc_config);
	pc.onicecandidate = event => socket.emit("call", {
		to: friendID,
		candidate: event.candidate
	});

	pc.onaddstream = event => this.refs.peerVideo.src = URL.createObjectURL(event.stream);

	navigator.getUserMedia(config, stream => {
		this.refs.localVideo.src = URL.createObjectURL(stream);
		pc.addStream(stream);
		calls[friendID] = stream;
		if (isCaller) pc.createOffer().then(getDescription);
		else pc.createAnswer()
			.then(getDescription.bind(pc.remoteDescription));
	}, err => console.log(err));

	function getDescription(desc) {
		pc.setLocalDescription(desc);
		socket.emit("call", { to: friendID, sdp: desc });
	}

	this.setState({ callStatus: "active" });
}

function stop(isStarter) {
	if (isStarter) socket.emit("end", { to: friendID });

	/** @type {MediaStream} */
	var media = calls[friendID];
	media.getTracks().forEach(track => track.stop());

	pc.close();
	pc = null;
	this.setState({ callStatus: "" });
}


render(<App />, document.getElementById("root"));