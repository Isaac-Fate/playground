import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { Document } from "../types";

async function listDocuments() {
  const response = await apiClient.get("/api/editor/documents");
  return response.data as Document[];
}

export function useListDocuments() {
  return useQuery({
    queryKey: ["documents"],
    queryFn: listDocuments,
  });
}
