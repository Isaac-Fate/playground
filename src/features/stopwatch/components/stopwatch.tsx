import { useStopwatch } from "../hooks/use-stopwatch";
import { formatElapsed } from "../utils/format-time";
import { Button } from "@/components/ui/button";
import { PlayIcon, PauseIcon, RotateCcwIcon } from "lucide-react";

export function Stopwatch() {
  const { state, start, pause, resume, reset } = useStopwatch();

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="font-mono text-5xl font-light tabular-nums tracking-tight text-foreground">
        {formatElapsed(state.elapsed)}
      </div>

      <div className="flex items-center gap-2">
        {state.status === "idle" && (
          <Button variant="ghost" size="lg" onClick={start} className="gap-2">
            <PlayIcon className="size-4" strokeWidth={1.5} />
            Start
          </Button>
        )}

        {state.status === "running" && (
          <>
            <Button variant="ghost" size="lg" onClick={pause} className="gap-2">
              <PauseIcon className="size-4" strokeWidth={1.5} />
              Pause
            </Button>
            <Button variant="ghost" size="lg" onClick={reset} className="gap-2">
              <RotateCcwIcon className="size-4" strokeWidth={1.5} />
              Reset
            </Button>
          </>
        )}

        {state.status === "paused" && (
          <>
            <Button variant="ghost" size="lg" onClick={resume} className="gap-2">
              <PlayIcon className="size-4" strokeWidth={1.5} />
              Resume
            </Button>
            <Button variant="ghost" size="lg" onClick={reset} className="gap-2">
              <RotateCcwIcon className="size-4" strokeWidth={1.5} />
              Reset
            </Button>
          </>
        )}
      </div>

      <p className="text-muted-foreground text-xs">State: {state.status}</p>
    </div>
  );
}
