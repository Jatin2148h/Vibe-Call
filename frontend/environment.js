const servers = {
  backend: "https://vibecallbackend-22nk.onrender.com",
  websocket: "https://vibecallbackend-22nk.onrender.com",

  devBackend: "http://localhost:3000",
  devWebsocket: "http://localhost:3000",
};

const isProd = import.meta.env.PROD;

export default {
  backend: isProd ? servers.backend : servers.devBackend,
  websocket: isProd ? servers.websocket : servers.devWebsocket,
};
