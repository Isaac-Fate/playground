import { useRef, useCallback, useEffect, useState, useMemo } from "react";
import { useSaveDocument } from "../services/use-save-document";
import { useGetDocument } from "../services/use-get-document";
import { computeChecksum } from "@/lib/checksum";

const AUTO_SAVE_DEBOUNCE_MS = 2_000;

/**
 * Single enum that replaces multiple boolean flags (isLoading, isSaving, isDirty).
 * Components can switch on one value instead of juggling combinations of booleans.
 */
export type DocumentEditorStatus = "loading" | "idle" | "dirty" | "saving";

interface UseDocumentEditorProps {
  documentId: string;
}

/**
 * Core hook that manages the full lifecycle of document editing:
 * local state, server sync, dirty detection via checksum, and debounced auto-save.
 *
 * Key design principle: saving is a background operation that never blocks user input.
 * If a save is in flight and new edits arrive, they are queued and automatically
 * flushed once the current save settles.
 *
 * Title and content follow different save strategies:
 * - Title: saved immediately on blur / Enter (fire-and-forget, no dirty tracking).
 * - Content: tracked via checksum for dirty detection, saved on blur / button click,
 *   and also auto-saved via a debounce timer after the user stops typing.
 */
export function useDocumentEditor({ documentId }: UseDocumentEditorProps) {
  // ── External hooks ──────────────────────────────────────────────────
  const { mutate: saveDocument, isPending: isSaving } = useSaveDocument();
  const { data: serverDocument, isLoading } = useGetDocument(documentId);

  // ── State ───────────────────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // ── Refs ────────────────────────────────────────────────────────────
  const initializedRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const contentRef = useRef("");
  contentRef.current = content;

  const isSavingRef = useRef(false);
  isSavingRef.current = isSaving;

  // When true, flushSave will re-fire after the current in-flight save settles.
  const needsReSaveRef = useRef(false);
  // Queued title update that arrived while a save was in flight.
  const pendingTitleRef = useRef<string | null | undefined>(undefined);
  // Imperative mirror of the server checksum so flushSave can compute dirty
  // status without waiting for a React re-render after cache updates.
  const serverChecksumRef = useRef<string | null>(null);

  // ── Derived values ──────────────────────────────────────────────────

  const isDirty = useMemo(() => {
    if (!serverDocument) return false;
    const localChecksum = content ? computeChecksum(content) : null;
    return localChecksum !== serverDocument.checksum;
  }, [serverDocument, content]);

  const status: DocumentEditorStatus = (() => {
    if (isLoading) return "loading";
    if (isSaving) return "saving";
    if (isDirty) return "dirty";
    return "idle";
  })();

  // ── Core save dispatcher ───────────────────────────────────────────

  // Ref indirection so scheduleAutoSave can reference flushSave without
  // creating a circular useCallback dependency.
  const flushSaveRef = useRef<() => void>(() => {});

  const checkDirty = useCallback(() => {
    const localChecksum = contentRef.current
      ? computeChecksum(contentRef.current)
      : null;
    return localChecksum !== serverChecksumRef.current;
  }, []);

  // Stable reference — always schedules via the latest flushSave through the ref.
  const scheduleAutoSave = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(
      () => flushSaveRef.current(),
      AUTO_SAVE_DEBOUNCE_MS,
    );
  }, []);

  const flushSave = useCallback(() => {
    if (isSavingRef.current) {
      needsReSaveRef.current = true;
      return;
    }

    const payload: {
      id: string;
      content?: string | null;
      title?: string | null;
    } = { id: documentId };
    let hasWork = false;

    if (checkDirty()) {
      payload.content = contentRef.current || null;
      hasWork = true;
    }

    if (pendingTitleRef.current !== undefined) {
      payload.title = pendingTitleRef.current;
      pendingTitleRef.current = undefined;
      hasWork = true;
    }

    if (!hasWork) return;

    needsReSaveRef.current = false;
    saveDocument(payload, {
      onSuccess: () => {
        if (payload.content !== undefined) {
          serverChecksumRef.current =
            payload.content != null
              ? computeChecksum(payload.content)
              : null;
        }
      },
      onSettled: () => {
        setTimeout(() => {
          // Explicit re-save request or queued title → flush immediately.
          if (
            needsReSaveRef.current ||
            pendingTitleRef.current !== undefined
          ) {
            needsReSaveRef.current = false;
            flushSaveRef.current();
            return;
          }
          // Content dirtied passively during flight → debounce so we don't
          // rapid-fire saves while the user is still typing.
          if (checkDirty()) {
            scheduleAutoSave();
          }
        }, 0);
      },
    });
  }, [documentId, saveDocument, checkDirty, scheduleAutoSave]);

  flushSaveRef.current = flushSave;

  // ── Callbacks ───────────────────────────────────────────────────────

  const updateContent = useCallback(
    (next: string) => {
      setContent(next);
      contentRef.current = next;
      scheduleAutoSave();
    },
    [scheduleAutoSave],
  );

  // Manual save: triggered by the Save button or content textarea blur.
  // Cancels any pending debounce timer to avoid a duplicate save.
  const save = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    flushSave();
  }, [flushSave]);

  // Title is saved independently from content — no dirty tracking needed.
  // Queues into pendingTitleRef and delegates to flushSave, which handles
  // merging with content changes and queueing when a save is in flight.
  const saveTitle = useCallback(
    (newTitle: string) => {
      setTitle(newTitle);
      pendingTitleRef.current = newTitle.trim() || null;
      flushSave();
    },
    [flushSave],
  );

  // ── Effects ─────────────────────────────────────────────────────────

  // Reset state when switching documents; cleanup timer on unmount.
  useEffect(() => {
    initializedRef.current = false;
    needsReSaveRef.current = false;
    pendingTitleRef.current = undefined;
    serverChecksumRef.current = null;

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [documentId]);

  // Hydrate local state from server data exactly once per document.
  useEffect(() => {
    if (serverDocument && !initializedRef.current) {
      setTitle(serverDocument.title ?? "");
      setContent(serverDocument.content ?? "");
      contentRef.current = serverDocument.content ?? "";
      serverChecksumRef.current = serverDocument.checksum;
      initializedRef.current = true;
    }
  }, [serverDocument]);

  // ── Return ──────────────────────────────────────────────────────────

  return {
    title,
    setTitle,
    content,
    updateContent,
    status,
    isDirty,
    save,
    saveTitle,
  };
}
