import { createFileRoute } from "@tanstack/react-router";
import { DocumentEditor } from "@/features/editor/components/document-editor";

export const Route = createFileRoute("/_main/editor/documents/$id")({
  component: DocumentEditorPage,
});

function DocumentEditorPage() {
  const { id } = Route.useParams();

  return (
    <main className="flex flex-1 flex-col gap-4 p-6 md:p-10">
      <div className="mx-auto w-full max-w-4xl">
        <DocumentEditor documentId={id} />
      </div>
    </main>
  );
}
