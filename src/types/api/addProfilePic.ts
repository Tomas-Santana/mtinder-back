import z from 'zod';

export const addProfilePicSchema = z.object({
  encodedImage: z.string(),
});