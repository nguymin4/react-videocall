/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/dist/js";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(1);

	var _react2 = _interopRequireDefault(_react);

	var _reactDom = __webpack_require__(2);

	var _MainWindow = __webpack_require__(3);

	var _MainWindow2 = _interopRequireDefault(_MainWindow);

	var _CallWindow = __webpack_require__(4);

	var _CallWindow2 = _interopRequireDefault(_CallWindow);

	var _PeerConnection = __webpack_require__(7);

	var _PeerConnection2 = _interopRequireDefault(_PeerConnection);

	var _socket = __webpack_require__(10);

	var _socket2 = _interopRequireDefault(_socket);

	var _ulti = __webpack_require__(6);

	var _ulti2 = _interopRequireDefault(_ulti);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var App = function (_Component) {
		_inherits(App, _Component);

		function App(props) {
			_classCallCheck(this, App);

			var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(App).call(this, props));

			_this.state = {
				clientId: "",
				status: "",
				localSrc: "",
				peerSrc: "",
				config: null
			};
			_this.pc = {};
			return _this;
		}

		_createClass(App, [{
			key: "componentDidMount",
			value: function componentDidMount() {
				var _this2 = this;

				_socket2.default.on("init", function (data) {
					return _this2.setState({ clientId: data.id });
				}).on("call", function (data) {
					if (_ulti2.default.isEmpty(_this2.pc)) _this2.startCall(false, data["from"], { video: true, audio: true });

					if (data.sdp) _this2.pc.setRemoteDescription(data.sdp);else _this2.pc.addIceCandidate(data.candidate);
				}).on("end", this.endCall.bind(this, false)).emit("init");
			}
		}, {
			key: "render",
			value: function render() {
				return _react2.default.createElement(
					"div",
					null,
					_react2.default.createElement(_MainWindow2.default, { clientId: this.state.clientId,
						startCall: this.startCall.bind(this) }),
					_react2.default.createElement(_CallWindow2.default, { status: this.state.status,
						localSrc: this.state.localSrc,
						peerSrc: this.state.peerSrc,
						config: this.state.config,
						mediaDevice: this.pc.mediaDevice,
						endCall: this.endCall.bind(this, true) })
				);
			}
		}, {
			key: "startCall",
			value: function startCall(isCaller, friendID, config) {
				var _this3 = this;

				this.pc = new _PeerConnection2.default(friendID).on("localStream", function (src) {
					return _this3.setState({ localSrc: src, config: config });
				}).on("peerStream", function (src) {
					return _this3.setState({ peerSrc: src });
				}).start(isCaller, config);
				this.setState({ status: "active" });
			}
		}, {
			key: "endCall",
			value: function endCall(isStarter) {
				this.pc.stop(isStarter);
				this.pc = {};
				this.setState({
					status: "",
					localSrc: "",
					peerSrc: "",
					config: null
				});
			}
		}]);

		return App;
	}(_react.Component);

	(0, _reactDom.render)(_react2.default.createElement(App, null), document.getElementById("root"));

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = React;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = ReactDOM;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(1);

	var _react2 = _interopRequireDefault(_react);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var friendID;

	var MainWindow = function (_Component) {
		_inherits(MainWindow, _Component);

		function MainWindow() {
			_classCallCheck(this, MainWindow);

			return _possibleConstructorReturn(this, Object.getPrototypeOf(MainWindow).apply(this, arguments));
		}

		_createClass(MainWindow, [{
			key: "render",
			value: function render() {
				return _react2.default.createElement(
					"div",
					{ className: "container main-window" },
					_react2.default.createElement(
						"div",
						null,
						_react2.default.createElement(
							"h3",
							null,
							"Hi, your ID is ",
							_react2.default.createElement(
								"span",
								{ className: "txt-clientId" },
								this.props.clientId
							)
						),
						_react2.default.createElement(
							"h4",
							null,
							"Get started by calling a friend below"
						)
					),
					_react2.default.createElement(
						"div",
						null,
						_react2.default.createElement("input", { type: "text", className: "txt-clientId",
							spellCheck: false, placeholder: "Your friend ID",
							onChange: function onChange(event) {
								return friendID = event.target.value;
							} }),
						_react2.default.createElement(
							"div",
							null,
							_react2.default.createElement("i", { className: "btn-action fa fa-video-camera",
								onClick: this.callWithVideo(true) }),
							_react2.default.createElement("i", { className: "btn-action fa fa-phone",
								onClick: this.callWithVideo(false) })
						)
					)
				);
			}
			/**
	   * Start the call with or without video
	   * @param {Boolean} video
	   */

		}, {
			key: "callWithVideo",
			value: function callWithVideo(video) {
				var _this2 = this;

				var config = { audio: true };
				config.video = video;
				return function () {
					return _this2.props.startCall(true, friendID, config);
				};
			}
		}]);

		return MainWindow;
	}(_react.Component);

	MainWindow.propTypes = {
		clientId: _react.PropTypes.string.isRequired,
		startCall: _react.PropTypes.func.isRequired
	};

	exports.default = MainWindow;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(1);

	var _react2 = _interopRequireDefault(_react);

	var _classnames = __webpack_require__(5);

	var _classnames2 = _interopRequireDefault(_classnames);

	var _ulti = __webpack_require__(6);

	var _ulti2 = _interopRequireDefault(_ulti);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var CallWindow = function (_Component) {
		_inherits(CallWindow, _Component);

		function CallWindow(props) {
			_classCallCheck(this, CallWindow);

			var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(CallWindow).call(this, props));

			_this.state = {
				Video: true,
				Audio: true
			};

			_this.btns = [{ type: "Video", icon: "fa-video-camera" }, { type: "Audio", icon: "fa-microphone" }];
			return _this;
		}

		_createClass(CallWindow, [{
			key: "componentWillReceiveProps",
			value: function componentWillReceiveProps(nextProps) {

				// Initialize when the call started
				if (!this.props.config && nextProps.config) {
					var config = nextProps.config;
					var mediaDevice = this.props.mediaDevice;
					mediaDevice.setLocalVideo(this.refs.localVideo);
					for (var type in config) {
						mediaDevice.toggle(_ulti2.default.capitalize(type), config[type]);
					}this.setState({
						Video: config.video,
						Audio: config.audio
					});
				}
			}
		}, {
			key: "renderControlButtons",
			value: function renderControlButtons() {
				var _this2 = this;

				var getClass = function getClass(icon, type) {
					return (0, _classnames2.default)("btn-action fa " + icon, {
						"disable": !_this2.state[type]
					});
				};

				return this.btns.map(function (btn) {
					return _react2.default.createElement("i", { key: "btn" + btn.type,
						className: getClass(btn.icon, btn.type),
						onClick: function onClick() {
							return _this2.toggleMediaDevice(btn.type);
						} });
				});
			}
		}, {
			key: "render",
			value: function render() {
				var _this3 = this;

				return _react2.default.createElement(
					"div",
					{ className: "call-window " + this.props.status },
					_react2.default.createElement("video", { id: "peerVideo", ref: "peerVideo", src: this.props.peerSrc, autoPlay: true }),
					_react2.default.createElement("video", { id: "localVideo", ref: "localVideo", src: this.props.localSrc, autoPlay: true }),
					_react2.default.createElement(
						"div",
						{ className: "video-control" },
						this.renderControlButtons(),
						_react2.default.createElement("i", { className: "btn-action hangup fa fa-phone",
							onClick: function onClick() {
								return _this3.props.endCall(true);
							} })
					)
				);
			}
			/**
	   * Turn on/off a media device
	   * @param {String} deviceType - Type of the device eg: Video, Audio
	   */

		}, {
			key: "toggleMediaDevice",
			value: function toggleMediaDevice(deviceType) {
				var newState = {};
				newState[deviceType] = !this.state[deviceType];
				this.setState(newState);
				this.props.mediaDevice.toggle(deviceType);
			}
		}]);

		return CallWindow;
	}(_react.Component);

	CallWindow.propTypes = {
		status: _react.PropTypes.string.isRequired,
		localSrc: _react.PropTypes.string,
		peerSrc: _react.PropTypes.string,
		config: _react.PropTypes.object,
		mediaDevice: _react.PropTypes.object,
		endCall: _react.PropTypes.func.isRequired
	};

	exports.default = CallWindow;

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = classnames;

/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	var ulti = {
		/**
	  * Check if the object is empty
	  * @param {Object} obj - The object to be checked
	  */

		isEmpty: function isEmpty(obj) {
			return Object.getOwnPropertyNames(obj).length === 0;
		},

		/**
	  * Capitalize a string
	  * @param {String} text - The string to be capitalized
	  */
		capitalize: function capitalize(text) {
			return text.charAt(0).toUpperCase() + text.substr(1);
		}
	};

	exports.default = ulti;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _MediaDevice = __webpack_require__(8);

	var _MediaDevice2 = _interopRequireDefault(_MediaDevice);

	var _Emitter2 = __webpack_require__(9);

	var _Emitter3 = _interopRequireDefault(_Emitter2);

	var _socket = __webpack_require__(10);

	var _socket2 = _interopRequireDefault(_socket);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var pc_config = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };

	var PeerConnection = function (_Emitter) {
		_inherits(PeerConnection, _Emitter);

		/**
	     * Create a PeerConnection.
	     * @param {String} friendID - ID of the friend you want to call.
	     */

		function PeerConnection(friendID) {
			_classCallCheck(this, PeerConnection);

			var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(PeerConnection).call(this));

			_this.pc = new RTCPeerConnection(pc_config);
			_this.pc.onicecandidate = function (event) {
				return _socket2.default.emit("call", {
					to: _this.friendID,
					candidate: event.candidate
				});
			};
			_this.pc.onaddstream = function (event) {
				return _this.emit("peerStream", URL.createObjectURL(event.stream));
			};

			_this.mediaDevice = new _MediaDevice2.default();
			_this.friendID = friendID;
			return _this;
		}
		/**
	  * Starting the call
	  * @param {Boolean} isCaller
	  * @param {Object} config - configuration for the call {audio: boolean, video: boolean}
	  */


		_createClass(PeerConnection, [{
			key: "start",
			value: function start(isCaller, config) {
				var _this2 = this;

				var pc = this.pc;

				var getDescription = function getDescription(desc) {
					pc.setLocalDescription(desc);
					_socket2.default.emit("call", { to: _this2.friendID, sdp: desc });
				};

				this.mediaDevice.on("stream", function (stream) {
					_this2.emit("localStream", URL.createObjectURL(stream));
					pc.addStream(stream);
					if (isCaller) pc.createOffer().then(getDescription);else pc.createAnswer().then(getDescription);
				}).start(config);

				return this;
			}
			/**
	   * Stop the call
	   * @param {Boolean} isStarter
	   */

		}, {
			key: "stop",
			value: function stop(isStarter) {
				if (isStarter) _socket2.default.emit("end", { to: this.friendID });
				this.mediaDevice.stop();
				this.pc.close();
				this.pc = null;
				this.off();
				return this;
			}
			/**
	   * @param {Object} sdp - Session description
	   */

		}, {
			key: "setRemoteDescription",
			value: function setRemoteDescription(sdp) {
				sdp = new RTCSessionDescription(sdp);
				this.pc.setRemoteDescription(sdp);
				return this;
			}
			/**
	   * @param {Object} candidate - ICE Candidate
	   */

		}, {
			key: "addIceCandidate",
			value: function addIceCandidate(candidate) {
				if (candidate) {
					candidate = new RTCIceCandidate(candidate);
					this.pc.addIceCandidate(candidate);
				}
				return this;
			}
		}]);

		return PeerConnection;
	}(_Emitter3.default);

	exports.default = PeerConnection;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Emitter2 = __webpack_require__(9);

	var _Emitter3 = _interopRequireDefault(_Emitter2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	/**
	 * Manage all media devices
	 */

	var MediaDevice = function (_Emitter) {
		_inherits(MediaDevice, _Emitter);

		function MediaDevice() {
			_classCallCheck(this, MediaDevice);

			return _possibleConstructorReturn(this, Object.getPrototypeOf(MediaDevice).apply(this, arguments));
		}

		_createClass(MediaDevice, [{
			key: "start",

			/**
	   * Start media devices and send stream
	   * @param {object} config - Configuration allows to turn off device after starting
	   */
			value: function start(config) {
				var _this2 = this;

				navigator.getUserMedia({
					video: true, audio: true
				}, function (stream) {
					_this2.stream = stream;
					_this2.emit("stream", stream);
				}, function (err) {
					return console.log(err);
				});
				return this;
			}
			/**
	   * Set HTML Element to display your own video
	   * @param {Element} localVideo
	   */

		}, {
			key: "setLocalVideo",
			value: function setLocalVideo(localVideo) {
				this.localVideo = localVideo;
				return this;
			}
			/**
	   * Turn on/off a device
	   * @param {String} type - Type of the device
	   * @param {Boolean} [on] - State of the device
	   */

		}, {
			key: "toggle",
			value: function toggle(type, on) {
				var _this3 = this;

				var len = arguments.length;
				this.stream["get" + type + "Tracks"]().forEach(function (track) {
					var state = len === 2 ? on : !track.enabled;
					if (type === "Audio") _this3.localVideo.muted = !state;
					track.enabled = state;
				});
				return this;
			}
			/**
	   * Stop all media track of devices
	   */

		}, {
			key: "stop",
			value: function stop() {
				this.stream.getTracks().forEach(function (track) {
					return track.stop();
				});
				return this;
			}
		}]);

		return MediaDevice;
	}(_Emitter3.default);

	exports.default = MediaDevice;

/***/ },
/* 9 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Emitter = function () {
		function Emitter() {
			_classCallCheck(this, Emitter);

			this._events = {};
		}

		_createClass(Emitter, [{
			key: "emit",
			value: function emit(event) {
				if (this._events[event]) {
					var args = Array.prototype.slice.call(arguments, 1);
					this._events[event].forEach(function (fn) {
						return fn.apply(null, args);
					});
				}
				return this;
			}
		}, {
			key: "on",
			value: function on(event, fn) {
				if (this._events[event]) this._events[event].push(fn);else this._events[event] = [fn];
				return this;
			}
		}, {
			key: "off",
			value: function off(event, fn) {
				if (!event) this._event = {};else {
					if (fn && typeof fn === "function") {
						var listeners = this._events[event];
						var index = listeners.findIndex(function (_fn) {
							return _fn === fn;
						});
						listeners.splice(index, 1);
					} else this._events[event] = [];
				}
				return this;
			}
		}]);

		return Emitter;
	}();

	exports.default = Emitter;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/* global SOCKET_HOST */

	/** @type {Socket} */
	var socket = io(("localhost:5000"));

	exports.default = socket;

/***/ }
/******/ ]);