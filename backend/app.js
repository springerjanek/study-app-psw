import express from "express";
import { generateAccessToken } from "./jwt.js";
import bcrypt from "bcrypt";
import { body, validationResult } from "express-validator";
import { createUser, getUserByUsername } from "./queries/users.js";

// GET https://example.com:4000/api/userOrders
// Authorization: Bearer JWT_ACCESS_TOKEN

const app = express();
app.use(express.json());

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

app.listen(7777, () => {
  console.log("Server running on port 7777");
});
