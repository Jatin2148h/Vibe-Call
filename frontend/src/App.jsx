import "./App.css";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import LandingPage from "./pages/landing";
import Authentication from "./pages/authentication";
import { AuthProvider } from "./contexts/AuthContext";
import VideoMeetComponent from "./pages/VideoMeet";
import HomeComponent from "./pages/home";
import History from "./pages/history";

function AppWrapper() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      // Guest user → force to landing
      if (window.location.pathname !== "/") {
        navigate("/");
      }
    } else {
      // Logged-in user → force to home
      if (
        window.location.pathname === "/" ||
        window.location.pathname === "/auth"
      ) {
        navigate("/home");
      }
    }
  }, []);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<Authentication />} />

      {/* Protected Routes */}
      <Route path="/home" element={<HomeComponent />} />
      <Route path="/history" element={<History />} />

      {/* Dynamic Meeting URL */}
      <Route path="/:url" element={<VideoMeetComponent />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppWrapper />
      </AuthProvider>
    </Router>
  );
}
