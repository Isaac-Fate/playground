import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Loader2, PlusIcon } from "lucide-react";
import { useListDocuments } from "@/features/editor/services/use-list-documents";
import { useCreateDocument } from "@/features/editor/services/use-create-document";

export const Route = createFileRoute("/_main/editor/")({
  component: EditorPage,
});

function EditorPage() {
  const { data: docs, isLoading } = useListDocuments();
  const { mutate: createDocument, isPending: isCreating } = useCreateDocument();

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Document Editor</h1>
        <p className="text-muted-foreground text-sm">
          Select a document to start editing
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="text-muted-foreground size-6 animate-spin" />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {docs?.map((doc) => (
            <Link
              key={doc.id}
              to="/editor/documents/$id"
              params={{ id: doc.id }}
              className="border-border hover:border-primary/40 hover:bg-accent/50 inline-flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors"
            >
              <FileText className="size-4" />
              {doc.title ?? (
                <span className="text-muted-foreground italic">Untitled</span>
              )}
            </Link>
          ))}
          <button
            onClick={() => createDocument()}
            disabled={isCreating}
            className="border-border hover:border-primary/40 hover:bg-accent/50 text-muted-foreground hover:text-foreground inline-flex items-center gap-2 rounded-lg border border-dashed px-4 py-2 transition-colors disabled:opacity-50"
          >
            {isCreating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <PlusIcon className="size-4" />
            )}
            New Document
          </button>
        </div>
      )}
    </div>
  );
}
