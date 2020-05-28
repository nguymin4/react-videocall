import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';


function CallWindowPeer({ pc, name, seq, nPCs, xid, peerSrc, status }) {
    const peerVideo = useRef(null);
    let width, height, left, top = "0%"
    const PER_ROW = 4
    console.log("NPCS", nPCs)
    if(nPCs === 1) {
        width = height = "100%"
    } else {
        const nRows = Math.floor(nPCs/PER_ROW) + 1
        const pct = (100/Math.min(PER_ROW, nPCs))
        const row = Math.floor(seq/PER_ROW)
        const col = seq - row * PER_ROW
        width = height = pct + "%"
        top = (row * pct) + "%"
        left = (col * pct ) + "%" 
    }
    console.log({width, height, top, left})

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