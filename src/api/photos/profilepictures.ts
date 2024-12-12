import { deleteProfilePicSchema } from "../../types/api/deleteProfilePic";
import { addProfilePicSchema } from "../../types/api/addProfilePic";
import { principalProfilePicSchema } from "../../types/api/principalProfilePic";
import { Request, Response } from "express";
import User from "../../database/models/user";
import { AbstractFileSystem } from "../../storage/AbstractFileSystem";
import JwtPayloadWithUser from "../../types/api/jwtPayload";
import { processProfilePic } from "../../helpers/processFile";

export const deleteProfilePic = async (req: Request, res: Response, fs: AbstractFileSystem) => {
  const user = res.locals.user as JwtPayloadWithUser;

  const { success, data } = deleteProfilePicSchema.safeParse(req.body);

  if (!success) {
    res.status(400).json({ error: "Invalid request." });
    return;
  }

  const userIdFromUrl = fs.getUserIdfromUrl(data.url);

  if (!userIdFromUrl) {
    res.status(400).json({ error: "Invalid URL." });
    return;
  }

  if (userIdFromUrl !== user.user.id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const userDoc = await User.findById(user.user.id);

  if (!userDoc) {
    res.status(404).json({ error: "User not found." });
    return;
  }
  if (!userDoc.imageUrls?.includes(data.url)) {
    res.status(404).json({ error: "Image not found." });
    return;
  }

  userDoc.imageUrls = userDoc.imageUrls.filter((url) => url !== data.url);

  await userDoc.save();

  await fs.deleteFromUrl(data.url);

  res.status(200).json({ success: true });
}

export const addProfilePic = async (req: Request, res: Response, fs: AbstractFileSystem) => {
  const user = res.locals.user as JwtPayloadWithUser;

  const { success, data } = addProfilePicSchema.safeParse(req.body);

  if (!success) {
    res.status(400).json({ error: "Invalid request." });
    return;
  }

  const userDoc = await User.findById(user.user.id);

  if (!userDoc) {
    res.status(404).json({ error: "User not found." });
    return;
  }

  if (!userDoc.imageUrls) {
    userDoc.imageUrls = [];
  }

  const processedBuffer = await processProfilePic(Buffer.from(data.encodedImage, "base64"));
  const slug = Math.random().toString(36).substring(7);
  const url = await fs.create(processedBuffer, "image/webp", `profile_pics/${user.user.id}/${slug}.webp`);

  userDoc.imageUrls.unshift(url);

  await userDoc.save();

  res.status(200).json({ success: true, url });


}

export const principalProfilePic = async (req: Request, res: Response) => {
  const user = res.locals.user as JwtPayloadWithUser;

  const { success, data } = principalProfilePicSchema.safeParse(req.body);

  if (!success) {
    res.status(400).json({ error: "Invalid request." });
    return;
  }

  const userDoc = await User.findById(user.user.id);

  if (!userDoc) {
    res.status(404).json({ error: "User not found." });
    return;
  }

  if (!userDoc.imageUrls) {
    res.status(404).json({ error: "No profile pictures found." });
    return;
  }

  if (data.index >= userDoc.imageUrls.length) {
    res.status(400).json({ error: "Invalid index." });
    return;
  }

  const url = userDoc.imageUrls[data.index];

  userDoc.imageUrls = userDoc.imageUrls.filter((img) => img !== url);

  userDoc.imageUrls.unshift(url);

  await userDoc.save();

  res.status(200).json({ success: true });
}
