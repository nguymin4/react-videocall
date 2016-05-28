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

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* global SOCKET_HOST */


	/** @type {Socket} */
	var socket = io(("localhost:5000"));

	/** @type {RTCPeerConnection} */
	var pc;
	var friendID;
	var calls = {};

	var App = function (_Component) {
		_inherits(App, _Component);

		function App(props) {
			_classCallCheck(this, App);

			var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(App).call(this, props));

			_this.state = {
				id: "",
				callStatus: ""
			};
			return _this;
		}

		_createClass(App, [{
			key: "componentWillMount",
			value: function componentWillMount() {
				var _this2 = this;

				socket.on("init", function (data) {
					return _this2.setState({ id: data.id });
				}).on("call", function (data) {
					if (!pc) {
						friendID = data["from"];
						start.call(_this2, false, { video: true, audio: true });
					}
					var obj;
					if (data.sdp) {
						obj = new RTCSessionDescription(data.sdp);
						pc.setRemoteDescription(obj);
					} else {
						obj = new RTCIceCandidate(data.candidate);
						pc.addIceCandidate(obj);
					}
				}).on("end", stop.bind(this, false)).emit("init");
			}
		}, {
			key: "renderControlPanel",
			value: function renderControlPanel() {
				return _react2.default.createElement(
					"div",
					{ className: "container control-panel" },
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
								this.state.id
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
							onChange: this.onFriendIDChange }),
						_react2.default.createElement(
							"div",
							null,
							_react2.default.createElement("i", { className: "btn-action fa fa-video-camera",
								onClick: start.bind(this, true, { video: true, audio: true }) }),
							_react2.default.createElement("i", { className: "btn-action fa fa-phone",
								onClick: start.bind(this, true, { video: false, audio: true }) })
						)
					)
				);
			}
		}, {
			key: "renderVideoPanel",
			value: function renderVideoPanel() {
				var _this3 = this;

				return _react2.default.createElement(
					"div",
					{ className: "video-panel " + this.state.callStatus },
					_react2.default.createElement("video", { id: "peerVideo", ref: "peerVideo", autoPlay: true }),
					_react2.default.createElement("video", { id: "localVideo", ref: "localVideo", autoPlay: true }),
					_react2.default.createElement(
						"div",
						{ className: "video-control" },
						_react2.default.createElement("i", { className: "btn-action cam fa fa-video-camera",
							onClick: function onClick(e) {
								return _this3.toggleMediaDevices(e, "Video");
							} }),
						_react2.default.createElement("i", { className: "btn-action mic fa fa-microphone",
							onClick: function onClick(e) {
								return _this3.toggleMediaDevices(e, "Audio");
							} }),
						_react2.default.createElement("i", { className: "btn-action hangup fa fa-phone",
							onClick: stop.bind(this, true) })
					)
				);
			}
		}, {
			key: "render",
			value: function render() {
				return _react2.default.createElement(
					"div",
					null,
					this.renderControlPanel(),
					this.renderVideoPanel()
				);
			}
		}, {
			key: "onFriendIDChange",
			value: function onFriendIDChange(event) {
				friendID = event.target.value;
			}
		}, {
			key: "toggleMediaDevices",
			value: function toggleMediaDevices(event, deviceType) {
				var btn = event.target;
				btn.className = btn.className.indexOf("disable") === -1 ? btn.className + " disable" : btn.className.replace(/\s?disable/g, "");

				/** @type {MediaStream} */
				var media = calls[friendID];

				/** @type {MediaStreamTrack} */
				var device = media["get" + deviceType + "Tracks"]()[0];
				if (device.kind === "audio") this.refs.localVideo.muted = device.enabled;
				device.enabled = !device.enabled;
			}
		}]);

		return App;
	}(_react.Component);

	function start(isCaller, config) {
		var _this4 = this;

		var pc_config = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };
		pc = new RTCPeerConnection(pc_config);
		pc.onicecandidate = function (event) {
			return socket.emit("call", {
				to: friendID,
				candidate: event.candidate
			});
		};

		pc.onaddstream = function (event) {
			return _this4.refs.peerVideo.src = URL.createObjectURL(event.stream);
		};

		navigator.getUserMedia(config, function (stream) {
			_this4.refs.localVideo.src = URL.createObjectURL(stream);
			pc.addStream(stream);
			calls[friendID] = stream;
			if (isCaller) pc.createOffer().then(getDescription);else pc.createAnswer().then(getDescription.bind(pc.remoteDescription));
		}, function (err) {
			return console.log(err);
		});

		function getDescription(desc) {
			pc.setLocalDescription(desc);
			socket.emit("call", { to: friendID, sdp: desc });
		}

		this.setState({ callStatus: "active" });
	}

	function stop(isStarter) {
		if (isStarter) socket.emit("end", { to: friendID });

		/** @type {MediaStream} */
		var media = calls[friendID];
		media.getTracks().forEach(function (track) {
			return track.stop();
		});

		pc.close();
		pc = null;
		this.setState({ callStatus: "" });
	}

	(0, _reactDom.render)(_react2.default.createElement(App, null), document.getElementById("root"));

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = React;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = ReactDOM;

/***/ }
/******/ ]);