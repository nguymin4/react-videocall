/* global mediaDevices, io */

import React, {Component} from "react";
import {render} from "react-dom";

var socket = io("http://localhost:5000");

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			id: "",
			status: "Inactive"
		};
	}

	componentWillMount() {
		socket
			.on("init", data => this.setState({ id: data.id }))
			.on("call.from", data => {
				console.log(data);
			});

		socket.emit("init");
	}
	renderControlPanel() {
		return (
			<div className="control-panel">
				<div className="pull-left">
					<input type="text" className="txt-clientId"
						placeholder="Your friend ID" />
					<i className="btn-action fa fa-video-camera"
						onClick={myVideo.turnOn}></i>
					<i className="btn-action fa fa-phone"
						onClick={myVideo.turnOn}></i>
				</div>
				<div className="pull-right">
					<input type="text" className="txt-clientId"
						value={this.state.id} />
					<h4>
						<i className="btn-copy fa fa-clipboard"></i> Copy your ID
					</h4>
				</div>
			</div>
		);
	}
	render() {
		return (
			<div>
				{this.renderControlPanel() }
				<div className="video-panel">
					<video id="peerVideo"></video>
					<video id="localVideo"></video>
				</div>
			</div>
		);
	}
}

var myVideo = {
	turnOn() {
		var video = document.getElementById("localVideo");
		navigator.getUserMedia({
			video: true
		}, stream => {
			video.src = window.URL.createObjectURL(stream);
			video.play();
		}, err => console.log(err));
	},
	turnOff() {
		var video = document.getElementById("localVideo");
		video.stop();
		video.src = null;
	}
};

render(<App />, document.getElementById("root"));