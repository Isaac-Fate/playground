import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { apiClient } from "@/lib/api/client";

interface CreateDocumentResponse {
  id: string;
}

async function createDocument() {
  const response = await apiClient.post("/api/editor/documents");
  return response.data as CreateDocumentResponse;
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: createDocument,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      router.navigate({
        to: "/editor/documents/$id",
        params: { id: data.id },
      });
    },
  });
}
