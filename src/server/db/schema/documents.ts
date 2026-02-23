import { pgTable, text } from "drizzle-orm/pg-core";
import { baseEntityColumns } from "../base-entity";

export const documentsTable = pgTable("documents", {
  ...baseEntityColumns,
  title: text("title"),
  content: text("content"),
  checksum: text("checksum"),
});
