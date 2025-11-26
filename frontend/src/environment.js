const servers = {
  backend: import.meta.env.PROD
    ? "https://vibecallbackend-22nk.onrender.com"
    : "http://localhost:3000",

  websocket: import.meta.env.PROD
    ? "https://vibecallbackend-22nk.onrender.com"
    : "http://localhost:3000"
};

export default servers;
