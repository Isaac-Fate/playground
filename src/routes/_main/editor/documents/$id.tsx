import { createFileRoute } from "@tanstack/react-router";
import { DocumentEditor } from "@/features/editor/components/document-editor";

export const Route = createFileRoute("/_main/editor/documents/$id")({
  component: DocumentEditorPage,
});

function DocumentEditorPage() {
  const { id } = Route.useParams();

  return (
    <main className="flex flex-1 flex-col gap-4 p-6 md:p-10">
      <div className="mx-auto w-full max-w-4xl space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Minimal Editor</h1>
          <p className="text-muted-foreground text-sm">
            Editing Document {id}
          </p>
        </div>

        <DocumentEditor documentId={id} />
      </div>
    </main>
  );
}
