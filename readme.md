# .env SETUP (backend):

DB_HOST=''
DB_USER=''
DB_PASSWORD=''
DB_NAME=''
DB_PORT=''
JWT_SECRET=''

# SQL SETUP:

CREATE TABLE users ( id SERIAL PRIMARY KEY, username VARCHAR(255) NOT NULL UNIQUE, password TEXT NOT NULL, role VARCHAR(255) NOT NULL );

CREATE TABLE rooms (
id SERIAL PRIMARY KEY,
name VARCHAR(255) NOT NULL,
description TEXT,
created_by INTEGER REFERENCES users(id),
created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_rooms (
user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
role VARCHAR(50) DEFAULT 'member', -- 'admin' lub 'member'
joined_at TIMESTAMP DEFAULT NOW(),
PRIMARY KEY (user_id, room_id)
);

CREATE TABLE room_members (
id SERIAL PRIMARY KEY,
room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
role VARCHAR(20) DEFAULT 'member',
added_at TIMESTAMP DEFAULT NOW(),
UNIQUE (room_id, user_id) -- prevents duplicates
);

CREATE TABLE messages (
id SERIAL PRIMARY KEY,
room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
content TEXT NOT NULL,
created_at TIMESTAMP DEFAULT NOW()
);

to-do ideas:
show how many online users are there on a page total and also show how many are there in each room?
