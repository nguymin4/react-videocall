import React, { Component } from 'react';
import PropTypes from 'proptypes';
import classnames from 'classnames';

class CallModal extends Component {
  render() {
    return (
      <div className={classnames('call-modal', this.props.status)}>
        <p>
          <span className="caller">{this.props.callFrom}</span> is calling ...
        </p>
        <i
          className="btn-action fa fa-video-camera"
          onClick={this.acceptWithVideo(true)}
        />
        <i
          className="btn-action fa fa-phone"
          onClick={this.acceptWithVideo(false)}
        />
        <i
          className="btn-action hangup fa fa-phone"
          onClick={this.props.rejectCall}
        />
      </div>
    );
  }
  acceptWithVideo(video) {
    const config = { audio: true, video };
    return () => this.props.startCall(false, this.props.callFrom, config);
  }
}

CallModal.propTypes = {
  status: PropTypes.string.isRequired,
  callFrom: PropTypes.string,
  startCall: PropTypes.func,
  rejectCall: PropTypes.func
};

export default CallModal;
