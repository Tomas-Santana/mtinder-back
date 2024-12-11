import { z } from "zod";

export const sendMessage = z.object({
  contentType: z.enum(["text", "image"]),
  content: z.string(),
  mimeType: z.string().optional()
});
