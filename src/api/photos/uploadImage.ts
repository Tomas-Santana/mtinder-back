import { AbstractFileSystem } from "../../storage/AbstractFileSystem";
import { Request, Response } from "express";
import { uploadImageRequest, uploadImagesRequest } from "../../types/api/uploadImageRequest";
import JwtPayloadWithUser from "../../types/api/jwtPayload";
import { FirebaseFS } from "../../storage/Firebase";
import { processProfilePic } from "../../helpers/processFile";
import User from "../../database/models/user";

export async function uploadImage(req: Request, res: Response, fs: AbstractFileSystem) {
  
  const {success, data} = uploadImageRequest.safeParse(req.body);

  if (!success) {
    res.status(400).json({error: "Invalid request"});
    return;
  }
  const binData = Buffer.from(data.data, 'base64');
  await fs.create(data.path, binData);

  res.json({success: true});
}

export async function uploadProfileImages(req: Request, res: Response, fs: AbstractFileSystem) {

  const user = res.locals.user as JwtPayloadWithUser | undefined;
  const files = req.files

  if (!files || !Array.isArray(files)) {
    res.status(400).json({error: "Invalid request"});
    return;
  }
  if (!user) {
    res.status(401).json({error: "Unauthorized"});
    return;
  }

  const ffs = new FirebaseFS();
  const userRecord = await User.findById(user.user.id);
  if (!userRecord) {
    res.status(404).json({error: "User not found"});
    return;
  }

  const urls = await Promise.all(files.map(async (file) => {
    // create a random path for the file
    const slug = Math.random().toString(36).substring(7);
    const path = `profile_pics/${user.user.id}/${slug}.webp`;
    const processed = await processProfilePic(file.buffer);
    file.buffer = processed;
    return await ffs.uploadFile(file, path);
  }));

  userRecord.imageUrls = urls;

  await userRecord.save();

  res.json({success: true, imageUrls: urls});



}

