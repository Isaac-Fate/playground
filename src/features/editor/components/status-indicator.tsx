import { Badge } from "@/components/ui/badge";
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
        <Badge variant="secondary" className="gap-1.5" aria-live="polite">
          <Loader2Icon className="size-3 animate-spin" aria-hidden />
          Saving...
        </Badge>
      );
    case "dirty":
      return (
        <Badge
          variant="outline"
          className="gap-1.5 border-amber-500/50 text-amber-600 dark:text-amber-500"
          role="status"
        >
          <CircleDotIcon className="size-3" aria-hidden />
          Unsaved changes
        </Badge>
      );
    case "idle":
      return (
        <Badge
          variant="outline"
          className="gap-1.5 border-green-500/30 text-green-600 dark:text-green-500"
          role="status"
        >
          <CheckCircle2Icon className="size-3" aria-hidden />
          Saved
        </Badge>
      );
    default:
      return null;
  }
}
