import React, {Component} from "react";
import {render, findDOMNode} from "react-dom";
import MainWindow from "./MainWindow";
import CallWindow from "./CallWindow";
import PeerConnection from "./PeerConnection";
import socket from "./socket";
import ulti from "./ulti";

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			clientId: "",
			status: ""
		};
		this.pc = {};
	}

	componentDidMount() {
		socket
			.on("init", data => this.setState({ clientId: data.id }))
			.on("call", data => {
				if (ulti.isEmpty(this.pc))
					this.startCall(false, data["from"], { video: true, audio: true });

				if (data.sdp) this.pc.setRemoteDescription(data.sdp);
				else this.pc.addIceCandidate(data.candidate);
			})
			.on("end", this.endCall.bind(this, false))
			.emit("init");
	}

	render() {
		return (
			<div>
				<MainWindow clientId={this.state.clientId}
					startCall={this.startCall.bind(this) } />
				<CallWindow status={this.state.status}
					mediaDevice={this.pc.mediaDevice}
					endCall={this.endCall.bind(this, true) }/>
			</div>
		);
	}

	startCall(isCaller, friendID, config) {
		var node = findDOMNode(this);
		var localVideo = node.querySelector("#localVideo");
		var peerVideo = node.querySelector("#peerVideo");
		this.pc = new PeerConnection(friendID, localVideo, peerVideo);
		this.pc.start(isCaller, config);
		this.setState({ status: "active" });
	}

	endCall(isStarter) {
		this.pc.stop(isStarter);
		this.pc = {};
		this.setState({ status: "" });
	}
}

render(<App />, document.getElementById("root"));