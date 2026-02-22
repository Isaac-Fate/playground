import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { computeChecksum } from "@/lib/checksum";
import type { Document } from "../types";

interface SaveDocumentRequest {
  id: string;
  title?: string | null;
  content?: string | null;
}

async function saveDocument(request: SaveDocumentRequest) {
  await apiClient.put(`/api/editor/documents/${request.id}`, request);
}

export function useSaveDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveDocument,
    onSuccess: (_, variables) => {
      queryClient.setQueryData<Document>(["document", variables.id], (old) => {
        if (!old) return old;
        const updates: Partial<Document> = {};
        if (variables.title !== undefined) updates.title = variables.title;
        if (variables.content !== undefined) {
          updates.content = variables.content || null;
          updates.checksum =
            updates.content != null
              ? computeChecksum(updates.content)
              : null;
        }
        return { ...old, ...updates };
      });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}
