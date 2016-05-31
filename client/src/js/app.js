import React, {Component} from "react";
import {render} from "react-dom";

import MainWindow from "./MainWindow";
import CallWindow from "./CallWindow";
import CallModal from "./CallModal";

import PeerConnection from "./PeerConnection";
import socket from "./socket";

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			clientId: "",
			callWindow: "",
			callModal: "",
			callFrom: "",
			localSrc: "",
			peerSrc: ""
		};
		this.pc = {};
		this.config = null;
	}

	componentDidMount() {
		socket
			.on("init", data => this.setState({ clientId: data.id }))
			.on("request", data => this.setState({ callModal: "active", callFrom: data["from"] }))
			.on("call", data => {
				if (data.sdp) {
					this.pc.setRemoteDescription(data.sdp);
					if (data.sdp.type === "offer") this.pc.createAnswer();
				}
				else this.pc.addIceCandidate(data.candidate);
			})
			.on("end", this.endCall.bind(this, false))
			.emit("init");
	}

	render() {
		return (
			<div >
				<MainWindow clientId={this.state.clientId}
					startCall={this.startCall.bind(this) } />
				<CallWindow status={this.state.callWindow}
					localSrc={this.state.localSrc}
					peerSrc={this.state.peerSrc}
					config={this.config}
					mediaDevice={this.pc.mediaDevice}
					endCall={this.endCall.bind(this, true) } />
				<CallModal status={this.state.callModal}
					startCall={this.startCall.bind(this) }
					rejectCall={this.rejectCall.bind(this) }
					callFrom={this.state.callFrom }/>
			</div >
		);
	}

	startCall(isCaller, friendID, config) {
		this.config = config;
		this.pc = new PeerConnection(friendID)
			.on("localStream", src => {
				var newState = { callWindow: "active", localSrc: src };
				if (!isCaller) newState.callModal = "";
				this.setState(newState);
			})
			.on("peerStream", src => this.setState({ peerSrc: src }))
			.start(isCaller, config);
	}

	rejectCall() {
		socket.emit("end", { to: this.state.callFrom });
		this.setState({ callModal: "" });
	}

	endCall(isStarter) {
		this.pc.stop(isStarter);
		this.pc = {};
		this.config = null;
		this.setState({
			callWindow: "",
			localSrc: "",
			peerSrc: ""
		});
	}
}

render(<App />, document.getElementById("root"));