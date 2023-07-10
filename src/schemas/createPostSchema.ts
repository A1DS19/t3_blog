import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(10).max(100),
  description: z.string().min(10).max(100),
  text: z.string().min(10).max(1000),
});
