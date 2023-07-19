import { z } from "zod";

export const addImageToPostSchema = z.object({
  query: z.string().min(1).max(50),
});
