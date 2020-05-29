import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';


function CallWindowPeer({ pc, name, seq, nPCs, xid, peerSrc, status }) {
    const peerVideo = useRef(null);
    let width, height, left, top = "0%"

    const nPerRow = Math.floor(Math.sqrt(nPCs - 1)) + 1
    // const nRows = Math.floor((nPCs) / nPerRow)
    const pct = Math.floor(100 / nPerRow)
    let row = 0
    if (nPCs > 0) row = Math.floor((seq) / nPerRow)

    const col = seq - row * nPerRow
    width = height = pct + "%"
    top = (row * pct) + "%"
    left = (col * pct) + "%"


    // console.log({ width, height, top, left })

    const videoStyle = {
        width,
        height,
        left,
        top,
        zIndex: 10

    }

    useEffect(() => {
        if (peerVideo.current && pc) {
            peerVideo.current.srcObject = pc

        }
    });

    return (
        <div className={classnames('call-window', status)}>
            Testing testing
            <video style={videoStyle} id={xid} ref={peerVideo} autoPlay />
        </div>
    )
}
export default CallWindowPeer