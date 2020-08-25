import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import CallWindowPeer from './CallWindowPeer'
import { useApp } from './app'
import { json } from 'overmind';
import UserList from './UserList'
import { positions } from './streamutils/labeledStream'

const getButtonClass = (icon, enabled) => classnames(`btn-action fa ${icon}`, { disable: !enabled });

function CascadeWindow() {
    //   const peerVideo = useRef(null);
    // const peerVideo = useRef(null);
    const [video, setVideo] = useState(true);
    const [audio, setAudio] = useState(true);
    const { state, actions } = useApp()
    const peerVideo = React.useRef(null)
    const localVideo = React.useRef(null)

    // useEffect(() => {
    //     // if (peerVideo.current && peerSrc) peerVideo.current.srcObject = peerSrc;
    //     if (peerVideo.current && localSrc) peerVideo.current.srcObject = localSrc;
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
        const stream = json(state.streams.peerStream)
        if (peerVideo && peerVideo.current && stream) {
            // console.log('Using The Effect',  stream)
            peerVideo.current.srcObject = stream
        }
    }, [state.streams.peerStream, peerVideo])
    React.useEffect(() => {
        const stream = json(state.streams.localStream)
        if (localVideo && localVideo.current && stream) {
            // console.log('Using The Effect',  stream)
            localVideo.current.srcObject = stream
        }
    }, [state.streams.localStream, localVideo])


    return (
        <div className={ classnames('cascade-window') }>
            <div>
                <video className={ "w-1/2" } ref={ peerVideo } autoPlay />
                <video className={ "w-1/2" } ref={ localVideo } muted autoPlay />
            </div>a
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
            { state.attrs.id !== state.sessions.cascaders[0] ?
                <div className="inline-block ml-10">
                    <button
                        type='button'
                        className='w-12 h-12 bg-green-400 fa fa-check-circle'
                        onClick={ () => {
                            actions.toggleReady();
                        } }
                    />
                </div>
                :
                <UserList /> }
        </div>
    );
}


export default CascadeWindow;
