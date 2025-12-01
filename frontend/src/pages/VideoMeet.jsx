// ---------------------------------------------
// 🔥 FINAL — VIDEO MEET FRONTEND (100% WORKING)
// ---------------------------------------------

import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";

import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import CallEndIcon from "@mui/icons-material/CallEnd";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";

import "../styles/videoComponent.css";


// 🔥 YOUR REAL BACKEND SOCKET SERVER (RENDER)
const serverUrl = "https://vibe-callbackend-pbks.onrender.com";

// STUN SERVER
const peerConfig = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {

    const { url } = useParams();
    const navigate = useNavigate();

    const socketRef = useRef();
    const socketIdRef = useRef();

    const localVideoRef = useRef();
    const connections = useRef({});
    const videoRef = useRef([]);

    const [videos, setVideos] = useState([]);
    const [username, setUsername] = useState("");
    const [joined, setJoined] = useState(false);

    const [screen, setScreen] = useState(false);
    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);

    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const [newMsgCount, setNewMsgCount] = useState(0);

    // RESET CHAT
    useEffect(() => {
        setChatMessages([]);
        setNewMsgCount(0);
    }, []);

    // START CAMERA
    useEffect(() => {
        async function startCam() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });

                window.localStream = stream;
                localVideoRef.current.srcObject = stream;

            } catch (error) {
                console.log("CAM ERROR:", error);
            }
        }
        startCam();
    }, []);

    // KEEP LOCAL VIDEO UPDATED
    useEffect(() => {
        if (localVideoRef.current && window.localStream) {
            localVideoRef.current.srcObject = window.localStream;
        }
    }, [joined]);


    // JOIN CALL
    const joinCall = () => {
        if (username.trim() === "") {
            alert("Enter your name!");
            return;
        }

        setJoined(true);

        // RESET OLD CONNECTION
        connections.current = {};
        videoRef.current = [];
        setVideos([]);
        setChatMessages([]);

        socketRef.current = io(serverUrl, {
            transports: ["websocket"],
            forceNew: true,
        });

        socketRef.current.on("connect", () => {
            socketIdRef.current = socketRef.current.id;
            socketRef.current.emit("join-call", url, username);
        });

        socketRef.current.on("signal", handleSignal);

        socketRef.current.on("chat-message", (msg, sender, senderId) => {
            if (senderId === socketIdRef.current) return;

            setChatMessages((prev) => [...prev, { sender, msg }]);

            if (!chatOpen) setNewMsgCount((n) => n + 1);
        });

        socketRef.current.on("user_joined", (newUserId, list) => {
            const others = list.filter(id => id !== socketIdRef.current);

            others.forEach(peerId => {
                if (!connections.current[peerId]) {
                    const initiator =
                        socketIdRef.current.localeCompare(peerId) === -1;
                    createPeer(peerId, initiator);
                }
            });
        });

        socketRef.current.on("user-left", (id) => {
            videoRef.current = videoRef.current.filter(v => v.socketId !== id);
            setVideos([...videoRef.current]);
            delete connections.current[id];
        });
    };


    // CREATE PEER
    const createPeer = (peerId, isInitiator) => {
        const pc = new RTCPeerConnection(peerConfig);
        connections.current[peerId] = pc;

        if (window.localStream) {
            window.localStream.getTracks().forEach(track => {
                pc.addTrack(track, window.localStream);
            });
        }

        pc.ontrack = (e) => {
            const exists = videoRef.current.find(v => v.socketId === peerId);
            if (!exists) {
                const newVideo = {
                    socketId: peerId,
                    stream: e.streams[0],
                };
                videoRef.current.push(newVideo);
                setVideos([...videoRef.current]);
            }
        };

        pc.onicecandidate = (e) => {
            if (e.candidate) {
                socketRef.current.emit("signal", peerId,
                    JSON.stringify({ ice: e.candidate })
                );
            }
        };

        if (isInitiator) {
            pc.createOffer().then(offer => {
                pc.setLocalDescription(offer).then(() => {
                    socketRef.current.emit(
                        "signal",
                        peerId,
                        JSON.stringify({ sdp: offer })
                    );
                });
            });
        }

        return pc;
    };


    // HANDLE SIGNAL
    const handleSignal = (fromId, message) => {
        if (fromId === socketIdRef.current) return;

        const data = JSON.parse(message);
        let pc = connections.current[fromId];

        if (!pc) pc = createPeer(fromId, false);

        if (data.sdp) {
            pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(() => {
                if (data.sdp.type === "offer") {
                    pc.createAnswer().then((answer) => {
                        pc.setLocalDescription(answer).then(() => {
                            socketRef.current.emit(
                                "signal",
                                fromId,
                                JSON.stringify({ sdp: answer })
                            );
                        });
                    });
                }
            });
        }

        if (data.ice) {
            pc.addIceCandidate(new RTCIceCandidate(data.ice));
        }
    };


    // SEND CHAT
    const sendChat = () => {
        if (!chatInput.trim()) return;

        socketRef.current.emit("chat-message", chatInput, username);

        setChatMessages(prev => [...prev, { sender: username, msg: chatInput }]);

        setChatInput("");
    };


    // END CALL — FIXED REDIRECT
    const endCall = () => {
        try {
            localVideoRef.current.srcObject
                .getTracks()
                .forEach(t => t.stop());
        } catch { }

        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/");        // Guest → Landing page
        } else {
            navigate("/home");    // Logged user → Home page
        }
    };


    // MIC / CAMERA
    const toggleMic = () => {
        const t = window.localStream.getAudioTracks()[0];
        t.enabled = !t.enabled;
        setMicOn(t.enabled);
    };

    const toggleCamera = () => {
        const t = window.localStream.getVideoTracks()[0];
        t.enabled = !t.enabled;
        setCameraOn(t.enabled);
    };


    // SCREEN SHARE
    useEffect(() => {
        if (screen) startScreenShare();
    }, [screen]);

    const startScreenShare = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
            });

            window.localStream = screenStream;
            localVideoRef.current.srcObject = screenStream;

            for (let id in connections.current) {
                const sender = connections.current[id]
                    .getSenders()
                    .find(s => s.track.kind === "video");

                sender.replaceTrack(screenStream.getVideoTracks()[0]);
            }

        } catch (err) {
            console.log("SCREEN ERROR:", err);
        }
    };


    // UI
    return (
        <div className="meetWrapper">

            {/* JOIN SCREEN */}
            {!joined ? (
                <div className="joinBox">

                    <div className="joinCard">
                        <h2 className="joinTitle">Enter Your Name</h2>

                        <input
                            type="text"
                            className="joinInput"
                            placeholder="Your Name..."
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />

                        <button
                            className="connectButton"
                            disabled={username.trim() === ""}
                            onClick={joinCall}
                        >
                            Join Now
                        </button>

                        <video ref={localVideoRef} autoPlay muted className="localPreview"></video>
                    </div>

                </div>
            ) : (
                <>
                    <div className="videoLayout">

                        <div className="otherVideoArea">
                            {videos.map((v) => (
                                <div className="otherVideoBox" key={v.socketId}>
                                    <video
                                        autoPlay
                                        playsInline
                                        ref={(ref) => ref && (ref.srcObject = v.stream)}
                                    ></video>
                                </div>
                            ))}
                        </div>

                        <div className="myVideoFloating">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                className="myFloatingVideo"
                            ></video>
                        </div>

                        {chatOpen && (
                            <div className="chatPanel">
                                <div className="chatHeader">
                                    Chat
                                    <button className="chatCloseBtn" onClick={() => setChatOpen(false)}>
                                        <CloseIcon />
                                    </button>
                                </div>

                                <div className="chatMessages">
                                    {chatMessages.map((m, i) => (
                                        <div key={i} className="chatMsg">
                                            <b className="chatMsgSender">{m.sender}</b>
                                            <p>{m.msg}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="chatInputBox">
                                    <input
                                        className="chatInput"
                                        placeholder="Type message..."
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                    />
                                    <button className="chatSendBtn" onClick={sendChat}>
                                        Send
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="controlBar">
                            <button className="controlBtn" onClick={toggleMic}>
                                {micOn ? <MicIcon /> : <MicOffIcon />}
                            </button>

                            <button className="controlBtn" onClick={toggleCamera}>
                                {cameraOn ? <VideocamIcon /> : <VideocamOffIcon />}
                            </button>

                            <button className="controlBtn" onClick={() => setScreen(!screen)}>
                                {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                            </button>

                            <button
                                className="controlBtn"
                                onClick={() => {
                                    setChatOpen(!chatOpen);
                                    setNewMsgCount(0);
                                }}
                            >
                                <ChatIcon />
                                {newMsgCount > 0 && (
                                    <span className="chatBadge">{newMsgCount}</span>
                                )}
                            </button>

                            <button className="endCallBtn" onClick={endCall}>
                                <CallEndIcon />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
