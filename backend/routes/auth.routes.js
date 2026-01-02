import express from "express";
import bcrypt from "bcrypt";
import { body, validationResult } from "express-validator";
import { createUser, getUserByUsername } from "../queries/users.js";
import { generateAccessToken, validateToken } from "../jwt.js";

const router = express.Router();

const userValidation = [
  body("username")
    .isLength({ min: 6 })
    .withMessage("Username must be at least 6 characters long"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

router.post("/createNewUser", userValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await createUser(username, hashedPassword);
    const newUser = result.rows[0];

    res.status(201).json({ user: newUser });
  } catch (err) {
    console.error(err);

    // duplicate username
    if (err.code === "23505") {
      return res.status(409).json({ error: "username already exists" });
    }

    return res.status(500).json({ error: err });
  }
});

router.post("/login", userValidation, async (req, res) => {
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
});

router.get("/verify", validateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

export default router;
