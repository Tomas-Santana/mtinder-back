import z from 'zod';

export const deleteProfilePicSchema = z.object({
  url: z.string()
});