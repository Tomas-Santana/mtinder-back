import z from "zod";

export const uploadImageRequest = z.object({
  data: z.string(),
  path: z.string(),
});

const fileUpload = z.object({
  base64: z.string(),
  mimetype: z.string(),
  name: z.string().nullish(),
});

export const completeProfileRequest = z.object({
  images: z.array(fileUpload).max(5),
  genres: z.array(z.string()),
});
