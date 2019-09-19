import React, { Component } from 'react';
import { render } from 'react-dom';
import _ from 'lodash';
import socket from './socket';
import PeerConnection from './PeerConnection';
import MainWindow from './MainWindow';
import CallWindow from './CallWindow';
import CallModal from './CallModal';

const UPDATE_INTERVAL = 1000;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clientId: '',
      callWindow: '',
      callModal: '',
      callFrom: '',
      localSrc: null,
      peerSrc: null,
      time: 0
    };
    this.pc = {};
    this.config = null;
    this.startCallHandler = this.startCall.bind(this);
    this.endCallHandler = this.endCall.bind(this);
    this.rejectCallHandler = this.rejectCall.bind(this);
    this.startTimer = this.startTimer.bind(this);
    this.stopTimer = this.stopTimer.bind(this);
    this.updateTimer = this.updateTimer.bind(this);
  }

  componentDidMount() {
    socket
      .on('init', data => this.setState({ clientId: data.id }))
      .on('request', data => this.setState({ callModal: 'active', callFrom: data.from }))
      .on('call', (data) => {
        if (data.sdp) {
          this.pc.setRemoteDescription(data.sdp);
          this.startTimer();
          if (data.sdp.type === 'offer') this.pc.createAnswer();
        } else this.pc.addIceCandidate(data.candidate);
      })
      .on('end', this.endCall.bind(this, false))
      .emit('init');
    this.timerRef = null;
  }

  startCall(isCaller, friendID, config) {
    this.config = config;
    this.pc = new PeerConnection(friendID)
      .on('localStream', (src) => {
        const newState = { callWindow: 'active', localSrc: src };
        if (!isCaller) newState.callModal = '';
        this.setState(newState);
      })
      .on('peerStream', src => this.setState({ peerSrc: src }))
      .start(isCaller, config);
  }

  rejectCall() {
    const { callFrom } = this.state;
    socket.emit('end', { to: callFrom });
    this.setState({ callModal: '' });
  }

  endCall(isStarter) {
    if (_.isFunction(this.pc.stop)) this.pc.stop(isStarter);
    this.pc = {};
    this.config = null;
    this.setState({
      callWindow: '',
      localSrc: null,
      peerSrc: null
    });
    this.stopTimer()
  }

  updateTimer(extraTime) {
    const { time } = this.state;
    this.setState({ time : time + extraTime });
  }

  startTimer() {
    this.setState({
      isRunning : true 
    }, () => {
      this.timerRef = setInterval(
        () => { this.updateTimer(UPDATE_INTERVAL) }, UPDATE_INTERVAL
      )
    });
  }

  stopTimer() {
    this.setState({
      isRunning : false 
    }, () => {
      clearInterval(this.timerRef);
    });
  }

  render() {
    const { clientId, callFrom, callModal, callWindow, localSrc, peerSrc, timer } = this.state;
    return (
      <div>
        <MainWindow
          clientId={clientId}
          startCall={this.startCallHandler}
        />
        <CallWindow
          status={callWindow}
          localSrc={localSrc}
          peerSrc={peerSrc}
          config={this.config}
          mediaDevice={this.pc.mediaDevice}
          endCall={this.endCallHandler}
          timer={timer}
        />
        <CallModal
          status={callModal}
          startCall={this.startCallHandler}
          rejectCall={this.rejectCallHandler}
          callFrom={callFrom}
        />
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
