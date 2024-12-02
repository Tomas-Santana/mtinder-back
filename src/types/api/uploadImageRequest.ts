import z from 'zod';

export const uploadImageRequest = z.object({
  data: z.string(),
  path: z.string(),
});

export const uploadImagesRequest = z.object({
  imagesBase64: z.array(z.string()).max(5),
});