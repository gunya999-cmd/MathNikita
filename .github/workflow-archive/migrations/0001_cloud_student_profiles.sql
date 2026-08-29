CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  login_code TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  pin_salt TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  recovery_hash TEXT NOT NULL,
  progress_revision INTEGER NOT NULL DEFAULT 0,
  last_sync_id TEXT,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_students_login_code ON students(login_code);

CREATE TABLE IF NOT EXISTS student_progress (
  student_id TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  storage_value TEXT NOT NULL,
  revision INTEGER NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (student_id, storage_key),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_sessions (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_student_sessions_token ON student_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_student_sessions_student ON student_sessions(student_id);

CREATE TABLE IF NOT EXISTS progress_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,
  revision INTEGER NOT NULL,
  changed_keys INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_progress_history_student_revision ON progress_history(student_id, revision DESC);
