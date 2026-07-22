import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("mendoza_report.db");

db.execSync(`
    CREATE TABLE IF NOT EXISTS pending_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data_json TEXT NOT NULL,
      image_uri TEXT,
      created_at TEXT NOT NULL
    );
  `);

export const saveOfflineReport = (data: any, imageUri: string | null) => {
  const createdAt = new Date().toISOString();
  const dataJson = JSON.stringify(data);

  db.runSync(
    "INSERT INTO pending_reports (data_json, image_uri, created_at) VALUES (?, ?, ?)",
    [dataJson, imageUri, createdAt],
  );
};

export const getPendingReports = () => {
  return db.getAllSync<{ id: number; data_json: string; image_uri: string }>(
    "SELECT * FROM pending_reports",
  );
};

export const deletePendingReport = (id: number) => {
  db.runSync("DELETE FROM pending_reports WHERE id = ?", [id]);
};
