/* global SOCKET_HOST */
import React, {Component} from "react";
import {render} from "react-dom";

/** @type {Socket} */
var socket = io(SOCKET_HOST);
var friendID;

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			id: ""
		};
	}

	componentWillMount() {
		socket
			.on("init", data => this.setState({ id: data.id }))
			.on("call", data => {
				if (!pc) {
					friendID = data["from"];
					start(false);
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
						spellcheck="false" placeholder="Your friend ID"
						onChange={this.onFriendIDChange}/>
					<div>
						<i className="btn-action fa fa-video-camera"
							onClick={start.bind(true) }></i>
						<i className="btn-action fa fa-phone"
							onClick={start.bind(true) }></i>
					</div>
				</div>
			</div>
		);
	}
	render() {
		return (
			<div>
				{this.renderControlPanel() }
				<div className="video-panel">
					<video id="peerVideo" autoplay="true"></video>
					<video id="localVideo" autoplay="true"></video>
				</div>
			</div>
		);
	}
	onFriendIDChange(event) {
		friendID = event.target.value;
	}
}

/** @type {RTCPeerConnection} */
var pc;

function start(isCaller) {
	var pc_config = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };
	var localVideo = document.getElementById("localVideo");
	var peerVideo = document.getElementById("peerVideo");

	pc = new RTCPeerConnection(pc_config);
	pc.onicecandidate = event => {
		socket.emit("call", { to: friendID, candidate: event.candidate });
	};

	pc.onaddstream = event => {
		peerVideo.src = URL.createObjectURL(event.stream);
		peerVideo.play();
	};

	document.getElementsByClassName("video-panel")[0].style.display = "block";

	navigator.getUserMedia({
		video: true, audio: true
	}, stream => {
		localVideo.src = URL.createObjectURL(stream);
		localVideo.play();
		pc.addStream(stream);
		if (isCaller) pc.createOffer().then(getDescription);
		else pc.createAnswer()
			.then(getDescription.bind(pc.remoteDescription));
	}, err => console.log(err));

	function getDescription(desc) {
		pc.setLocalDescription(desc);
		socket.emit("call", { to: friendID, sdp: desc });
	}
}


render(<App />, document.getElementById("root"));