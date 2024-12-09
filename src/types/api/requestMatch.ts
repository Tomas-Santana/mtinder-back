import z from "zod";

export const requestMatchSchema = z.object({
  userId: z.string(),
});

export type RequestMatch = z.infer<typeof requestMatchSchema>;
