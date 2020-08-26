import React, { useEffect } from 'react';
import { useApp, proxyMethods } from './app'
import { json } from 'overmind'


const VideoTiles = () => {
    const { state, actions, effects } = useApp()
    const [stream, setStream] = React.useState(null)
    const [refs, setRefs] = React.useState({})

    React.useEffect(() => {
        const users = json(state.users)
        console.log("refs effect", Object.keys(users))
        Object.keys(users).map((key, index) => {
            console.log("assign stream effect")
            const user = users[key]
            const ref = refs[key]
            if (ref) {
                if (state.attrs.id === key) {
                    ref.srcObject = json(state.streams.localStream)
                } else {

                    if (user.remoteStream) {
                        actions.diag('assigns remote stream for ' + key + ' name = ' + user.name)
                        console.log("assign remote Stream", user.remoteStream)
                        ref.srcObject = user.remoteStream
                    }
                }
            }

        })
        actions.diag('update videoTiles ')
    }, [refs, state.users, state.peerEvents])
    const legend = (user) => {
        let connectionState = 'unknown'
        if (user.peerConnection && user.peerConnection.pc) {
            connectionState = user.peerConnection.pc.connectionState
        }
        const legend = ` ${user.name} ${user.status} (${user.control} ${connectionState})`
        return legend

    }
    return <React.Fragment>
        <div className="flex" >

            { state.allSessions.map((key, index) => {
                const user = json(state.users[key])
                if (!user) return null
                // console.log("muted", user.name, key === state.attrs.id)
                return <div key={ key } className="m-2 h-25 w-1/4" >
                    <div className=" text-black bg-gray-800  ">
                        <video ref={ el => {
                            if (el) {
                                // console.log("set refs ", key, index)
                                refs[key] = el
                                setRefs(refs)
                            }
                        } } autoPlay muted={ key === state.attrs.id } />

                    </div>
                    <div className="p-1 h-8 text-black bg-yellow-100" >
                        { legend(user) }
                    </div>
                </div>
            }) }
        </div>

    </React.Fragment>
}

export default VideoTiles