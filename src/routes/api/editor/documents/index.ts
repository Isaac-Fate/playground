import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/server/db";
import { documents } from "@/server/db/schema";

export const Route = createFileRoute("/api/editor/documents/")({
  server: {
    handlers: {
      GET: async () => {
        const rows = db.select().from(documents).all();
        return Response.json(rows);
      },
      POST: async () => {
        const id = crypto.randomUUID();

        db.insert(documents)
          .values({ id, title: null, content: null, checksum: null })
          .run();

        return Response.json({ id });
      },
    },
  },
});
