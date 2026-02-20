import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { documents } from "@/server/db/schema";
import { hashContent } from "@/lib/hash";

export const Route = createFileRoute("/api/editor/documents/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const doc = db
          .select()
          .from(documents)
          .where(eq(documents.id, params.id))
          .get();
        if (!doc) {
          return new Response("Document not found", { status: 404 });
        }
        return Response.json(doc);
      },
      PUT: async ({ params, request }) => {
        const body = await request.json();
        const content = body.content ?? null;
        const title = body.title ?? null;
        const checksum = content != null ? hashContent(content) : null;

        const updated = db
          .update(documents)
          .set({
            title,
            content,
            checksum,
            updatedAt: new Date(),
          })
          .where(eq(documents.id, params.id))
          .returning()
          .get();

        if (!updated) {
          return new Response("Document not found", { status: 404 });
        }
        return Response.json(updated);
      },
    },
  },
});
