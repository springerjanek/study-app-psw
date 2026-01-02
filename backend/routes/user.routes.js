import express from "express";
import { getAllUsers } from "../queries/users.js";
import { validateToken } from "../jwt.js";

const router = express.Router();

router.get("/users", validateToken, async (req, res) => {
  try {
    const result = await getAllUsers();
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
