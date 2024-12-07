import { AbstractFileSystem } from "../../storage/AbstractFileSystem";
import { Request, Response } from "express";
import {
  uploadImageRequest,
  completeProfileRequest,
} from "../../types/api/uploadImageRequest";
import JwtPayloadWithUser from "../../types/api/jwtPayload";
import { processProfilePic } from "../../helpers/processFile";
import User from "../../database/models/user";

export async function completeProfile(
  req: Request,
  res: Response,
  fs: AbstractFileSystem
) {
  const user = res.locals.user as JwtPayloadWithUser | undefined;

  const { success, data } = completeProfileRequest.safeParse(req.body);
  if (!success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userRecord = await User.findById(user.user.id);
  if (!userRecord) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  if (userRecord.imageUrls) {
    // delete old images
    await Promise.all(
      userRecord.imageUrls.map(async (url) => {
        await fs.deleteFromUrl(url);
      })
    );
  }

  const urls = await Promise.all(
    data.images.map(async (file) => {
      // create a random path for the file
      const slug = Math.random().toString(36).substring(7);
      const path = `public/profile_pics/${user.user.id}/${slug}.webp`;
      const processed = await processProfilePic(
        Buffer.from(file.base64, "base64")
      );
      return await fs.create(processed, "image/webp", path);
    })
  );

  userRecord.imageUrls = urls;

  await userRecord.save();

  res.json({ success: true, imageUrls: urls });
}
