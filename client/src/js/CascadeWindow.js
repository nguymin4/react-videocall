import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import CallWindowPeer from './CallWindowPeer'
import { useApp } from "./app"
import { json } from "overmind";


const getButtonClass = (icon, enabled) => classnames(`btn-action fa ${icon}`, { disable: !enabled });

function CascadeWindow({  endCall }) {
    //   const peerVideo = useRef(null);
    // const localVideo = useRef(null);
const [video, setVideo] = useState(true);
    const [audio, setAudio] = useState(true);
    const { state, actions } = useApp()
    const localVideo = React.useRef(null)

    // useEffect(() => {
    //     // if (peerVideo.current && peerSrc) peerVideo.current.srcObject = peerSrc;
    //     if (localVideo.current && localSrc) localVideo.current.srcObject = localSrc;
    // });

    // useEffect(() => {
    //     if (mediaDevice) {
    //         mediaDevice.toggle('Video', video);
    //         mediaDevice.toggle('Audio', audio);
    //     }
    // });

    /**
     * Turn on/off a media device
     * @param {String} deviceType - Type of the device eg: Video, Audio
     */
    const toggleMediaDevice = (deviceType) => {
        // if (deviceType === 'video') {
        //     setVideo(!video);
        //     mediaDevice.toggle('Video');
        // }
        // if (deviceType === 'audio') {
        //     setAudio(!audio);
        //     mediaDevice.toggle('Audio');
        // }
    };
    
     React.useEffect(() => {
         
        const stream = json(state.streams.cascade)
        if (localVideo && localVideo.current && stream) {
            // console.log("Using The Effect",  stream)
            localVideo.current.srcObject = stream
            console.log("SET STREAM")
        }
    }, [ localVideo])

    return (
        <div className={classnames('cascade-window')}>
            {"CASCADE"}
            <video height={300} ref={localVideo} autoPlay  />

            <div className="video-control">
                <button
                    key="btnVideo"
                    type="button"
                    className={getButtonClass('fa-video-camera', video)}
                    onClick={() => toggleMediaDevice('video')}
                />
                <button
                    key="btnAudio"
                    type="button"
                    className={getButtonClass('fa-microphone', audio)}
                    onClick={() => toggleMediaDevice('audio')}
                />
                <button
                    type="button"   
                    className="btn-action hangup fa fa-phone"
                    onClick={() => {actions.clearCascade();
                        endCall(true)}}
                />
            </div>
        </div>
    );
}

CascadeWindow.propTypes = {
    endCall: PropTypes.func.isRequired
};

export default CascadeWindow;
