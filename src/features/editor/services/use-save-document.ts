import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { z } from "zod";

const saveDocumentRequestSchema = z.object({
  id: z.string(),
  title: z.string().nullable(),
  content: z.string().nullable(),
});

export type SaveDocumentRequest = z.infer<typeof saveDocumentRequestSchema>;

const saveDocumentResponseSchema = z.object({
  id: z.string(),
  title: z.string().nullable(),
  content: z.string().nullable(),
  checksum: z.string().nullable(),
});

type SaveDocumentResponseData = z.infer<typeof saveDocumentResponseSchema>;

async function saveDocument(request: SaveDocumentRequest) {
  const response = await apiClient.put(
    `/api/editor/documents/${request.id}`,
    request,
  );
  const parsedResponse: SaveDocumentResponseData =
    saveDocumentResponseSchema.parse(response.data);

  return parsedResponse;
}

export function useSaveDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveDocument,
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["document", saved.id] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}
