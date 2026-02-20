import { Link } from "@tanstack/react-router";
import { FileQuestion, Home } from "lucide-react";
import type { NotFoundRouteProps } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

/**
 * Reusable 404 component for TanStack Router.
 * Receives NotFoundError when thrown programmatically via notFound().
 * @see https://tanstack.com/router/latest/docs/framework/react/guide/not-found-errors
 */
export function NotFound(_props: NotFoundRouteProps) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center">
      <Empty className="border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileQuestion />
        </EmptyMedia>
        <EmptyTitle>404 — Page not found</EmptyTitle>
        <EmptyDescription>
          The page you're looking for doesn't exist or has been moved.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link to="/">
            <Home className="size-4" />
            Back to home
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
    </main>
  );
}
