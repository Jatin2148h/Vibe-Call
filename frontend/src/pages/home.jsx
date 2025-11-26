import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import withAuth from "../utils/withAuth";
import "../App.css";

import { IconButton, Button, TextField } from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import { AuthContext } from "../contexts/AuthContext";

function HomeComponent() {
    const navigate = useNavigate();

    const [meetingCode, setMeetingCode] = useState("");
    const { addToUserHistory } = useContext(AuthContext);

    const handleJoinVideoCall = async () => {
        if (meetingCode.trim() === "") {
            alert("Enter valid meeting code");
            return;
        }
        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`);
    };

    return (
        <div className="homeContainer">

            {/* NAVBAR */}
            <div className="homeNav">
                <h3 className="brandTitle">VibeCall</h3>

                <div className="navActions">
                    <IconButton 
                        className="historyBtn"
                        onClick={() => navigate("/history")}
                    >
                        <RestoreIcon />
                        <p>History</p>
                    </IconButton>

                    <Button
                        className="logoutBtn"
                        variant="outlined"
                        onClick={() => {
                            localStorage.removeItem("token");
                            navigate("/auth");
                        }}
                    >
                        Logout
                    </Button>
                </div>
            </div>

            {/* MAIN SECTION */}
            <div className="homeMain">
                <div className="homeLeft fadeLeft">
                    <h2 className="homeHeading">
                        Providing Quality Video Call <br />
                        Just Like Quality Education
                    </h2>

                    <div className="meetingBox">
                        <TextField
                            className="meetingInput"
                            label="Enter Meeting Code"
                            onChange={(e) => setMeetingCode(e.target.value)}
                        />

                        <Button
                            onClick={handleJoinVideoCall}
                            variant="contained"
                            className="joinBtn"
                        >
                            Join Call
                        </Button>
                    </div>
                </div>

                <div className="homeRight fadeRight">
                    <img src="/logo3.png" alt="logo" className="homeImage" />
                </div>
            </div>

            {/* FEATURES SECTION */}
            <div className="featureStrip">
                <div className="featureItem">🔒 Secure Meetings</div>
                <div className="featureItem">⚡ Super Fast Connection</div>
                <div className="featureItem">🎥 HD Video Quality</div>
                <div className="featureItem">📊 Auto History Saving</div>
            </div>

            {/* FOOTER SECTION */}
            <footer className="footerSection">

                <div className="footerImages">
                    <img src="/download.jpeg" alt="Download" />
                    <img src="/images.jpeg" alt="Images" />
                </div>

                <p className="footerText">
                    Bringing people closer with seamless video communication.
                </p>

                <div className="footerSocials">
                    <a>🌐</a>
                    <a>📘</a>
                    <a>📸</a>
                    <a>🐦</a>
                </div>

                <p className="footerCopy">© 2025 VibeCall. All Rights Reserved.</p>
            </footer>

        </div>
    );
}

export default withAuth(HomeComponent);
