import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useApp } from './app'

function MainWindow({ startCall, clientId }) {
    const { state, actions } = useApp()
    const [roomID, setRoomID] = useState(state.attrs.room);
    const [controlValue, setControlValue] = useState(state.attrs.control)
    const [userID, setUserID] = useState(state.attrs.name);
    /**
     * Start the call with or without video
     * @param {Boolean} video
     */
    const callWithVideo = (video) => {
        const config = { audio: true, video };
        return () => roomID && startCall(true, roomID, config);
    };

    return (
        <div className='container main-window'>
            <div>
                <h1 className="text-5xl">Welcome to h00tnet</h1>
            </div>
            <div>
                <input
                    type='text'
                    className='txt-clientId'
                    spellCheck={false}
                    placeholder={`Room ${roomID}`}
                    onChange={(event) => setRoomID(event.target.value)}
                />
                <br />
                <input
                    type='text'
                    className='txt-clientId'
                    spellCheck={false}
                    placeholder={`Name ${userID}`}
                    onChange={(event) => setUserID(event.target.value)}
                />
                <br />
                <input
                    type='text'
                    className='txt-clientId'
                    spellCheck={false}
                    // value={userID}
                    placeholder={`Control ${controlValue}`}
                    onChange={(event) => setControlValue(event.target.value)}
                />
                <div>


                    {/* <button
            type='button'
            className='btn-action fa fa-video-camera'
            onClick={callWithVideo(true)}
          /> */}
                    {/* 

          <button
            type='button'
            className='btn-action fa fa-phone'
            onClick={callWithVideo(false)}
          />
           */}
                    <button
                        type='button'
                        className='btn-action'
                        onClick={() => {
                            actions.register({ roomID, controlValue, userID })
                            actions.fakeStreams()
                        }}
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
