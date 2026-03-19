-- Rename ip_hash to visitor_hash (stores hash of client ID or IP)
ALTER TABLE "article_likes" RENAME COLUMN "ip_hash" TO "visitor_hash";

-- Rename the unique constraint
ALTER TABLE "article_likes" RENAME CONSTRAINT "article_likes_slug_ip_hash_unique" TO "article_likes_slug_visitor_hash_unique";
