import express from "express";
import cors from "cors";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = `${__dirname}/../data`;
const TASKS_FILE = `${DATA_DIR}/tasks.json`;
const CATEGORIES_FILE = `${DATA_DIR}/categories.json`;

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
if (!existsSync(TASKS_FILE)) writeFileSync(TASKS_FILE, "[]", "utf-8");
if (!existsSync(CATEGORIES_FILE)) writeFileSync(CATEGORIES_FILE, "[]", "utf-8");

function readTasks() {
  return JSON.parse(readFileSync(TASKS_FILE, "utf-8"));
}
function writeTasks(tasks: unknown) {
  writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), "utf-8");
}
function readCategories() {
  return JSON.parse(readFileSync(CATEGORIES_FILE, "utf-8"));
}
function writeCategories(categories: unknown) {
  writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2), "utf-8");
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// --- Tasks ---
app.get("/api/tasks", (_req, res) => {
  res.json(readTasks());
});

app.post("/api/tasks", (req, res) => {
  const tasks = req.body;
  if (!Array.isArray(tasks)) return res.status(400).json({ error: "Expected array" });
  writeTasks(tasks);
  res.json({ ok: true, count: tasks.length });
});

// --- Categories ---
app.get("/api/categories", (_req, res) => {
  res.json(readCategories());
});

app.post("/api/categories", (req, res) => {
  const categories = req.body;
  if (!Array.isArray(categories)) return res.status(400).json({ error: "Expected array" });
  writeCategories(categories);
  res.json({ ok: true, count: categories.length });
});

// --- Bulk (front envia tudo de uma vez) ---
app.get("/api/data", (_req, res) => {
  res.json({ tasks: readTasks(), categories: readCategories() });
});

app.post("/api/data", (req, res) => {
  const { tasks, categories } = req.body ?? {};
  if (!Array.isArray(tasks) || !Array.isArray(categories)) {
    return res.status(400).json({ error: "Expected { tasks: [], categories: [] }" });
  }
  writeTasks(tasks);
  writeCategories(categories);
  res.json({ ok: true });
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  console.log(`[API] http://localhost:${PORT}`);
});
