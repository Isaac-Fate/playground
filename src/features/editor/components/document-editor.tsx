import { useBlocker } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SaveIcon, Loader2Icon } from "lucide-react";
import { useDocumentEditor } from "../hooks/use-document-editor";
import { DeleteDocumentDialog } from "./delete-document-dialog";
import { StatusIndicator } from "./status-indicator";

export function DocumentEditor({ documentId }: { documentId: string }) {
  const {
    title,
    setTitle,
    content,
    updateContent,
    status,
    isDirty,
    save,
    saveTitle,
  } = useDocumentEditor({ documentId });

  useBlocker({
    shouldBlockFn: () => {
      if (!isDirty) return false;
      return !confirm(
        "You have unsaved changes. Are you sure you want to leave?",
      );
    },
    enableBeforeUnload: isDirty,
  });

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2Icon className="text-muted-foreground size-6 animate-spin" strokeWidth={1.5} />
      </div>
    );
  }

  const isSaving = status === "saving";

  return (
    <div className="flex flex-col gap-8">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => saveTitle(title)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        placeholder="Untitled"
        className="placeholder:text-muted-foreground/60 border-none px-0 text-3xl font-light tracking-tight shadow-none placeholder:font-normal placeholder:italic focus-visible:ring-0"
      />

      <Textarea
        value={content}
        onChange={(e) => updateContent(e.target.value)}
        onBlur={save}
        placeholder="Start typing..."
        className="min-h-[280px] resize-none border-none px-0 text-base leading-relaxed shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-0"
      />

      <div className="flex items-center justify-between gap-4 border-t border-border/60 pt-6">
        <StatusIndicator status={status} />

        <div className="flex items-center gap-2">
          <DeleteDocumentDialog documentId={documentId} disabled={isSaving} />
          <Button
            variant="ghost"
            size="sm"
            onClick={save}
            disabled={isSaving || !isDirty}
            className="text-muted-foreground hover:text-foreground"
          >
            {isSaving ? (
              <Loader2Icon className="size-4 animate-spin" strokeWidth={1.5} />
            ) : (
              <SaveIcon className="size-4" strokeWidth={1.5} />
            )}
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
