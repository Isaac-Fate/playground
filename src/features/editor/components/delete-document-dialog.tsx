import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import { useDeleteDocument } from "../services/use-delete-document";

type Props = {
  documentId: string;
  disabled?: boolean;
};

export function DeleteDocumentDialog({ documentId, disabled }: Props) {
  const { mutate: deleteDocument, isPending: isDeleting } =
    useDeleteDocument();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          {isDeleting ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <Trash2Icon className="size-4" />
          )}
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete document</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this document? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => deleteDocument(documentId)}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
