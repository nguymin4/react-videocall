import React, { useEffect } from 'react';
import { useApp, proxyMethods } from './app'
import { json } from 'overmind'
import { H3 } from './Typography';


const VideoTile = ({ id }) => {
    const { state, actions, effects } = useApp()
    const [stream, setStream] = React.useState({})
    const ref = React.useRef(null)

    React.useEffect(() => {
        actions.diag('VideoTile effect ' + state.peerEvents)
        if (ref && ref.current) {
            if (state.attrs.id === id) {
                console.log("Ref for ", id, "set to local stream")
                window.xlocal = ref.current.srcObject = json(state.streams.localStream)
            } else {
                console.log("Ref for", id, "set to remote stream ", state.users[id].remoteStream.streamNumber)
                ref.current.srcObject = json(state.users[id].remoteStream)
            }
        }
    }, [state.peerEvents, ref, ref.current])
    const displayLegend = () => {
        const user = json(state.users[id])
        const legend = ` ${user.name} ${user.roomStatus} (${user.control} ${user.connectionState})`
        return legend

    }
    const displayTile = () => {
        // console.log("Evaluatiing display Tile", { room: state.users[id].roomStatus, connection: state.users[id].connectionStatus })
        if (state.attrs.id !== id) {
            if (state.users[id] && state.users[id].roomStatus !== "joined") {
                return (<H3>status + { state.users[id].roomStatus }</H3>)
            } else if (state.users[id] && state.users[id].connectionStatus !== "connected") {
                return (<H3>Connecting</H3>)
            }
        }
        return (
            <video ref={ ref }
                autoPlay muted={ id === state.attrs.id } />
        )
    }
    return <React.Fragment>
        <div className=" text-black bg-gray-800  ">
            { displayTile(state.users[id].roomStatus) }
            {/* { console.log('rendering the tile') } */ }
        </div>
        <div className="p-1 h-8 text-black bg-yellow-100" >
            { displayLegend() }
        </div>
    </React.Fragment >
}

export default VideoTile