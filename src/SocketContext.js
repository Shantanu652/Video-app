import React, {createContext, useState, useRef, useEffect} from "react";

import { io } from "socket.io-client";
import Peer from "simple-peer";

const SocketContext = createContext();

const socket = io('http://localhost:5000');

const ContextProvider = ({ children }) => {
    const [stream, setStream] = useState();
    const [me, setMe] = useState('');
    const [call, setCall] = useState({});
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState('');

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();
    const callRef = useRef(call);

    useEffect(() => {
        callRef.current = call;
    }, [call]);


    useEffect(()=> {
        navigator.mediaDevices.getUserMedia({video: true, audio: true})
        .then((currentStream) => {
            setStream(currentStream);

            // Check if myVideo.current is defined before setting srcObject
            //if (myVideo.current) {
                myVideo.current.srcObject = currentStream;
            //}
        })
        .catch((error) => {
            console.error('Error accessing media devices:', error);
            // Handle the error (e.g., display a message to the user)
        });
        socket.on('me', (id) => setMe(id));

        socket.on('calluser', ({ from, name: callerName, signal}) => {
            setCall({ isReceivedCall: true, from, name: callerName, signal})
        });
    }, []);

    const callUser = (id) => {
        console.log('Calling user with ID:', id);

        const peer = new Peer({ initiator: true, trickle: false, stream });

        peer.on('signal', (data) => {
            socket.emit('calluser', { userToCall: id, signalData: data, from: me, name})
        });

        peer.on('stream', (currentStream) => {
            userVideo.current.srcObject = currentStream; 
        });

        socket.on('callaccepted', (signal) => {
            console.log('Call accepted. Signaling back.');

            setCallAccepted(true);

            peer.signal(signal);
        });

        connectionRef.current = peer;
    }

    const answerCall = () => {
        console.log('Entering answerCall with call:', callRef.current);

        setCallAccepted(true)

        const peer = new Peer({ initiator: false, trickle: false, stream });

        peer.on('signal', (data) => {
            socket.emit('answercall', { signal: data, to: call.from })
        });

        peer.on('stream', (currentStream) => {
            console.log('Received remote stream:', currentStream);
            userVideo.current.srcObject = currentStream; 
            console.log('Received remote stream:', currentStream);
            if (callAccepted && !callEnded && currentStream) {
                console.log('Setting userVideo stream:', currentStream);
                userVideo.current.srcObject = currentStream;
            }else {
                console.log('Not setting userVideo stream. Check conditions:', {
                    callAccepted,
                    callEnded,
                    currentStream,
                });
            }
        });

        peer.signal(call.signal);

        connectionRef.current = peer;
    }
    const leaveCall = () => {
        setCallEnded(true);

        connectionRef.current.destroy();

        window.location.reload();
    }

    return (
        <SocketContext.Provider value={{
            call,
            callAccepted,
            myVideo,
            userVideo,
            stream,
            name,
            setName,
            callEnded,
            me,
            callUser, 
            leaveCall,
            answerCall,
        }}>
            {children}
        </SocketContext.Provider>
    )
}

export { ContextProvider, SocketContext };