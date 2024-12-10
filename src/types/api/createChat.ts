import z from 'zod';

export const createChatSchema = z.object({
  userId: z.string(),
});

export type CreateChat = z.infer<typeof createChatSchema>;