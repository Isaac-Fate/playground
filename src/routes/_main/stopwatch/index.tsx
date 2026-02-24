import { createFileRoute } from "@tanstack/react-router";
import { Stopwatch } from "@/features/stopwatch";

export const Route = createFileRoute("/_main/stopwatch/")({
  component: StopwatchPage,
});

function StopwatchPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-light tracking-tight">Stopwatch</h1>
        <p className="text-muted-foreground text-sm">
          useReducer + state machine pattern.
        </p>
      </div>

      <Stopwatch />
    </div>
  );
}
