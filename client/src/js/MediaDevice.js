import ulti from "./ulti";

class MediaDevice {
	/**
	 * Manage all media devices
	 * @param {Element} localVideo - HTML Element for displaying your own video
	 */
	constructor(localVideo) {
		this.callbacks = [];
		this.localVideo = localVideo;
	}
	/**
	 * Start media devices and send stream
	 * @param {object} config - Configuration allows to turn off device after starting
	 */
	start(config) {
		navigator.getUserMedia({
			video: true, audio: true
		}, stream => {
			this.stream = stream;
			this.localVideo.src = URL.createObjectURL(stream);
			for (var type in config) this.toggle(ulti.capitalize(type), config[type]);
			this.callbacks.forEach(cb => cb(stream));
		}, err => console.log(err));
		return this;
	}
	/**
	 * Register to the event when media devices start streaming
	 * @param {Function} fn - Listener
	 */
	onStream(fn) {
		this.callbacks.push(fn);
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
