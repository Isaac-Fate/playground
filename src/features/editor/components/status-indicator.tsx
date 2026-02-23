import {
  Loader2Icon,
  CheckCircle2Icon,
  CircleDotIcon,
} from "lucide-react";
import type { DocumentEditorStatus } from "../hooks/use-document-editor";

type Props = {
  status: DocumentEditorStatus;
};

export function StatusIndicator({ status }: Props) {
  switch (status) {
    case "saving":
      return (
        <span
          className="text-muted-foreground flex items-center gap-1.5 text-xs"
          aria-live="polite"
        >
          <Loader2Icon className="size-3 animate-spin" aria-hidden strokeWidth={1.5} />
          Saving...
        </span>
      );
    case "dirty":
      return (
        <span
          className="text-muted-foreground flex items-center gap-1.5 text-xs"
          role="status"
        >
          <CircleDotIcon className="size-3" aria-hidden strokeWidth={1.5} />
          Unsaved
        </span>
      );
    case "idle":
      return (
        <span
          className="text-muted-foreground flex items-center gap-1.5 text-xs"
          role="status"
        >
          <CheckCircle2Icon className="size-3" aria-hidden strokeWidth={1.5} />
          Saved
        </span>
      );
    default:
      return null;
  }
}
