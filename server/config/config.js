import path from "path";

export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;
export const DB_DIR = path.join(process.cwd(), "db-storage");
export const DB_FILE = path.join(DB_DIR, "db.json");
export const JWT_SECRET = process.env.JWT_SECRET || "team-pulse-secret-key-999";
export const CRYPTO_SALT = process.env.CRYPTO_SALT || "team_pulse_salt_2026";
