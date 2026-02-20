import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const documents = sqliteTable("documents", {
  id: text("id").primaryKey(),
  title: text("title"),
  content: text("content"),
  checksum: text("checksum"),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});
