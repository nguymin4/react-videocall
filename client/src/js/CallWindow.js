import React, {Component, PropTypes} from "react";

class CallWindow extends Component {
	render() {
		return (
			<div className={"call-window " + this.props.status}>
				<video id="peerVideo" autoPlay></video>
				<video id="localVideo" autoPlay></video>
				<div className="video-control">
					<i className="btn-action cam fa fa-video-camera"
						onClick={e => this.toggleMediaDevice(e, "Video") }></i>
					<i className="btn-action mic fa fa-microphone"
						onClick={e => this.toggleMediaDevice(e, "Audio") }></i>
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
	toggleMediaDevice(event, deviceType) {
		event.target.classList.toggle("disable");
		this.props.mediaDevice.toggle(deviceType);
	}
}

CallWindow.propTypes = {
	status: PropTypes.string.isRequired,
	mediaDevice: PropTypes.object,
	endCall: PropTypes.func.isRequired
};

export default CallWindow;