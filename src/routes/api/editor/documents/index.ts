import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/server/db";
import { documentsTable } from "@/server/db/schema";

export const Route = createFileRoute("/api/editor/documents/")({
  server: {
    handlers: {
      GET: async () => {
        const rows = await db.select().from(documentsTable);
        return Response.json(rows);
      },
      POST: async () => {
        const [row] = await db
          .insert(documentsTable)
          .values({ title: null, content: null, checksum: null })
          .returning({ id: documentsTable.id });

        return Response.json({ id: row!.id });
      },
    },
  },
});
