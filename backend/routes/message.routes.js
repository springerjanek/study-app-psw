import express from "express";
import { getAllMessages } from "../queries/messages.js";
import { validateToken } from "../jwt.js";

const router = express.Router();

router.get("/allMessages", validateToken, async (req, res) => {
  try {
    const { roomId } = req.query;

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

export default router;
