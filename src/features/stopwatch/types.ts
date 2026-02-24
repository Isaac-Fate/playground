export type StopwatchStatus = "idle" | "running" | "paused";

export type StopwatchEvent =
  | { type: "START" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "RESET" }
  | { type: "TICK"; delta: number };

export type StopwatchState = {
  status: StopwatchStatus;
  elapsed: number;
  startedAt: number | null;
};
