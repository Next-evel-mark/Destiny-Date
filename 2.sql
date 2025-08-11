CREATE TABLE groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  creator_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE group_members (
  group_id INTEGER REFERENCES groups(id),
  user_id INTEGER REFERENCES users(id),
  PRIMARY KEY (group_id, user_id)
);

CREATE TABLE channels (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES groups(id),
  name VARCHAR(100) NOT NULL
);
