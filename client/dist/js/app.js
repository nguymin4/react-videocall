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
	var friendID;

	var App = function (_Component) {
		_inherits(App, _Component);

		function App(props) {
			_classCallCheck(this, App);

			var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(App).call(this, props));

			_this.state = {
				id: ""
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
						start(false);
					}
					var obj;
					if (data.sdp) {
						obj = new RTCSessionDescription(data.sdp);
						pc.setRemoteDescription(obj);
					} else {
						obj = new RTCIceCandidate(data.candidate);
						pc.addIceCandidate(obj);
					}
				}).emit("init");
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
							spellcheck: "false", placeholder: "Your friend ID",
							onChange: this.onFriendIDChange }),
						_react2.default.createElement(
							"div",
							null,
							_react2.default.createElement("i", { className: "btn-action fa fa-video-camera",
								onClick: start.bind(true) }),
							_react2.default.createElement("i", { className: "btn-action fa fa-phone",
								onClick: start.bind(true) })
						)
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
					_react2.default.createElement(
						"div",
						{ className: "video-panel" },
						_react2.default.createElement("video", { id: "peerVideo", autoplay: "true" }),
						_react2.default.createElement("video", { id: "localVideo", autoplay: "true" })
					)
				);
			}
		}, {
			key: "onFriendIDChange",
			value: function onFriendIDChange(event) {
				friendID = event.target.value;
			}
		}]);

		return App;
	}(_react.Component);

	/** @type {RTCPeerConnection} */


	var pc;

	function start(isCaller) {
		var pc_config = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };
		var localVideo = document.getElementById("localVideo");
		var peerVideo = document.getElementById("peerVideo");

		pc = new RTCPeerConnection(pc_config);
		pc.onicecandidate = function (event) {
			socket.emit("call", { to: friendID, candidate: event.candidate });
		};

		pc.onaddstream = function (event) {
			peerVideo.src = URL.createObjectURL(event.stream);
			peerVideo.play();
		};

		document.getElementsByClassName("video-panel")[0].style.display = "block";

		navigator.getUserMedia({
			video: true, audio: true
		}, function (stream) {
			localVideo.src = URL.createObjectURL(stream);
			localVideo.play();
			pc.addStream(stream);
			if (isCaller) pc.createOffer().then(getDescription);else pc.createAnswer().then(getDescription.bind(pc.remoteDescription));
		}, function (err) {
			return console.log(err);
		});

		function getDescription(desc) {
			pc.setLocalDescription(desc);
			socket.emit("call", { to: friendID, sdp: desc });
		}
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