import express from "express";
import { validateToken } from "../jwt.js";
import {
  getAllRooms,
  getRoomDetails,
  getRoomMembers,
  getPendingApprovals,
  createRoom,
  getUserRooms,
  requestRoomAccess,
  approveUserRequest,
  getRoomOwnerUserId,
  deleteRoom,
  searchRoomsByName,
} from "../queries/rooms.js";

const router = express.Router();

router.get("/allRooms", validateToken, async (req, res) => {
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

router.get("/roomDetails", validateToken, async (req, res) => {
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

router.post("/createRoom", validateToken, async (req, res) => {
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

router.get("/userRoomMemberships", validateToken, async (req, res) => {
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

router.post("/requestRoomAccess", validateToken, async (req, res) => {
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

router.patch("/approveUserRequest", validateToken, async (req, res) => {
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

router.delete("/deleteRoom", validateToken, async (req, res) => {
  try {
    const { room_id } = req.body;

    if (!room_id) {
      return res.status(400).json({
        success: false,
        error: "room_id is required",
      });
    }

    const roomOwnerId = await getRoomOwnerUserId(room_id);

    if (req.user.id !== roomOwnerId) {
      return res.status(403).json({
        success: false,
        error: "Only the room owner can delete the room",
      });
    }

    await deleteRoom(room_id);

    res.json({
      success: true,
      deletedRoomId: room_id,
    });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete room",
    });
  }
});

router.get("/searchRooms", validateToken, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: "Search query is required",
      });
    }

    const result = await searchRoomsByName(q);

    res.json({
      success: true,
      rooms: result.rows,
    });
  } catch (error) {
    console.error("Error searching rooms:", error);
    res.status(500).json({
      success: false,
      error: "Search failed",
    });
  }
});

export default router;
