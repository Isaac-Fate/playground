import { useBlocker } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SaveIcon, Loader2Icon } from "lucide-react";
import { useDocumentEditor } from "../hooks/use-document-editor";
import { DeleteDocumentDialog } from "./delete-document-dialog";
import { StatusIndicator } from "./status-indicator";

export function DocumentEditor({ documentId }: { documentId: string }) {
  const { title, setTitle, content, updateContent, status, save, saveTitle } =
    useDocumentEditor({ documentId });

  useBlocker({
    shouldBlockFn: () => {
      if (status === "saving") return false;
      if (status !== "dirty") return false;
      return !confirm(
        "You have unsaved changes. Are you sure you want to leave?",
      );
    },
    enableBeforeUnload: status === "dirty",
  });

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2Icon className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }

  const isBusy = status === "saving";

  const handleTitleBlur = () => {
    saveTitle(title);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.currentTarget.blur();
  };

  return (
    <div className="flex flex-col gap-4">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleTitleBlur}
        onKeyDown={handleTitleKeyDown}
        placeholder="Untitled"
        className="placeholder:text-muted-foreground/60 border-none px-0 text-2xl! font-bold tracking-tight shadow-none placeholder:font-normal placeholder:italic focus-visible:ring-0"
        disabled={isBusy}
      />

      <Textarea
        value={content}
        onChange={(e) => updateContent(e.target.value)}
        onBlur={save}
        placeholder="Start typing here..."
        className="h-[200px] resize-none"
        disabled={isBusy}
      />

      <div className="flex w-full items-center justify-between gap-3">
        <StatusIndicator status={status} />

        <div className="ml-auto flex items-center gap-2">
          <DeleteDocumentDialog documentId={documentId} disabled={isBusy} />
          <Button
            variant="outline"
            size="sm"
            onClick={save}
            disabled={isBusy || status !== "dirty"}
          >
            {status === "saving" ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <SaveIcon className="size-4" />
            )}
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
