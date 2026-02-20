import { z } from "zod";

export const documentSchema = z.object({
  id: z.string(),
  title: z.string().nullable(),
  content: z.string().nullable(),
  checksum: z.string().nullable(),
});

export type Document = z.infer<typeof documentSchema>;
