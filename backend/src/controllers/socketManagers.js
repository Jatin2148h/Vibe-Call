import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("CONNECTED:", socket.id);

    socket.on("join-call", (path, username) => {
      if (!connections[path]) connections[path] = [];

      connections[path].push(socket.id);
      timeOnline[socket.id] = new Date();

      const roomUsers = connections[path];

      socket.emit("user_joined", socket.id, roomUsers);

      roomUsers.forEach((uid) => {
        if (uid !== socket.id) {
          io.to(uid).emit("user_joined", socket.id, [socket.id]);
        }
      });

      if (messages[path]) {
        messages[path].forEach((msg) => {
          io.to(socket.id).emit(
            "chat-message",
            msg.data,
            msg.sender,
            msg["socket-id-sender"]
          );
        });
      }
    });

    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    socket.on("chat-message", (data, sender) => {
      const [roomFound, found] = Object.entries(connections).reduce(
        ([room, isFound], [roomKey, users]) => {
          if (!isFound && users.includes(socket.id)) {
            return [roomKey, true];
          }
          return [room, isFound];
        },
        ["", false]
      );

      if (found) {
        if (!messages[roomFound]) messages[roomFound] = [];

        messages[roomFound].push({
          sender,
          data,
          "socket-id-sender": socket.id,
        });

        connections[roomFound].forEach((uid) => {
          io.to(uid).emit("chat-message", data, sender, socket.id);
        });
      }
    });

    socket.on("disconnect", () => {
      let key;

      for (const [room, list] of Object.entries(connections)) {
        if (list.includes(socket.id)) {
          key = room;

          list.forEach((uid) => {
            io.to(uid).emit("user-left", socket.id);
          });

          connections[key] = list.filter((id) => id !== socket.id);

          if (connections[key].length === 0) {
            delete connections[key];
            delete messages[key];
          }
        }
      }
    });
  });

  return io;
};
