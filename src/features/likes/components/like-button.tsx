import { useState, useEffect, useCallback } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LikeButtonProps {
  slug: string;
  apiBaseUrl?: string;
}

interface LikeState {
  count: number;
  liked: boolean;
}

export function LikeButton({ slug, apiBaseUrl = "" }: LikeButtonProps) {
  const [count, setCount] = useState<number>(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = apiBaseUrl.replace(/\/$/, "");
  const apiUrl = `${baseUrl}/api/likes/${slug}`;

  const fetchState = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(apiUrl);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? `Request failed: ${res.status}`);
      }
      const data = (await res.json()) as LikeState;
      setCount(data.count);
      setLiked(data.liked);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load likes");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const handleClick = async () => {
    if (loading) return;

    const prevCount = count;
    const prevLiked = liked;

    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? `Request failed: ${res.status}`);
      }

      const data = (await res.json()) as LikeState;
      setCount(data.count);
      setLiked(data.liked);
    } catch {
      setCount(prevCount);
      setLiked(prevLiked);
      setError("Failed to update like");
    }
  };

  if (loading) {
    return (
      <Button variant="ghost" size="lg" disabled className="gap-2">
        <Heart className="size-4" strokeWidth={1.5} />
        <span className="text-muted-foreground">—</span>
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant="ghost"
        size="lg"
        onClick={handleClick}
        className={`gap-2 ${liked ? "text-red-500" : ""}`}
        aria-pressed={liked}
        aria-label={liked ? "Unlike" : "Like"}
      >
        <Heart
          className={`size-4 ${liked ? "fill-current" : ""}`}
          strokeWidth={1.5}
        />
        <span>{count}</span>
      </Button>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
