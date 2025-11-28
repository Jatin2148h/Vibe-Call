import React from "react";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";

export default function LandingPage() {

    const router = useNavigate();

    return (
        <div className="landingPageContainer">

            {/* NAVBAR */}
            <nav className="navbar fadeDown">
                <h2 className="logo">VibeCall</h2>

                <div className="navlist">
                    <p onClick={() => router("/aljk23")}>Join as Guest</p>
                    <p onClick={() => router("/auth")}>Register</p>

                    <div className="loginBtn" onClick={() => router("/auth")} role="button">
                        Login
                    </div>
                </div>
            </nav>

            {/* HERO SECTION */}
            <div className="landingMainContainer">

                <div className="heroLeft slideLeft">
                    <h1>
                        <span className="highlight">Connect</span> with your loved Ones
                    </h1>

                    <p className="heroSub">
                        Cover a distance by Apna Video Call
                    </p>

                    <div className="ctaBtn" role="button" onClick={() => router("/auth")}>
                        Get Started
                    </div>

                </div>

                <div className="heroRight slideRight">
                    <div className="imageWrapper">
                        <img
                            src="/landingImage.png"
                            alt="Video conference illustration"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}
