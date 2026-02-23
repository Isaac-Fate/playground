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
    <div className="flex flex-col gap-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-light tracking-tight">
          Document Editor
        </h1>
        <p className="text-muted-foreground text-sm">
          Select a document to edit or create a new one.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="text-muted-foreground size-6 animate-spin" />
        </div>
      ) : docs?.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border/60 py-16">
          <p className="text-muted-foreground text-sm">No documents yet.</p>
          <button
            onClick={() => createDocument()}
            disabled={isCreating}
            className="border-border/60 hover:bg-muted/40 text-muted-foreground hover:text-foreground inline-flex items-center gap-2 rounded-lg border border-dashed px-4 py-2 text-sm transition-colors disabled:opacity-50"
          >
            {isCreating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <PlusIcon className="size-4" strokeWidth={1.5} />
            )}
            New Document
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {docs?.map((doc) => (
            <Link
              key={doc.id}
              to="/editor/documents/$id"
              params={{ id: doc.id }}
              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/40"
            >
              <FileText className="text-muted-foreground size-4 shrink-0 transition-colors group-hover:text-foreground" strokeWidth={1.5} />
              <span className="truncate font-medium">
                {doc.title ?? (
                  <span className="text-muted-foreground italic font-normal">
                    Untitled
                  </span>
                )}
              </span>
            </Link>
          ))}
          <button
            onClick={() => createDocument()}
            disabled={isCreating}
            className="text-muted-foreground hover:text-foreground mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/40 disabled:opacity-50"
          >
            {isCreating ? (
              <Loader2 className="size-4 shrink-0 animate-spin" />
            ) : (
              <PlusIcon className="size-4 shrink-0" strokeWidth={1.5} />
            )}
            <span className="text-sm">New Document</span>
          </button>
        </div>
      )}
    </div>
  );
}
