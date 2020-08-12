import React, { useEffect } from 'react';
import { useApp, proxyMethods } from './app'
import MediaDevice from './MediaDevice';
import EmptyStream from './streamutils/EmptyStream';
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
        if (!state.streams.emptyStream) {
            actions.addStream({ name: 'emptyStream', stream: emptyStream })
        }
        effects.setActionsAndState(actions, state)
        effects.socket.events.setRegisterAction(actions.register)
        if (state.streams.cascadeStream) {
            // console.log('using cascade stream', json(state.streams.cascade))
            setStream(json(state.streams.cascadeStream))
        } else if (state.streams.localStream) {
            setStream(json(state.streams.localStream))
        } else {
            mediaDevice.start()
            mediaDevice.on('stream', (stream) => {
                actions.addStream({ name: 'localStream', stream })
                setStream(stream)
            })

        }


    }, [state.streams.localStream, state.streams.cascadeStream])


    const localVideo = React.useRef(null)

    React.useEffect(() => {
        if (localVideo && localVideo.current && stream) {
            // console.log('Using The Effect',  stream)
            localVideo.current.srcObject = stream
        }

    }, [localVideo, stream])
    React.useEffect(() => {
        const users = json(state.users)
        console.log("refs effect", Object.keys(users))
        Object.keys(users).map((key, index) => {
            console.log("assign stream effect")
            const user = users[key]
            const ref = refs[key]
            if (ref) {
                if (state.attrs.id === key) {
                    if (state.isChatting) {
                        ref.srcObject = json(state.streams.localStream)
                    } else {
                        ref.srcObject = null
                    }
                } else {

                    if (user.remoteStream) {
                        console.log("assign remote Stream", user.remoteStream)
                        ref.srcObject = user.remoteStream
                    }
                }
            }

        })

    }, [refs, state.users, state.isChatting])
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
                    { state.allSessions.map((key, index) => {
                        const user = json(state.users[key])
                        if (!user) return null
                        return <div key={ key } className="m-2 h-25 w-40" >
                            <div className=" h-24 text-black bg-gray-800  ">
                                <video ref={ el => {
                                    if (el) {
                                        console.log("set refs ", key, index)
                                        refs[key] = el
                                        setRefs(refs)
                                    }
                                } } autoPlay muted />

                            </div>
                            <div className="p-1 h-8 text-black bg-yellow-100" >
                                { user.name } ({ user.control })</div>
                        </div>
                    }) }
                </div>
            </React.Fragment>)
        }
    </div>
}

export default HeaderWindow