CREATE TABLE t_p89566318_neon_lights_project.users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  lang VARCHAR(8) DEFAULT 'ru',
  is_subscribed BOOLEAN DEFAULT FALSE,
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_p89566318_neon_lights_project.chat_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES t_p89566318_neon_lights_project.users(id),
  title VARCHAR(500) DEFAULT 'Новый чат',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_p89566318_neon_lights_project.messages (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES t_p89566318_neon_lights_project.chat_sessions(id),
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_p89566318_neon_lights_project.payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES t_p89566318_neon_lights_project.users(id),
  payment_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'pending',
  amount INTEGER DEFAULT 89,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
