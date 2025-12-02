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
import {
  approveUserRequest,
  createRoom,
  getAllRooms,
  getPendingApprovals,
  getRoomDetails,
  getRoomMembers,
  getRoomOwnerUserId,
  getUserRooms,
  requestRoomAccess,
} from "./queries/rooms.js";

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
  socketIO.emit("activeUsers", socketIO.of("/").sockets.size);

  socket.on("message", async (data) => {
    socketIO.emit("messageResponse", {
      ...data,
      created_at: new Date().toISOString(),
    });
    //save in db
    await postMessage(data);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    socketIO.emit("activeUsers", socketIO.of("/").sockets.size);
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
    console.log("TEST");
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

      const token = generateAccessToken({
        username: user.username,
        id: user.id,
      });

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

app.get("/api/users", validateToken, async (req, res) => {
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

app.get("/api/allRooms", validateToken, async (req, res) => {
  try {
    const result = await getAllRooms();

    res.json({
      success: true,
      rooms: result.rows,
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({
      success: false,
      error: "Failed to load rooms",
    });
  }
});

app.get("/api/roomDetails", validateToken, async (req, res) => {
  try {
    const { room_id } = req.query;

    if (!room_id) {
      return res.status(400).json({
        success: false,
        error: "roomId query parameter is required",
      });
    }

    const roomResult = await getRoomDetails(room_id);

    if (roomResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Room not found",
      });
    }

    const room = roomResult.rows[0];

    const membersResult = await getRoomMembers(room_id);

    const pendingResult = await getPendingApprovals(room_id);

    res.json({
      success: true,
      room,
      members: membersResult.rows,
      pendingRequests: pendingResult.rows,
    });
  } catch (err) {
    console.error("Error fetching room details:", err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

app.post("/api/createRoom", validateToken, async (req, res) => {
  try {
    const { name, description, users, created_by } = req.body;

    if (!name || !description || !created_by || !Array.isArray(users)) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: name, description, created_by, or users",
      });
    }

    if (req.user.id !== created_by) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    const room = await createRoom(name, description, created_by, users);

    res.json({ success: true, room });
  } catch (err) {
    console.error("Error creating room:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

app.get("/api/userRoomMemberships", validateToken, async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await getUserRooms(user_id);

    res.json({
      success: true,
      rooms: result.rows.map((r) => r.room_id),
    });
  } catch (error) {
    console.error("Error fetching memberships:", error);
    res.status(500).json({
      success: false,
      error: "Failed to load memberships",
    });
  }
});

app.post("/api/requestRoomAccess", validateToken, async (req, res) => {
  const { room_id } = req.body;
  const user_id = req.user.id;

  try {
    if (!room_id) {
      return res.status(400).json({
        success: false,
        error: "room_id is required",
      });
    }

    await requestRoomAccess(room_id, user_id);

    res.json({ success: true });
  } catch (error) {
    console.error("Error requesting access:", error);
    res.status(500).json({
      success: false,
      error: "Failed to request access",
    });
  }
});

app.post("/api/approveUserRequest", validateToken, async (req, res) => {
  try {
    const { room_id, user_id } = req.body;

    if (!room_id || !user_id) {
      return res.status(400).json({
        success: false,
        error: "room_id and user_id are required",
      });
    }

    const roomOwnerId = await getRoomOwnerUserId(room_id);

    if (req.user.id !== roomOwnerId) {
      return res.status(403).json({
        success: false,
        error: "Only the room owner can approve requests",
      });
    }

    await approveUserRequest(room_id, user_id);

    return res.json({ success: true });
  } catch (err) {
    console.error("Error approving user request:", err);
    return res.status(500).json({
      success: false,
      error: err,
    });
  }
});

server.listen(7777, "0.0.0.0", () => {
  console.log("Server running on port 7777");
});
