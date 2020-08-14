import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Button from "@material-ui/core/Button";
import { useApp } from './app'
import { json } from 'overmind'


const useStyles = makeStyles((theme) => ({
    root: {
        width: "100%",
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
        color: "black"
    }
}));

const MediaSelector = () => {
    const { state, actions } = useApp()
    const devices = json(state.mediaDevices)
    const [audio, setAudio] = React.useState(-1);
    const [video, setVideo] = React.useState(-1);
    const audioDevices = devices.filter((device) => device.kind === "audioinput");
    const videoDevices = devices.filter((device) => device.kind === "videoinput");



    const chooseDevices = () => {
        const constraints = {
            audio: {
                deviceId: { exact: audioDevices[audio].deviceId }
            },
            video: {
                deviceId: { exact: videoDevices[video].deviceId }
            }
        };

        navigator.mediaDevices
            .getUserMedia(constraints)
            .then((stream) => {
                console.log("device", stream.getTracks());
            })
            .catch((e) => console.log(e.toString()));
        actions.changeMedia()
    };
    return (
        <React.Fragment>
            <div className="p-1 m-4 border-solid border-2 border-gray-600">
                <div className="flex justify-center m-2 ">
                    <DeviceSelector
                        selector={ setAudio }
                        kind="audioinput"
                        devices={ audioDevices }
                    />
                    <DeviceSelector
                        selector={ setVideo }
                        kind="videoinput"
                        devices={ videoDevices }
                    />
                </div>
                <div className="flex justify-center  ">
                    <Button
                        variant="contained"
                        color="primary"
                        className="border border-black border-solid"
                        disabled={ audio === -1 || video === -1 }
                        onClick={ chooseDevices }
                    >
                        Select
          </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        className="border border-black border-solid"
                        onClick={ actions.changeMedia }
                    >
                        Cancel
          </Button>
                </div>
            </div>
        </React.Fragment>
    );
};
const DeviceSelector = ({ devices, kind, selector }) => {
    const classes = useStyles();
    const [selectedIndex, setSelectedIndex] = React.useState(-1);
    console.log(kind, devices);
    const handleListItemClick = (event, index) => {
        setSelectedIndex(index);
        selector(index);
    };

    return (
        <div className={ classes.root }>
            <List component="nav">
                { devices.map((item, index) => {
                    return (
                        <ListItem
                            key={ index }
                            button
                            selected={ selectedIndex === index }
                            onClick={ (event) => handleListItemClick(event, index) }
                        >
                            <ListItemText primary={ item.label } />
                        </ListItem>
                    );
                }) }
            </List>
        </div>
    );
};
export default MediaSelector;
