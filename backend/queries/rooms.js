import { db } from "../database.js";

export const createRoom = async (name, description, created_by, users) => {
  const roomResult = await db.query(
    `INSERT INTO rooms (name, description, created_by, created_at)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, description, created_by, created_at;`,
    [name, description, created_by, new Date()]
  );

  const roomId = roomResult.rows[0].id;

  // Add owner into room_members
  await db.query(
    `INSERT INTO room_members (room_id, user_id, added_at)
     VALUES ($1, $2, $3);`,
    [roomId, created_by, new Date()]
  );

  if (users && users.length > 0) {
    for (const userId of users) {
      await db.query(
        `INSERT INTO room_members (room_id, user_id, added_at)
         VALUES ($1, $2, $3);`,
        [roomId, userId, new Date()]
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

export const getUserRooms = async (user_id) => {
  return await db.query(`SELECT room_id FROM room_members WHERE user_id = $1`, [
    user_id,
  ]);
};

export const getRoomDetails = async (room_id) => {
  return await db.query(
    `SELECT id, name, description, created_by, created_at
       FROM rooms
       WHERE id = $1`,
    [room_id]
  );
};

export const getRoomMembers = async (room_id) => {
  return await db.query(
    `SELECT u.id, u.username
       FROM room_members rm
       JOIN users u ON rm.user_id = u.id
       WHERE rm.room_id = $1`,
    [room_id]
  );
};

export const requestRoomAccess = async (room_id, user_id) => {
  return await db.query(
    `INSERT INTO room_access_requests (room_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
    [room_id, user_id]
  );
};

export const getPendingApprovals = async (room_id) => {
  return await db.query(
    `SELECT u.id, u.username
       FROM room_access_requests rar
       JOIN users u ON rar.user_id = u.id
       WHERE rar.room_id = $1`,
    [room_id]
  );
};

export const getRoomOwnerUserId = async (room_id, user_id) => {
  const result = await db.query("SELECT created_by FROM rooms WHERE id = $1", [
    room_id,
  ]);

  return result.rows[0].created_by;
};

export const approveUserRequest = async (room_id, user_id) => {
  await db.query(
    `INSERT INTO room_members (room_id, user_id, added_at)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING`,
    [room_id, user_id, new Date()]
  );

  await db.query(
    `DELETE FROM room_access_requests
        WHERE room_id = $1 AND user_id = $2`,
    [room_id, user_id]
  );
};
