import React, {Component, PropTypes} from "react";
import classnames from "classnames";
import ulti from "./ulti";

class CallWindow extends Component {
	constructor(props) {
		super(props);
		this.state = {
			Video: true,
			Audio: true
		};

		this.btns = [
			{ type: "Video", icon: "fa-video-camera" },
			{ type: "Audio", icon: "fa-microphone" }
		];
	}
	componentWillReceiveProps(nextProps) {
		// Initialize when the call started
		if (!this.props.config && nextProps.config) {
			var config = nextProps.config;
			for (var type in config)
				nextProps.mediaDevice
					.toggle(ulti.capitalize(type), config[type]);

			this.setState({
				Video: config.video,
				Audio: config.audio
			});
		}
	}

	renderControlButtons() {
		var getClass = (icon, type) => classnames(`btn-action fa ${icon}`, {
			"disable": !this.state[type]
		});

		return this.btns.map(btn => (
			<i key={`btn${btn.type}`}
				className={getClass(btn.icon, btn.type) }
				onClick={() => this.toggleMediaDevice(btn.type) }></i>
		));
	}
	render() {
		return (
			<div className={classnames("call-window", this.props.status) }>
				<video id="peerVideo" ref="peerVideo" src={this.props.peerSrc} autoPlay></video>
				<video id="localVideo" ref="localVideo" src={this.props.localSrc} autoPlay muted></video>
				<div className="video-control">
					{this.renderControlButtons() }
					<i className="btn-action hangup fa fa-phone"
						onClick={() => this.props.endCall(true) }></i>
				</div>
			</div>
		);
	}
	/**
	 * Turn on/off a media device
	 * @param {String} deviceType - Type of the device eg: Video, Audio
	 */
	toggleMediaDevice(deviceType) {
		this.setState({
			[deviceType]: !this.state[deviceType]
		});
		this.props.mediaDevice.toggle(deviceType);
	}
}

CallWindow.propTypes = {
	status: PropTypes.string.isRequired,
	localSrc: PropTypes.string,
	peerSrc: PropTypes.string,
	config: PropTypes.object,
	mediaDevice: PropTypes.object,
	endCall: PropTypes.func.isRequired
};

export default CallWindow;