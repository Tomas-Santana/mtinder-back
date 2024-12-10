import z from "zod"

export type DeleteChatRequest = {
  _id: string;
};

export const DeleteChatRequestSchema = z.object({
  _id: z.string(),
});

export const DeleteChatResponseSchema = z.object({
  _id: z.string(),
});