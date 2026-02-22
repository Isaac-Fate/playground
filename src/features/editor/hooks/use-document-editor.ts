import { useRef, useCallback, useEffect, useState, useMemo } from "react";
import { useSaveDocument } from "../services/use-save-document";
import { useGetDocument } from "../services/use-get-document";
import { computeChecksum } from "@/lib/checksum";

const AUTO_SAVE_INTERVAL_MS = 10_000;
const IDLE_THRESHOLD_MS = 2_000;

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
 * local state, server sync, dirty detection via checksum, and interval-based auto-save.
 *
 * Title and content follow different save strategies:
 * - Title: saved immediately on blur / Enter (fire-and-forget, no dirty tracking).
 * - Content: tracked via checksum for dirty detection, saved on blur / button click,
 *   and also auto-saved after the user goes idle.
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
  const contentLastEditedAtRef = useRef(0);
  const autoSaveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  // Mirrors of state for use inside interval/callback closures to avoid stale reads.
  const contentRef = useRef("");
  contentRef.current = content;
  const isDirtyRef = useRef(false);

  // ── Derived values ──────────────────────────────────────────────────

  // Dirty detection: compare local content checksum against the server's stored checksum.
  // Empty content is treated as null to match a freshly-created document (checksum is null).
  const isDirty = useMemo(() => {
    if (!serverDocument) return false;
    const localChecksum = content ? computeChecksum(content) : null;
    return localChecksum !== serverDocument.checksum;
  }, [serverDocument, content]);

  isDirtyRef.current = isDirty;

  // Derive a single status enum from the underlying boolean flags.
  // Order matters: saving takes precedence over dirty (optimistic UI),
  // and loading takes precedence over everything.
  const status: DocumentEditorStatus = (() => {
    if (isLoading) return "loading";
    if (isSaving) return "saving";
    if (isDirty) return "dirty";
    return "idle";
  })();

  // ── Callbacks ───────────────────────────────────────────────────────

  const updateContent = useCallback((next: string) => {
    setContent(next);
    contentRef.current = next;
    contentLastEditedAtRef.current = Date.now();
  }, []);

  // Polls on a fixed interval; only fires the actual save when the user has been
  // idle for IDLE_THRESHOLD_MS *and* content is dirty. Restarting the interval
  // on each manual save prevents the two from overlapping.
  const startAutoSaveInterval = useCallback(() => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    autoSaveIntervalRef.current = setInterval(() => {
      const idleMs = Date.now() - contentLastEditedAtRef.current;
      if (idleMs < IDLE_THRESHOLD_MS) return;

      if (isDirtyRef.current) {
        saveDocument({ id: documentId, content: contentRef.current });
      }
    }, AUTO_SAVE_INTERVAL_MS);
  }, [saveDocument, documentId]);

  // Manual save: triggered by the Save button or content textarea blur.
  // Also resets the auto-save timer to avoid a duplicate save right after.
  const save = useCallback(() => {
    if (isSaving) return;
    saveDocument({ id: documentId, content: contentRef.current });
    startAutoSaveInterval();
  }, [isSaving, saveDocument, documentId, startAutoSaveInterval]);

  // Title is saved independently from content — no dirty tracking needed.
  // Empty strings are normalized to null so the DB stores NULL for untitled docs.
  const saveTitle = useCallback(
    (newTitle: string) => {
      setTitle(newTitle);
      if (isSaving) return;
      saveDocument({ id: documentId, title: newTitle.trim() || null });
    },
    [isSaving, documentId, saveDocument],
  );

  // ── Effects ─────────────────────────────────────────────────────────

  // Reset initialization flag when switching documents so the next fetch hydrates local state.
  useEffect(() => {
    initializedRef.current = false;
  }, [documentId]);

  // Hydrate local state from server data exactly once per document.
  useEffect(() => {
    if (serverDocument && !initializedRef.current) {
      setTitle(serverDocument.title ?? "");
      setContent(serverDocument.content ?? "");
      initializedRef.current = true;
    }
  }, [serverDocument]);

  // Start the auto-save interval once the document is loaded; clean up on unmount.
  useEffect(() => {
    if (!serverDocument) return;

    startAutoSaveInterval();

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [serverDocument, startAutoSaveInterval]);

  // ── Return ──────────────────────────────────────────────────────────

  return {
    title,
    setTitle,
    content,
    updateContent,
    status,
    save,
    saveTitle,
  };
}
