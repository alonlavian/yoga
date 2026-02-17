import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "yoga.db");
const sqlite = new Database(dbPath);

sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    notes TEXT,
    date_of_birth TEXT,
    known_issues TEXT,
    avatar_url TEXT,
    start_date TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS class_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS class_plan_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER NOT NULL REFERENCES class_plans(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    pose_name TEXT NOT NULL,
    duration TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS timeline_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    date TEXT NOT NULL,
    content TEXT,
    duration INTEGER,
    class_plan_id INTEGER REFERENCES class_plans(id),
    summary TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Add new columns to existing tables (safe to run multiple times)
const studentColumns = sqlite
  .prepare("PRAGMA table_info(students)")
  .all() as { name: string }[];
const columnNames = studentColumns.map((c) => c.name);

if (!columnNames.includes("date_of_birth")) {
  sqlite.exec("ALTER TABLE students ADD COLUMN date_of_birth TEXT");
}
if (!columnNames.includes("known_issues")) {
  sqlite.exec("ALTER TABLE students ADD COLUMN known_issues TEXT");
}
if (!columnNames.includes("avatar_url")) {
  sqlite.exec("ALTER TABLE students ADD COLUMN avatar_url TEXT");
}

console.log("Database migrated successfully!");
sqlite.close();
