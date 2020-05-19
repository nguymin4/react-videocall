import React, { useState } from 'react';
import PropTypes from 'prop-types';

function MainWindow({ startCall, clientId }) {
  const [friendID, setFriendID] = useState(null);

  /**
   * Start the call with or without video
   * @param {Boolean} video
   */
  const callWithVideo = (video) => {
    const config = { audio: true, video };
    return () => friendID && startCall(true, friendID, config);
  };

  return (
    <div className="container main-window">
      <div>
        <h1>Welcome to h00tnet</h1>
        <h3>
          Your session ID is
          <input
            type="text"
            className="txt-clientId"
            defaultValue={clientId}
            readOnly
          />
        </h3>

      </div>
      <div>
        <h4>HOOTNET: enter your role name</h4>
        <input
          type="text"
          className="txt-clientId"
          spellCheck={false}
          placeholder="Your role"
          onChange={(event) => setFriendID(event.target.value)}
        />
        <div>
          <button
            type="button"
            className="btn-action fa fa-video-camera"
            onClick={callWithVideo(true)}
          />
          <button
            type="button"
            className="btn-action fa fa-phone"
            onClick={callWithVideo(false)}
          />
        </div>
      </div>
    </div>
  );
}

MainWindow.propTypes = {
  clientId: PropTypes.string.isRequired,
  startCall: PropTypes.func.isRequired
};

export default MainWindow;
