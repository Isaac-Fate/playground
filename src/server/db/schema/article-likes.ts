import { pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

export const articleLikesTable = pgTable(
  "article_likes",
  {
    slug: text("slug").notNull(),
    visitorHash: text("visitor_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique().on(table.slug, table.visitorHash)]
);
