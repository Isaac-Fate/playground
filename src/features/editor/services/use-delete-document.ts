import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { apiClient } from "@/lib/api/client";

async function deleteDocument(id: string) {
  await apiClient.delete(`/api/editor/documents/${id}`);
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ["document", id] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      router.navigate({ to: "/editor" });
    },
  });
}
