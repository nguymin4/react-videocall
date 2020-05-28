import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';


function CallWindowPeer({ xid, left, peerSrc, status }) {
    const peerVideo = useRef(null);
    const videoStyle = {
        width: "50%",
        height: "50%",
        left: left,
        zIndex: 10

    }
    useEffect(() => {
        if (peerVideo.current && peerSrc) {
                peerVideo.current.srcObject = peerSrc

        }
    });

    return (
        <div className={classnames('call-window', status)}>

            <video style={videoStyle} id={xid} ref={peerVideo} autoPlay />
        </div>
    )
}
export default CallWindowPeer