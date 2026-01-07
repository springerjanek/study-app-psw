import express from "express";
import { deleteUserById, getAllUsers } from "../queries/users.js";
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

router.delete("/deleteUser", validateToken, async (req, res) => {
  try {
    const userRole = req.user.role;
    const { user_id } = req.body;

    if (userRole !== "admin") {
      return res.status(403).json({ error: "Only admin can delete users" });
    }

    await deleteUserById(user_id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
