const servers = {
  // ⭐ BACKEND URL (Render backend)
  backend: "https://vibecallbackend-22nk.onrender.com",

  // ⭐ WEBSOCKET URL (Same backend domain — because socket.io runs on same server)
  websocket: "https://vibecallbackend-22nk.onrender.com",

  // ⭐ If local development (auto switch)
  devBackend: "http://localhost:3000",
  devWebsocket: "http://localhost:3000",
};

// AUTO SWITCH BETWEEN LOCAL & DEPLOYED
const isProd = import.meta.env.PROD;

export default {
  backend: isProd ? servers.backend : servers.devBackend,
  websocket: isProd ? servers.websocket : servers.devWebsocket,
};
