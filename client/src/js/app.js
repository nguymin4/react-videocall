import React, {Component} from "react";
import {render} from "react-dom";
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
			status: "",
			localSrc: "",
			peerSrc: "",
			config: null
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
					localSrc={this.state.localSrc}
					peerSrc={this.state.peerSrc}
					config={this.state.config}
					mediaDevice={this.pc.mediaDevice}
					endCall={this.endCall.bind(this, true) }/>
			</div>
		);
	}

	startCall(isCaller, friendID, config) {
		this.pc = new PeerConnection(friendID)
			.on("localStream", src => this.setState({ localSrc: src, config: config }))
			.on("peerStream", src => this.setState({ peerSrc: src }))
			.start(isCaller, config);
		this.setState({ status: "active" });
	}

	endCall(isStarter) {
		this.pc.stop(isStarter);
		this.pc = {};
		this.setState({
			status: "", 
			localSrc: "",
			peerSrc: "",
			config: null
		});
	}
}

render(<App />, document.getElementById("root"));