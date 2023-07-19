import { z } from "zod";

export const createTagSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().min(1).max(500),
});
