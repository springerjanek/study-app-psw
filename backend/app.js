import express from "express";
import { generateAccessToken } from "./jwt.js";
import bcrypt from "bcrypt";
import cors from "cors";
import { body, validationResult } from "express-validator";
import { createUser, getUserByUsername, getAllUsers } from "./queries/users.js";
import { getAllMessages, postMessage } from "./queries/messages.js";
import { validateToken } from "./jwt.js";
import { createServer } from "http";
import { Server } from "socket.io";

// GET https://example.com:4000/api/userOrders
// Authorization: Bearer JWT_ACCESS_TOKEN
const app = express();
app.use(express.json());
app.use(cors());

const server = createServer(app);

export const socketIO = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

socketIO.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on("message", async (data) => {
    //emit to frontend
    socketIO.emit("messageResponse", data);
    //save in db
    await postMessage(data);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post(
  "/api/createNewUser",
  [
    body("username")
      .isLength({ min: 6 })
      .withMessage("Username must be at least 6 characters long"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { username, password } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await createUser(username, hashedPassword);

      const newUser = result.rows[0];

      res.status(201).json({
        user: newUser,
      });
    } catch (err) {
      console.error(err);

      // duplicate username
      if (err.code === "23505") {
        return res.status(409).json({ error: "username already exists" });
      }

      return res.status(500).json({ error: err });
    }
  }
);

app.post(
  "/api/login",
  [
    body("username")
      .isLength({ min: 6 })
      .withMessage("Username must be at least 6 characters long"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const { username, password } = req.body;

    try {
      const result = await getUserByUsername(username);
      const user = result.rows[0];

      if (!user) {
        return res.status(401).json({ error: "Invalid username" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ error: "Invalid password" });
      }

      const token = generateAccessToken({ username: user.username });

      res.json({
        user: { id: user.id, username: user.username },
        token: token,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

app.get("/api/verify", validateToken, (req, res) => {
  // If middleware passes, token is valid
  res.json({ valid: true, user: req.user });
});

app.get("/api/users", async (req, res) => {
  try {
    const result = await getAllUsers();
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/allMessages", validateToken, async (req, res) => {
  try {
    const { roomId } = req.query;

    // Validate roomId exists and is a valid number
    if (!roomId) {
      return res.status(400).json({
        success: false,
        error: "roomId query parameter is required",
      });
    }

    const result = await getAllMessages(roomId);

    res.json({
      success: true,
      messages: result.rows,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch messages",
    });
  }
});

server.listen(7777, () => {
  console.log("Server running on port 7777");
});
