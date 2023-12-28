import React, { useContext, useEffect } from 'react';
import { Grid, Typography, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { SocketContext } from '../SocketContext';


const useStyles = makeStyles((theme) => ({
    video: {
        width: '550px',
        [theme.breakpoints.down('xs')]: {
            width: '300px',
        },
    },
    gridContainer: {
        justifyContent: 'center',
        [theme.breakpoints.down('xs')]: {
            flexDirection: 'column',
            },
        },
    paper: {
        padding: '10px',
        border: '2px solid black',
        margin: '10px',
    },
}));

const VideoPlayer = () => {
    const { name, call, stream, myVideo, userVideo, callAccepted, callEnded } = useContext(SocketContext);
    const classes = useStyles();

    useEffect(() => {
        console.log('callAccepted:', callAccepted);
        console.log('callEnded:', callEnded);
        console.log('call:', call);
        // Update the userVideo ref when the call is accepted
        if (callAccepted && !callEnded && call?.stream) {
            console.log('Setting userVideo stream:', call.stream);
            userVideo.current.srcObject = call.stream;
        }
    }, [callAccepted, callEnded, call, userVideo]);


    return (
        <Grid container className={classes.gridContainer}>
            {/* Our own Video */}
            {stream && (
                    <Paper className={classes.paper}>
                        <Grid item xs={12} md={6} >
                            <Typography variant='h5' gutterBottom>{name || 'Name'}</Typography>
                            <video playsInline muted ref={myVideo} autoPlay className={classes.video} />
                        </Grid>
                    </Paper>
                )}

            {/* User's Video */}
            {console.log('call:', call)}
            {callAccepted && !callEnded && (
                    <Paper className={classes.paper}>
                        <Grid item xs={12} md={6} >
                            <Typography variant='h5' gutterBottom>{call.name || 'Name'}</Typography>
                            <video playsInline ref={userVideo} autoPlay className={classes.video} />
                        </Grid>
                    </Paper>
                )}
        </Grid>
    );
};

export default VideoPlayer;