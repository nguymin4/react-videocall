import ulti from "./ulti";

class MediaDevice {
	constructor(localVideo) {
		this.callbacks = [];
		this.localVideo = localVideo;
	}
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
	onStream(fn) {
		this.callbacks.push(fn);
		return this;
	}
	toggle(type, on) {
		var len = arguments.length;
		this.stream[`get${type}Tracks`]().forEach(track => {
			var state = len === 2 ? on : !track.enabled;
			if (type === "Audio") this.localVideo.muted = !state;
			track.enabled = state;
		});
		return this;
	}
	stop() {
		this.stream.getTracks().forEach(track => track.stop());
		return this;
	}
}

export default MediaDevice;
