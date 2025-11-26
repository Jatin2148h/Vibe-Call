import React from "react";
import ReactDOM from "react-dom/client";   // ✔️ THIS IS CORRECT FOR VITE
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <App />   // ❌ NO STRICT MODE
);
