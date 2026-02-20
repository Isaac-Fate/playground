import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SaveIcon, Loader2, CheckCircle2, CircleDot } from "lucide-react";
import { useDocument } from "../hooks/use-document";

type Props = {
  documentId: string;
};

export function DocumentEditor({ documentId }: Props) {
  const { content, updateContent, isDirty, isSaving, isLoading, save } =
    useDocument({ documentId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Textarea
        value={content}
        onChange={(e) => updateContent(e.target.value)}
        placeholder="Start typing here..."
        className="h-[200px] resize-none"
      />

      <div className="flex w-full items-center justify-end gap-3">
        <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
          {isSaving ? (
            <>
              <Loader2 className="size-3 animate-spin" />
              Saving...
            </>
          ) : isDirty ? (
            <>
              <CircleDot className="size-3" />
              Unsaved changes
            </>
          ) : (
            <>
              <CheckCircle2 className="size-3" />
              Saved
            </>
          )}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={save}
          disabled={isSaving || !isDirty}
        >
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <SaveIcon className="size-4" />
          )}
          Save
        </Button>
      </div>
    </div>
  );
}
