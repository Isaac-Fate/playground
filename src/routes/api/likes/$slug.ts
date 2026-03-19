import { createFileRoute } from "@tanstack/react-router";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { articleLikesTable } from "@/server/db/schema";
import { getVisitorIdentifier } from "@/lib/likes/get-visitor-identifier";
import { hashVisitorIdentifier } from "@/lib/likes/hash-visitor-identifier";
import { isValidSlug } from "@/lib/likes/validate-slug";
import {
  withCorsHeaders,
  createCorsPreflightResponse,
} from "@/lib/likes/cors";

function createErrorResponse(
  status: number,
  error: string,
  message: string,
  retryAfter?: number
): Response {
  const body: Record<string, unknown> = { error, message };
  if (retryAfter != null) {
    body.retryAfter = retryAfter;
  }
  return Response.json(body, { status });
}

export const Route = createFileRoute("/api/likes/$slug")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => {
        const origin = request.headers.get("Origin");
        return createCorsPreflightResponse(origin);
      },
      GET: async ({ params, request }) => {
        const { slug } = params;
        const origin = request.headers.get("Origin");

        if (!isValidSlug(slug)) {
          const res = createErrorResponse(
            400,
            "invalid_slug",
            "Slug must be 1-200 characters, alphanumeric, hyphen, or underscore only."
          );
          return withCorsHeaders(res, origin);
        }

        const identifier = getVisitorIdentifier(request);
        if (!identifier) {
          const res = createErrorResponse(
            400,
            "missing_visitor_id",
            "Could not identify visitor. Enable cookies/localStorage or ensure request includes client IP."
          );
          return withCorsHeaders(res, origin);
        }

        const salt = process.env.LIKE_SYSTEM_SALT;
        if (!salt) {
          const res = createErrorResponse(
            500,
            "internal_error",
            "Server configuration error."
          );
          return withCorsHeaders(res, origin);
        }

        try {
          const visitorHash = await hashVisitorIdentifier(identifier, salt);

          const [countResult] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(articleLikesTable)
            .where(eq(articleLikesTable.slug, slug));

          const count = Number(countResult?.count ?? 0);

          const [likedRow] = await db
            .select({ slug: articleLikesTable.slug })
            .from(articleLikesTable)
            .where(
              and(
                eq(articleLikesTable.slug, slug),
                eq(articleLikesTable.visitorHash, visitorHash)
              )
            )
            .limit(1);

          const liked = !!likedRow;

          const res = Response.json({ slug, count, liked });
          return withCorsHeaders(res, origin);
        } catch {
          const res = createErrorResponse(
            500,
            "internal_error",
            "An unexpected error occurred."
          );
          return withCorsHeaders(res, origin);
        }
      },
      POST: async ({ params, request }) => {
        const { slug } = params;
        const origin = request.headers.get("Origin");

        if (!isValidSlug(slug)) {
          const res = createErrorResponse(
            400,
            "invalid_slug",
            "Slug must be 1-200 characters, alphanumeric, hyphen, or underscore only."
          );
          return withCorsHeaders(res, origin);
        }

        const identifier = getVisitorIdentifier(request);
        if (!identifier) {
          const res = createErrorResponse(
            400,
            "missing_visitor_id",
            "Could not identify visitor. Enable cookies/localStorage or ensure request includes client IP."
          );
          return withCorsHeaders(res, origin);
        }

        const salt = process.env.LIKE_SYSTEM_SALT;
        if (!salt) {
          const res = createErrorResponse(
            500,
            "internal_error",
            "Server configuration error."
          );
          return withCorsHeaders(res, origin);
        }

        try {
          const visitorHash = await hashVisitorIdentifier(identifier, salt);

          const [existing] = await db
            .select({ slug: articleLikesTable.slug })
            .from(articleLikesTable)
            .where(
              and(
                eq(articleLikesTable.slug, slug),
                eq(articleLikesTable.visitorHash, visitorHash)
              )
            )
            .limit(1);

          if (existing) {
            await db
              .delete(articleLikesTable)
              .where(
                and(
                  eq(articleLikesTable.slug, slug),
                  eq(articleLikesTable.visitorHash, visitorHash)
                )
              );
          } else {
            await db.insert(articleLikesTable).values({ slug, visitorHash });
          }

          const [countResult] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(articleLikesTable)
            .where(eq(articleLikesTable.slug, slug));

          const count = Number(countResult?.count ?? 0);
          const liked = !existing;

          const res = Response.json({ slug, count, liked });
          return withCorsHeaders(res, origin);
        } catch {
          const res = createErrorResponse(
            500,
            "internal_error",
            "An unexpected error occurred."
          );
          return withCorsHeaders(res, origin);
        }
      },
    },
  },
});
