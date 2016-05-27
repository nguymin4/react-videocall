/* global SOCKET_HOST, io */
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
		socket.on("init", data => this.setState({ id: data.id }));

		socket.emit("init");
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
						<i className="btn-action fa fa-video-camera"></i>
						<i className="btn-action fa fa-phone"></i>
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

render(<App />, document.getElementById("root"));