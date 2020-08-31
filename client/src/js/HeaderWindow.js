import React, { useEffect } from 'react';
import { useApp, proxyMethods } from './app'
import MediaDevice from './MediaDevice';
import EmptyStream from './streamutils/EmptyStream';
import VideoTiles from './VideoTiles'
import { json } from 'overmind'

let seq = 0
const mediaDevice = new MediaDevice()
mediaDevice.name = 'Name ' + seq++
const emptyStream = new EmptyStream()
emptyStream.setTitle('Mike')

const HeaderWindow = () => {
    const { state, actions, effects } = useApp()
    const [stream, setStream] = React.useState(null)
    const [refs, setRefs] = React.useState({})
    useEffect(() => {
        actions.test()},
        [])
    useEffect(() => {
        // console.log('Effect is applied')
        effects.setActionsAndState(actions, state)

        mediaDevice.on('stream', (stream) => {
            actions.addStream({ name: 'localStream', stream, from: "HeaderWindow onStream" })
            // actions.startChat()
            if (state.mediaDevices.length === 0) {
                navigator.mediaDevices.enumerateDevices().then((devices) => {
                    const extracts = devices.map((device) => {
                        const { kind, deviceId, label } = device
                        return { kind, deviceId, label }

                    })
                    // console.log("EXTRACTS", extracts)

                    setTimeout(() => actions.setMediaDevices(extracts), 2000)
                })
            }
            setStream(stream)
        })
        mediaDevice.start()

        // }

    }, [])


    const localVideo = React.useRef(null)

    React.useEffect(() => {

        if (localVideo && localVideo.current && stream) {
            // console.log('Using The Effect',  stream)
            localVideo.current.srcObject = stream
        }

    }, [localVideo, stream])

    return <div>
        { (true || state.currentWindow === 'chat') ?
            (<React.Fragment>
                <VideoTiles /> }
            </React.Fragment>)
            : null
        }
    </div>
}

export default HeaderWindow