import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { documentsTable } from "@/server/db/schema";
import { computeChecksum } from "@/lib/checksum";

export const Route = createFileRoute("/api/editor/documents/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const [doc] = await db
          .select()
          .from(documentsTable)
          .where(eq(documentsTable.id, params.id))
          .limit(1);
        if (!doc) {
          return new Response("Document not found", { status: 404 });
        }
        return Response.json(doc);
      },
      PUT: async ({ params, request }) => {
        const body = await request.json();
        const [existing] = await db
          .select()
          .from(documentsTable)
          .where(eq(documentsTable.id, params.id))
          .limit(1);
        if (!existing) {
          return new Response("Document not found", { status: 404 });
        }

        const content =
          "content" in body ? body.content || null : existing.content;
        const title = "title" in body ? (body.title ?? null) : existing.title;
        const checksum = content != null ? computeChecksum(content) : null;

        await db
          .update(documentsTable)
          .set({ title, content, checksum })
          .where(eq(documentsTable.id, params.id));

        return Response.json({
          id: params.id,
        });
      },
      DELETE: async ({ params }) => {
        const [existing] = await db
          .select()
          .from(documentsTable)
          .where(eq(documentsTable.id, params.id))
          .limit(1);
        if (!existing) {
          return new Response("Document not found", { status: 404 });
        }

        await db
          .delete(documentsTable)
          .where(eq(documentsTable.id, params.id));

        return new Response(null, { status: 204 });
      },
    },
  },
});
