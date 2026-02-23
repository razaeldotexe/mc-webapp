import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "mc-content.db");

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency
db.pragma("journal_mode = WAL");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS contents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT NOT NULL DEFAULT 'mod',
    file_path TEXT NOT NULL,
    thumbnail_path TEXT DEFAULT '',
    file_size INTEGER NOT NULL DEFAULT 0,
    extension TEXT NOT NULL,
    downloads INTEGER NOT NULL DEFAULT 0,
    visits INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Migration: Add downloads and visits columns if they don't exist
  -- We wrap this in a try-catch equivalent by checking pragmas or just letting it fail silently if it already exists, but SQLite ALter table doesn't support IF NOT EXISTS.
  -- Better way: check if column exists first.
`);

const tableInfo = db.pragma("table_info(contents)") as { name: string }[];
const hasDownloads = tableInfo.some((col) => col.name === "downloads");
const hasVisits = tableInfo.some((col) => col.name === "visits");

if (!hasDownloads) {
  db.exec(
    "ALTER TABLE contents ADD COLUMN downloads INTEGER NOT NULL DEFAULT 0;",
  );
}
if (!hasVisits) {
  db.exec("ALTER TABLE contents ADD COLUMN visits INTEGER NOT NULL DEFAULT 0;");
}

db.exec(`

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  -- Default max storage: 1TB in bytes
  INSERT OR IGNORE INTO settings (key, value) VALUES ('max_storage_bytes', '1099511627776');
`);

// --- Content helpers ---

export interface ContentRow {
  id: string;
  title: string;
  description: string;
  category: string;
  file_path: string;
  thumbnail_path: string;
  file_size: number;
  extension: string;
  downloads: number;
  visits: number;
  created_at: string;
}

export function getAllContents(): ContentRow[] {
  return db
    .prepare("SELECT * FROM contents ORDER BY created_at DESC")
    .all() as ContentRow[];
}

export function getContentById(id: string): ContentRow | undefined {
  return db.prepare("SELECT * FROM contents WHERE id = ?").get(id) as
    | ContentRow
    | undefined;
}

export function insertContent(
  content: Omit<ContentRow, "created_at" | "downloads" | "visits">,
): void {
  db.prepare(
    `
    INSERT INTO contents (id, title, description, category, file_path, thumbnail_path, file_size, extension, downloads, visits)
    VALUES (@id, @title, @description, @category, @file_path, @thumbnail_path, @file_size, @extension, 0, 0)
  `,
  ).run({ ...content, downloads: 0, visits: 0 });
}

export function deleteContent(id: string): void {
  db.prepare("DELETE FROM contents WHERE id = ?").run(id);
}

export function incrementVisitCount(id: string): void {
  db.prepare("UPDATE contents SET visits = visits + 1 WHERE id = ?").run(id);
}

export function incrementDownloadCount(id: string): void {
  db.prepare("UPDATE contents SET downloads = downloads + 1 WHERE id = ?").run(
    id,
  );
}

export function getTotalStoredSize(): number {
  const result = db
    .prepare("SELECT COALESCE(SUM(file_size), 0) as total FROM contents")
    .get() as { total: number };
  return result.total;
}

export function getContentCount(): number {
  const result = db.prepare("SELECT COUNT(*) as count FROM contents").get() as {
    count: number;
  };
  return result.count;
}

export function getContentsByCategory(): {
  category: string;
  count: number;
  total_size: number;
}[] {
  return db
    .prepare(
      `
    SELECT category, COUNT(*) as count, COALESCE(SUM(file_size), 0) as total_size 
    FROM contents GROUP BY category ORDER BY count DESC
  `,
    )
    .all() as { category: string; count: number; total_size: number }[];
}

export function getRecentContents(limit: number = 6): ContentRow[] {
  return db
    .prepare("SELECT * FROM contents ORDER BY created_at DESC LIMIT ?")
    .all(limit) as ContentRow[];
}

// --- Settings helpers ---

export function getSetting(key: string): string | undefined {
  const row = db
    .prepare("SELECT value FROM settings WHERE key = ?")
    .get(key) as { value: string } | undefined;
  return row?.value;
}

export function setSetting(key: string, value: string): void {
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(
    key,
    value,
  );
}

export default db;
