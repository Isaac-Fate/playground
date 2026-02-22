import { useRef, useCallback, useEffect, useState, useMemo } from "react";
import { useSaveDocumentContent } from "../services/use-save-document-content";
import { useGetDocument } from "../services/use-get-document";
import { computeChecksum } from "@/lib/checksum";

const AUTO_SAVE_INTERVAL_MS = 10_000;

// Auto-save is suppressed while the user is actively typing.
// "Idle" = no edits for at least this many milliseconds.
const IDLE_THRESHOLD_MS = 2_000;

interface UseDocumentEditorProps {
  documentId: string;
}

/**
 * Central state manager for the document editor.
 *
 * Owns local content state, dirty tracking (via checksum comparison with the
 * server), and two save strategies:
 *  1. Explicit save    – `save()`, for user-initiated saves (e.g. button click).
 *  2. Periodic fallback – interval that auto-saves if dirty, as a safety net
 *                         so edits are never silently lost.
 *
 * `updateContent` only mutates local state and never triggers network requests.
 */
export function useDocumentEditor({ documentId }: UseDocumentEditorProps) {
  // Guards one-time initialisation per document (see seed effect below).
  const initializedRef = useRef(false);

  // Timestamp of the last content edit; used by auto-save to detect idle.
  const contentLastEditedAtRef = useRef(0);

  // Refs that mirror the latest React state so the auto-save interval
  // callback always reads fresh values without being in its dep array
  // (which would cause the interval to be torn down and recreated).
  const contentRef = useRef("");
  const isDirtyRef = useRef(false);

  const { mutate: saveDocumentContent, isPending: isSaving } =
    useSaveDocumentContent();
  const { data: serverDocument, isLoading } = useGetDocument(documentId);

  const [content, setContent] = useState("");

  // Keep contentRef in sync with the latest content state every render.
  contentRef.current = content;

  // When the user navigates to a different document, reset the
  // initialisation guard so the seed effect below runs again.
  useEffect(() => {
    initializedRef.current = false;
  }, [documentId]);

  // Seed local state from the server document exactly once per document.
  // Subsequent query refetches (e.g. after a save invalidation) are
  // intentionally ignored so the user's in-progress edits aren't overwritten.
  useEffect(() => {
    if (serverDocument && !initializedRef.current) {
      setContent(serverDocument.content ?? "");
      initializedRef.current = true;
    }
  }, [serverDocument]);

  // Dirty = local content checksum differs from the last persisted checksum.
  // Recomputed whenever content or the server document changes.
  const isDirty = useMemo(() => {
    if (!serverDocument) return false;
    return computeChecksum(content) !== serverDocument.checksum;
  }, [serverDocument, content]);

  // Keep isDirtyRef in sync so the interval callback sees the latest value.
  isDirtyRef.current = isDirty;

  // Updates local content state and records the edit timestamp.
  // Does NOT trigger a network request – saving is handled separately.
  const updateContent = useCallback((next: string) => {
    setContent(next);
    // Eagerly update the ref so a save triggered in the same tick
    // (e.g. blur → save) reads the latest value.
    contentRef.current = next;
    contentLastEditedAtRef.current = Date.now();
  }, []);

  // Handle for the auto-save setInterval, stored in a ref so that
  // manual saves can clear + restart it to avoid back-to-back saves.
  const autoSaveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  // (Re)starts the periodic auto-save interval.
  // Clears any existing interval first so there is never more than one.
  const startAutoSaveInterval = useCallback(() => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    autoSaveIntervalRef.current = setInterval(() => {
      // Skip if the user is still actively typing to avoid saving
      // mid-keystroke and causing unnecessary re-renders.
      const idleMs = Date.now() - contentLastEditedAtRef.current;
      if (idleMs < IDLE_THRESHOLD_MS) return;

      // Only save when there are unsaved changes.
      if (isDirtyRef.current) {
        saveDocumentContent({
          id: documentId,
          content: contentRef.current,
        });
      }
    }, AUTO_SAVE_INTERVAL_MS);
  }, [saveDocumentContent, documentId]);

  // Explicit save – for user-initiated actions (e.g. Save button, Ctrl+S).
  const save = useCallback(() => {
    // Prevent concurrent save requests.
    if (isSaving) return;

    saveDocumentContent({
      id: documentId,
      content: contentRef.current,
    });

    // Reset the auto-save timer so the next tick is a full interval away,
    // preventing a redundant auto-save right after a manual one.
    startAutoSaveInterval();
  }, [saveDocumentContent, isSaving, documentId, startAutoSaveInterval]);

  // Bootstrap the auto-save interval once the server document is loaded.
  // Tears down the interval on unmount or when deps change.
  useEffect(() => {
    // Don't start auto-saving until we have server data to compare against.
    if (!serverDocument) return;

    startAutoSaveInterval();

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [serverDocument, startAutoSaveInterval]);

  return {
    content,
    updateContent,
    isDirty,
    isSaving,
    isLoading,
    save,
  };
}
