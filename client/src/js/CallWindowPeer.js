import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';


function CallWindowPeer({ left, peerSrc, status }) {
    const peerVideo = useRef(null);
    const videoStyle = {
        width: "50%",
        height: "50%",
        left: left

    }
    useEffect(() => {
        if (peerVideo.current && peerSrc) {
            if (left === "50%") {
                peerVideo.current.srcObject = peerSrc
            }
            else {
                peerVideo.current.srcObject = peerSrc.clone()
            }

        }
    });

    return (
        <div className={classnames('call-window', status)}>

            <video style={videoStyle} id="peerVideo" ref={peerVideo} autoPlay />
        </div>
    )
}
export default CallWindowPeer