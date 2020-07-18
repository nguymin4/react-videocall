import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import CallWindowPeer from './CallWindowPeer'
import { useApp } from './app'
import { json } from 'overmind';


const getButtonClass = (icon, enabled) => classnames(`btn-action fa ${icon}`, { disable: !enabled });

function CascadeWindow({ endCall }) {
    //   const peerVideo = useRef(null);
    // const localVideo = useRef(null);
    const [video, setVideo] = useState(true);
    const [audio, setAudio] = useState(true);
    const { state, actions } = useApp()
    const localVideo = React.useRef(null)


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

        const stream = json(state.streams.cascadeStream)
        console.log("IN EFFECT", stream)
        if (localVideo && localVideo.current && stream) {
            // console.log('Using The Effect',  stream)
            console.log("QUALITIED")
            localVideo.current.srcObject = stream
        }
    }, [localVideo, state.streams.cascadeStream])

    return (
        <div className={ classnames('cascade-window') }>
            <video height={ 300 } ref={ localVideo } autoPlay />

            <div className='video-control'>
                <button
                    key='btnVideo'
                    type='button'
                    className={ getButtonClass('fa-video-camera', video) }
                    onClick={ () => toggleMediaDevice('video') }
                />
                <button
                    key='btnAudio'
                    type='button'
                    className={ getButtonClass('fa-microphone', audio) }
                    onClick={ () => toggleMediaDevice('audio') }
                />
                <button
                    type='button'
                    className='btn-action hangup fa fa-phone'
                    onClick={ () => {
                        actions.endCascade();
                    } }
                />
            </div>
        </div>
    );
}

CascadeWindow.propTypes = {
    endCall: PropTypes.func.isRequired
};

export default CascadeWindow;
