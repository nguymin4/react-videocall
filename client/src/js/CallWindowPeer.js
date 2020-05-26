import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';


function CallWindowPeer({ peerSrc, status }) {
    const peerVideo = useRef(null);

    useEffect(() => {
        if (peerVideo.current && peerSrc) peerVideo.current.srcObject = peerSrc;
    });

    return (
        <div className={classnames('call-window', status)}>

            <video id="peerVideo" ref={peerVideo} autoPlay />
        </div>
    )
}
export default CallWindowPeer