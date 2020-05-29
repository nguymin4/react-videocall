import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import CallWindowPeer from './CallWindowPeer'
const getButtonClass = (icon, enabled) => classnames(`btn-action fa ${icon}`, { disable: !enabled });

function CallWindow({ allpcs, nPCs, peerSrc, localSrc, config, mediaDevice, status, endCall }) {
//   const peerVideo = useRef(null);
  const localVideo = useRef(null);
  const [video, setVideo] = useState(config.video);
  const [audio, setAudio] = useState(config.audio);
  const pcNames = Object.keys(allpcs)
  useEffect(() => {
    // if (peerVideo.current && peerSrc) peerVideo.current.srcObject = peerSrc;
    if (localVideo.current && localSrc) localVideo.current.srcObject = localSrc;
  });

  useEffect(() => {
    if (mediaDevice) {
      mediaDevice.toggle('Video', video);
      mediaDevice.toggle('Audio', audio);
    }
  });

  /**
   * Turn on/off a media device
   * @param {String} deviceType - Type of the device eg: Video, Audio
   */
  const toggleMediaDevice = (deviceType) => {
    if (deviceType === 'video') {
      setVideo(!video);
      mediaDevice.toggle('Video');
    }
    if (deviceType === 'audio') {
      setAudio(!audio);
      mediaDevice.toggle('Audio');
    }
  };

  return (
    <div className={classnames('call-window', status)}>
      {/* <video id="peerVideo" ref={peerVideo} autoPlay /> */}
      {pcNames.map((name,seq)=>{
      return <CallWindowPeer key={name} pc={allpcs[name].peerSrc} name={name} seq={seq} nPCs={nPCs}  xid={'v${seq}'} left="10%" peerSrc={allpcs[pcNames[0]].peerSrc} status={status}  />
          
      })

      }
      {/* <CallWindowPeer xid="v1" left="10%" peerSrc={allpcs[pcNames[0]].peerSrc} status={status}  />
        some more stuff
        {pcNames.length > 1 ?
      <CallWindowPeer xid="v2" left="50%" peerSrc={allpcs[pcNames[1]].peerSrc} status={status}  /> : ""} */}
   <video id="localVideo" ref={localVideo} autoPlay muted />
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
          onClick={() => endCall(true)}
        />
      </div>
    </div>
  );
}

CallWindow.propTypes = {
  status: PropTypes.string.isRequired,
  localSrc: PropTypes.object, // eslint-disable-line
  peerSrc: PropTypes.object, // eslint-disable-line
  config: PropTypes.shape({
    audio: PropTypes.bool.isRequired,
    video: PropTypes.bool.isRequired
  }).isRequired,
  mediaDevice: PropTypes.object, // eslint-disable-line
  endCall: PropTypes.func.isRequired
};

export default CallWindow;
