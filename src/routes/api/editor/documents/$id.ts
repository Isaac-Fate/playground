import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { documents } from "@/server/db/schema";
import { computeChecksum } from "@/lib/checksum";

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
        const existing = db
          .select()
          .from(documents)
          .where(eq(documents.id, params.id))
          .get();
        if (!existing) {
          return new Response("Document not found", { status: 404 });
        }

        const content =
          "content" in body ? (body.content || null) : existing.content;
        const title = "title" in body ? (body.title ?? null) : existing.title;
        const checksum = content != null ? computeChecksum(content) : null;

        db.update(documents)
          .set({
            title,
            content,
            checksum,
            updatedAt: new Date(),
          })
          .where(eq(documents.id, params.id))
          .run();

        return Response.json({
          id: params.id,
        });
      },
      DELETE: async ({ params }) => {
        const existing = db
          .select()
          .from(documents)
          .where(eq(documents.id, params.id))
          .get();
        if (!existing) {
          return new Response("Document not found", { status: 404 });
        }

        db.delete(documents).where(eq(documents.id, params.id)).run();

        return new Response(null, { status: 204 });
      },
    },
  },
});
