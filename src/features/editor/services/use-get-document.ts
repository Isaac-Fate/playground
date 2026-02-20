import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { Document } from "../types";

async function getDocument(id: string) {
  const response = await apiClient.get(`/api/editor/documents/${id}`);
  return response.data as Document;
}

export function useGetDocument(id: string | undefined) {
  return useQuery({
    queryKey: ["document", id ?? ""],
    queryFn: () => getDocument(id!),
    enabled: !!id,
  });
}
