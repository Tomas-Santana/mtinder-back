import sharp from "sharp";

export const processProfilePic = async (buffer: Buffer) => {
  // change to 3:4 aspect ratio, resize to 600x800 and convert to webp
  return sharp(buffer)
    .resize({ width: 600, height: 800, fit: "cover" })
    .webp({force: true})
    .toBuffer();
}