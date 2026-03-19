CREATE TABLE "article_likes" (
	"slug" text NOT NULL,
	"ip_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "article_likes_slug_ip_hash_unique" UNIQUE("slug","ip_hash")
);
