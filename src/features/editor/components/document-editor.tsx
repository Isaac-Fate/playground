import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  SaveIcon,
  Loader2Icon,
  CheckCircle2Icon,
  CircleDotIcon,
} from "lucide-react";
import { useDocumentEditor } from "../hooks/use-document-editor";

type Props = {
  documentId: string;
};

function DirtyIndicator({
  isDirty,
  isSaving,
}: {
  isDirty: boolean;
  isSaving: boolean;
}) {
  if (isSaving) {
    return (
      <span
        className="text-muted-foreground flex items-center gap-1.5 text-xs"
        aria-live="polite"
      >
        <Loader2Icon className="size-3 animate-spin" aria-hidden />
        Saving...
      </span>
    );
  }

  if (isDirty) {
    return (
      <span
        className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-500"
        role="status"
      >
        <CircleDotIcon className="size-3" aria-hidden />
        Unsaved changes
      </span>
    );
  }

  return (
    <span
      className="text-muted-foreground flex items-center gap-1.5 text-xs"
      role="status"
    >
      <CheckCircle2Icon
        className="size-3 text-green-600 dark:text-green-500"
        aria-hidden
      />
      Saved
    </span>
  );
}

export function DocumentEditor({ documentId }: Props) {
  const { content, updateContent, isDirty, isSaving, isLoading, save } =
    useDocumentEditor({ documentId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2Icon className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateContent(e.target.value);
  };

  const handleTextareaBlur = () => {
    save();
  };

  return (
    <div className="flex flex-col gap-4">
      <Textarea
        value={content}
        onChange={handleTextareaChange}
        onBlur={handleTextareaBlur}
        placeholder="Start typing here..."
        className="h-[200px] resize-none"
      />

      <div className="flex w-full items-center justify-between gap-3">
        <DirtyIndicator isDirty={isDirty} isSaving={isSaving} />

        <Button
          variant="outline"
          size="sm"
          onClick={save}
          disabled={isSaving || !isDirty}
        >
          {isSaving ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <SaveIcon className="size-4" />
          )}
          Save
        </Button>
      </div>
    </div>
  );
}
