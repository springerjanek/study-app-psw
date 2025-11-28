import { db } from "../database.js";

export const createRoom = async (name, description, created_by, users) => {
  const roomResult = await db.query(
    `INSERT INTO rooms (name, description, created_by, created_at)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, description, created_by, created_at;`,
    [name, description, created_by, new Date()]
  );

  if (users.length > 0) {
    for (const userId of users) {
      await db.query(
        `INSERT INTO room_members (room_id, user_id, added_at)
       VALUES ($1, $2, $3);`,
        [roomResult.rows[0].id, userId, new Date()]
      );
    }
  }
  return roomResult.rows[0];
};

export const getAllRooms = async () => {
  return await db.query(
    `SELECT id, name, description, created_by, created_at
       FROM rooms
       ORDER BY created_at DESC;`
  );
};
