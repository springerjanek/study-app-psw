import express from "express";
import cors from "cors";
import fs from "fs";
import { createServer } from "https";
import { setupSocketIO } from "./config/socket.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import messageRoutes from "./routes/message.routes.js";
import roomRoutes from "./routes/room.routes.js";

const app = express();
app.use(express.json());
app.use(cors());

const options = {
  key: fs.readFileSync("./localhost-key.pem"),
  cert: fs.readFileSync("./localhost.pem"),
};

const server = createServer(options, app);

export const socketIO = setupSocketIO(server);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", roomRoutes);
app.use("/api", messageRoutes);

server.listen(7777, "0.0.0.0", () => {
  console.log("Server running on port 7777");
});
