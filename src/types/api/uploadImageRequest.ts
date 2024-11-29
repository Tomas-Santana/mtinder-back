import z from 'zod';

export const uploadImageRequest = z.object({
  data: z.string(),
  path: z.string(),
});