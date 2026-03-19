import { createFileRoute } from "@tanstack/react-router";
import { LikeButton } from "@/features/likes/components/like-button";
import { DEMO_PAGE_SLUG } from "@/lib/likes/constants";

export const Route = createFileRoute("/_main/like-demo/")({
  component: LikeDemoPage,
});

function LikeDemoPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-light tracking-tight">Like Demo</h1>
        <p className="text-muted-foreground text-sm">
          Anonymous like button. No sign-in required. Click to like, click again
          to unlike.
        </p>
      </div>

      <LikeButton slug={DEMO_PAGE_SLUG} />
    </div>
  );
}
