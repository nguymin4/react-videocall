import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useApp } from './app'
import { useQueryState } from "use-location-state";
import UserList from './UserList'

import MediaSelector from "./MediaSelector";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    root: {
        "& .MuiTextField-root": {
            margin: theme.spacing(1),
            width: "25ch"
        },
        button: {
            padding: "4px"
        }
    }
}));
function MainWindow({ startCall, clientId }) {
    const classes = useStyles();

    const { state, actions } = useApp();
    const [roomID, setRoomID] = useQueryState("room", "main");
    const [controlValue, setControlValue] = useState(state.attrs.control);
    const [userID, setUserID] = useState(state.attrs.name);
    /**
     * Start the call with or without video
     * @param {Boolean} video
     */
    const callWithVideo = (video) => {
        const config = { audio: true, video };
        return () => roomID && startCall(true, roomID, config);
    };
    const onClick = (e) => {
        if (e.shiftKey || e.ctrlKey) {
            actions.startCascade();
        } else {
            actions.register({ roomID, controlValue, userID });
        }
        // actions.fakeStreams()
    };
    return (
        <div className="bg-wite">

            <form className={ classes.root } noValidate autoComplete="off">
                <div className="container main-window">
                    <div>
                        <h1 className="text-5xl">Welcome to our h00tnet</h1>
                    </div>
                    <div>
                        <div className="p-10">
                            <TextField
                                id="outlined-name"
                                label="Room"
                                value={ roomID }
                                onChange={ (event) => setRoomID(event.target.value) }
                                variant="outlined"
                            />
                            <br />

                            <TextField
                                id="outlined-name"
                                label="Name"
                                value={ userID }
                                onChange={ (event) => setUserID(event.target.value) }
                                variant="outlined"
                            />

                            <br />
                            <TextField
                                id="outlined-name"
                                label="Control"
                                value={ controlValue }
                                onChange={ (event) => setControlValue(event.target.value) }
                                variant="outlined"
                            />
                            <br />
                            <div className="inline m-2">
                                <Button
                                    type="Button"
                                    variant="contained"
                                    color="primary"
                                    onClick={ onClick }
                                >
                                    Hoot
              </Button>
                            </div>
                            <div className="inline m-2">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={ actions.startChat }
                                >
                                    Chat
              </Button>
                            </div>
                            <div className="inline m-2">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={ actions.endChat }
                                >
                                    End
              </Button>
                            </div>
                            <div className="inline m-2">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={ actions.changeMedia }
                                >
                                    Change
              </Button>
                            </div>
                            <div></div>
                        </div>

                        { state.changeMedia ? <MediaSelector /> : <UserList /> }
                    </div>
                </div>
            </form>
        </div>

    );
}

export default MainWindow;

