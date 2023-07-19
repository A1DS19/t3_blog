import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(10).max(100),
  description: z.string().min(10).max(100),
  html: z.string().min(10),
  tagIds: z.array(z.object({ id: z.string() })).optional(),
});
