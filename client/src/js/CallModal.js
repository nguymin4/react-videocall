import React, { Component } from 'react';
import PropTypes from 'proptypes';
import classnames from 'classnames';

class CallModal extends Component {
  acceptWithVideo(video) {
    const config = { audio: true, video };
    return () => this.props.startCall(false, this.props.callFrom, config);
  }

  render() {
    return (
      <div className={classnames('call-modal', this.props.status)}>
        <p>
          <span className="caller">{this.props.callFrom}</span> is calling ...
        </p>
        <button
          className="btn-action fa fa-video-camera"
          onClick={this.acceptWithVideo(true)}
        />
        <button
          className="btn-action fa fa-phone"
          onClick={this.acceptWithVideo(false)}
        />
        <button
          className="btn-action hangup fa fa-phone"
          onClick={this.props.rejectCall}
        />
      </div>
    );
  }
}

CallModal.propTypes = {
  status: PropTypes.string.isRequired,
  callFrom: PropTypes.string.isRequired,
  startCall: PropTypes.func.isRequired,
  rejectCall: PropTypes.func.isRequired
};

export default CallModal;
