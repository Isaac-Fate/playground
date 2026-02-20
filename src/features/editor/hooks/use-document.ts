import { useRef, useCallback, useEffect, useState } from "react";
import { useSaveDocument } from "../services/use-save-document";
import { useGetDocument } from "../services/use-get-document";
import { hashContent } from "@/lib/hash";

const DEBOUNCE_MS = 500;
const AUTO_SAVE_INTERVAL_MS = 10_000;

interface UseDocumentProps {
  documentId: string;
}

/**
 * Central state manager for the document editor.
 *
 * Owns local content/title state, dirty tracking (via MD5 checksum comparison
 * with the server), and three save strategies:
 *  1. Debounced save  – triggered automatically on every `updateContent` /
 *                        `updateTitle` call (resets on each keystroke).
 *  2. Immediate save   – `save()`, cancels any pending debounce.
 *  3. Periodic fallback – interval that auto-saves if dirty, as a safety net
 *                         in case the debounced save was interrupted.
 */
export function useDocument({ documentId }: UseDocumentProps) {
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const initializedRef = useRef(false);

  // Refs mirror the latest state so that callbacks and intervals always
  // read fresh values without needing them in dependency arrays.
  const contentRef = useRef("");
  const titleRef = useRef<string | null>(null);

  const { mutate: saveDocument, isPending: isSaving } = useSaveDocument();
  const { data: serverDocument, isLoading } = useGetDocument(documentId);

  const [content, setContent] = useState("");
  const [title, setTitle] = useState<string | null>(null);

  contentRef.current = content;
  titleRef.current = title;

  // Reset initialisation flag when navigating to a different document.
  useEffect(() => {
    initializedRef.current = false;
  }, [documentId]);

  // Seed local state from the server document exactly once per document.
  // Subsequent query refetches (e.g. after a save) are intentionally ignored
  // so the user's in-progress edits are never overwritten.
  useEffect(() => {
    if (serverDocument && !initializedRef.current) {
      setContent(serverDocument.content ?? "");
      setTitle(serverDocument.title);
      initializedRef.current = true;
    }
  }, [serverDocument]);

  // Dirty = local content checksum differs from the last persisted checksum.
  const isDirty = (() => {
    if (!serverDocument) return false;
    return hashContent(content) !== serverDocument.checksum;
  })();

  const scheduleDebouncedSave = useCallback(
    (nextContent: string, nextTitle: string | null) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        saveDocument({
          id: documentId,
          title: nextTitle,
          content: nextContent,
        });
        debounceRef.current = null;
      }, DEBOUNCE_MS);
    },
    [saveDocument, documentId],
  );

  const updateContent = useCallback(
    (next: string) => {
      setContent(next);
      contentRef.current = next;
      scheduleDebouncedSave(next, titleRef.current);
    },
    [scheduleDebouncedSave],
  );

  const updateTitle = useCallback(
    (next: string | null) => {
      setTitle(next);
      titleRef.current = next;
      scheduleDebouncedSave(contentRef.current, next);
    },
    [scheduleDebouncedSave],
  );

  // Immediate save – cancels any pending debounce to avoid a double-save.
  const save = useCallback(() => {
    if (isSaving) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    saveDocument({
      id: documentId,
      title: titleRef.current,
      content: contentRef.current,
    });
  }, [saveDocument, isSaving, documentId]);

  // Periodic auto-save: catches any dirty state that slipped past the
  // debounced save (e.g. tab left idle after typing).
  // Re-created when serverDocument changes so the checksum comparison
  // always uses the latest persisted value.
  useEffect(() => {
    if (!serverDocument) return;

    const interval = setInterval(() => {
      if (hashContent(contentRef.current) !== serverDocument.checksum) {
        saveDocument({
          id: documentId,
          title: titleRef.current,
          content: contentRef.current,
        });
      }
    }, AUTO_SAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [serverDocument, saveDocument, documentId]);

  // Flush pending debounce timer on unmount.
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    content,
    updateContent,
    title,
    updateTitle,
    isDirty,
    isSaving,
    isLoading,
    save,
  };
}
