import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useApp } from "./app"

function MainWindow({ startCall, clientId }) {
    const { state, actions } = useApp()
    const [roomID, setRoomID] = useState(state.attrs.room);
    const [roleID, setRoleID] = useState(state.attrs.role)
    const [userID, setUserID] = useState(state.attrs.name);
    /**
     * Start the call with or without video
     * @param {Boolean} video
     */
    // const callWithVideo = (video) => {
    //     const config = { audio: true, video };
    //     return () => friendID && startCall(true, friendID, config);
    // };

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
                <h4>h00tnet: enter session, name, or role</h4>
                <input
                    type="text"
                    className="txt-clientId"
                    spellCheck={false}
                    placeholder={`Room ${roomID}`}
                    onChange={(event) => setRoomID(event.target.value)}
                />
                <br />
                <input
                    type="text"
                    className="txt-clientId"
                    spellCheck={false}
                    placeholder={`Name ${userID}`}
                    onChange={(event) => setUserID(event.target.value)}
                />
                <br />
                <input
                    type="text"
                    className="txt-clientId"
                    spellCheck={false}
                    // value={userID}
                    placeholder={`Role ${roleID}`}
                    onChange={(event) => setRoleID(event.target.value)}
                />
                <div>
                {/* 
                
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
           */}
                <button
                    type="button"
                    className="btn-action"
                    onClick={() => actions.register({ roomID, roleID, userID })}
                >Go</button>


            </div>
        </div>
    </div >
  );
}

MainWindow.propTypes = {
    clientId: PropTypes.string.isRequired,
    startCall: PropTypes.func.isRequired
};

export default MainWindow;
