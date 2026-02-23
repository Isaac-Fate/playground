import { createFileRoute } from "@tanstack/react-router";
import { DocumentEditor } from "@/features/editor/components/document-editor";

export const Route = createFileRoute("/_main/editor/documents/$id")({
  component: DocumentEditorPage,
});

function DocumentEditorPage() {
  const { id } = Route.useParams();

  return <DocumentEditor documentId={id} />;
}
