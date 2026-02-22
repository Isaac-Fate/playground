import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { documents } from "./schema";
import { mkdirSync } from "node:fs";
import { computeChecksum } from "../../lib/checksum";

mkdirSync("data", { recursive: true });

const sqlite = new Database("data/playground.db");
const db = drizzle(sqlite);

const existing = db.select().from(documents).all();
if (existing.length === 0) {
  const seeds = [
    {
      id: "1",
      title: "Getting Started",
      content:
        "Welcome to the editor! This is your first document. Feel free to edit it.",
    },
    {
      id: "2",
      title: "Meeting Notes",
      content:
        "Discussed project timeline and milestones. Next meeting scheduled for Friday.",
    },
    {
      id: "3",
      title: "Ideas",
      content: "- Implement dark mode\n- Add markdown support\n- Export to PDF",
    },
  ];

  db.insert(documents)
    .values(
      seeds.map((s) => ({
        ...s,
        checksum: computeChecksum(s.content),
      })),
    )
    .run();
  console.log("Seeded 3 documents.");
} else {
  console.log(
    `Database already has ${existing.length} documents, skipping seed.`,
  );
}

sqlite.close();
