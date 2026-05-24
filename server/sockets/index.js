import { Server as SocketIOServer } from "socket.io";

export function initSockets(httpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    socket.on("join-team", (teamId) => {
      if (teamId) {
        socket.join(teamId);
        console.log(`Socket ${socket.id} joined team room channel: ${teamId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
}
