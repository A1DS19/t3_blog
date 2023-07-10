import { z } from "zod";

export const createCommentSchema = z.object({
  text: z.string().min(10).max(1000),
});
