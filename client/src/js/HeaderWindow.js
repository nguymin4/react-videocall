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
        // console.log('Effect is applied')
        effects.setActionsAndState(actions, state)
        // if (!state.streams.emptyStream) {
        //     actions.addStream({ name: 'emptyStream', stream: emptyStream })
        // }
        // effects.socket.events.setRegisterAction(actions.register)
        // if (state.streams.cascadeStream) {
        //     // console.log('using cascade stream', json(state.streams.cascade))
        //     setStream(json(state.streams.cascadeStream))
        // } else if (state.streams.localStream) {
        //     setStream(json(state.streams.localStream))
        // } else {
        mediaDevice.start()
        mediaDevice.on('stream', (stream) => {
            actions.addStream({ name: 'localStream', stream })
            setStream(stream)
        })

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

        { (!!state.showCascade) ? null :
            (<React.Fragment>
                <div className="flex" >
                    <div className="mt-2 h-25 w-40">
                        <div className=" h-25 w-40">
                            <video ref={ localVideo } autoPlay muted />

                        </div>
                        <div className=" p-1 h-8 text-black bg-yellow-100">{ state.attrs.name !== 'undefined' ? `${state.attrs.name} (${state.attrs.id})` : state.attrs.id }</div>
                    </div>

                    <VideoTiles />
                </div>
            </React.Fragment>)
        }
    </div>
}

export default HeaderWindow