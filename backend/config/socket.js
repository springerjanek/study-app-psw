import { Server } from "socket.io";
import { postMessage } from "../queries/messages.js";

export function setupSocketIO(server) {
  const socketIO = new Server(server, {
    cors: {
      origin: ["http://localhost:5173"],
    },
  });

  socketIO.on("connection", (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);
    socketIO.emit("activeUsers", socketIO.of("/").sockets.size);

    socket.on("message", async (data) => {
      socketIO.emit("messageResponse", {
        ...data,
        created_at: new Date().toISOString(),
      });
      // Save in db
      await postMessage(data);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
      socketIO.emit("activeUsers", socketIO.of("/").sockets.size);
    });
  });

  return socketIO;
}
