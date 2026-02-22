import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiClient } from "@/lib/api/client";
import { computeChecksum } from "@/lib/checksum";
import type { Document } from "../types";

const saveDocumentContentRequestSchema = z.object({
  id: z.string(),
  content: z.string().nullable(),
});

export type SaveDocumentContentRequest = z.infer<
  typeof saveDocumentContentRequestSchema
>;

async function saveDocumentContent(request: SaveDocumentContentRequest) {
  await apiClient.put(`/api/editor/documents/${request.id}`, request);
}

export function useSaveDocumentContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveDocumentContent,
    onSuccess: (_, variables) => {
      const checksum =
        variables.content != null ? computeChecksum(variables.content) : null;
      queryClient.setQueryData<Document>(["document", variables.id], (old) =>
        old ? { ...old, content: variables.content, checksum } : old,
      );
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}
