import fs from "fs";
import path from "path";

let blocklist: string[] | null = null;

function loadBlocklist(): string[] {
  if (blocklist !== null) return blocklist;

  const filePath = process.env.BLOCKLIST_PATH ?? "./config/blocklist.txt";
  const resolved = path.resolve(process.cwd(), filePath);

  try {
    const raw = fs.readFileSync(resolved, "utf-8");
    blocklist = raw
      .split("\n")
      .map((line) => line.trim().toLowerCase())
      .filter((line) => line.length > 0 && !line.startsWith("#"));
  } catch {
    // If blocklist file is missing, log a warning and proceed without it
    console.warn("[blocklist] Could not load blocklist file:", resolved);
    blocklist = [];
  }

  return blocklist;
}

export function isBlocked(topic: string): boolean {
  const terms = loadBlocklist();
  const normalized = topic.toLowerCase();
  return terms.some((term) => normalized.includes(term));
}
