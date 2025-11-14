import { db } from "../database.js";

export const createUser = async (username, password) =>
  await db.query(
    `INSERT INTO users (username, password, role)
       VALUES ($1, $2, $3)
       RETURNING id, username, role, created_at;`,
    [username, password, "user"]
  );

export const getUserByUsername = (username) => {
  return db.query("SELECT * FROM users WHERE username = $1", [username]);
};
