import Emitter from "./Emitter";

/**
 * Manage all media devices
 */
class MediaDevice extends Emitter {
	/**
	 * Start media devices and send stream
	 * @param {object} config - Configuration allows to turn off device after starting
	 */
	start(config) {
		navigator.getUserMedia({
			video: true, audio: true
		}, stream => {
			this.stream = stream;
			this.emit("stream", stream);
		}, err => console.log(err));
		return this;
	}
	/**
	 * Set HTML Element to display your own video
	 * @param {Element} localVideo
	 */
	setLocalVideo(localVideo) {
		this.localVideo = localVideo;
		return this;
	}
	/**
	 * Turn on/off a device
	 * @param {String} type - Type of the device
	 * @param {Boolean} [on] - State of the device
	 */
	toggle(type, on) {
		var len = arguments.length;
		this.stream[`get${type}Tracks`]().forEach(track => {
			var state = len === 2 ? on : !track.enabled;
			if (type === "Audio") this.localVideo.muted = !state;
			track.enabled = state;
		});
		return this;
	}
	/**
	 * Stop all media track of devices
	 */
	stop() {
		this.stream.getTracks().forEach(track => track.stop());
		return this;
	}
}

export default MediaDevice;