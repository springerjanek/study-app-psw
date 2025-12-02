import { db } from "../database.js";

export const postMessage = (message) => {
  console.log(message.created_at);
  return db.query(
    "INSERT INTO messages (room_id, user_id, content, created_at) VALUES ($1, $2, $3, $4)",
    [message.roomId, message.userId, message.content, new Date()]
  );
};

export const getAllMessages = (roomId) => {
  return db.query(
    `
    SELECT 
      m.*,
      u.username as name
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.room_id = $1
    ORDER BY m.created_at ASC
  `,
    [roomId]
  );
};
