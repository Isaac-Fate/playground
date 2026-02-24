/**
 * Stopwatch state machine
 *
 * States: idle | running | paused
 * Events: START | PAUSE | RESUME | RESET | TICK
 *
 * State transitions:
 *   idle   + START  -> running
 *   running + PAUSE -> paused
 *   running + RESET -> idle
 *   paused  + RESUME -> running
 *   paused  + RESET -> idle
 *   running + TICK  -> running (elapsed updates)
 */

import type { StopwatchState, StopwatchEvent, StopwatchStatus } from "../types";

export const initialState: StopwatchState = {
  status: "idle",
  elapsed: 0,
  startedAt: null,
};

const transitions: Record<
  StopwatchStatus,
  Partial<
    Record<
      StopwatchEvent["type"],
      (s: StopwatchState, e: StopwatchEvent) => StopwatchState
    >
  >
> = {
  idle: {
    START: (s) => ({
      status: "running",
      elapsed: s.elapsed,
      startedAt: Date.now(),
    }),
  },
  running: {
    PAUSE: (s) => ({
      status: "paused",
      elapsed: s.startedAt ? s.elapsed + (Date.now() - s.startedAt) : s.elapsed,
      startedAt: null,
    }),
    RESET: () => initialState,
    TICK: (s, e) =>
      e.type === "TICK"
        ? {
            status: "running",
            elapsed: s.elapsed + e.delta,
            startedAt: s.startedAt,
          }
        : s,
  },
  paused: {
    RESUME: (s) => ({
      status: "running",
      elapsed: s.elapsed,
      startedAt: Date.now(),
    }),
    RESET: () => initialState,
  },
};

export function stopwatchReducer(
  state: StopwatchState,
  event: StopwatchEvent
): StopwatchState {
  const handler = transitions[state.status]?.[event.type];
  if (handler) {
    return handler(state, event);
  }
  return state;
}
