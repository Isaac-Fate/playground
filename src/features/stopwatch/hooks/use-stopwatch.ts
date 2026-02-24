import { useReducer, useEffect, useRef, useCallback } from "react";
import { stopwatchReducer, initialState } from "../machine";
import type { StopwatchState, StopwatchEvent } from "../types";

const TICK_INTERVAL_MS = 10;

export function useStopwatch() {
  const [state, dispatch] = useReducer(stopwatchReducer, initialState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef<number>(0);

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (state.status === "running") {
      lastTickRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const delta = now - lastTickRef.current;
        lastTickRef.current = now;
        dispatch({ type: "TICK", delta });
      }, TICK_INTERVAL_MS);
    } else {
      clearTick();
    }
    return clearTick;
  }, [state.status, clearTick]);

  const start = useCallback(() => dispatch({ type: "START" }), []);
  const pause = useCallback(() => dispatch({ type: "PAUSE" }), []);
  const resume = useCallback(() => dispatch({ type: "RESUME" }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  return {
    state,
    start,
    pause,
    resume,
    reset,
  };
}

export type { StopwatchState, StopwatchEvent };
