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
    const path = window.location.pathname;

    if (!token) {
      if (path !== "/" && !path.startsWith("/m")) {
        navigate("/");
      }
    } else {
      if (path === "/" || path === "/auth") {
        navigate("/home");
      }
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<Authentication />} />
      <Route path="/home" element={<HomeComponent />} />
      <Route path="/history" element={<History />} />
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
