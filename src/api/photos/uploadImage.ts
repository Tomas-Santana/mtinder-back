import { AbstractFileSystem } from "../../storage/AbstractFileSystem";
import { Request, Response } from "express";
import { uploadImageRequest, uploadImagesRequest } from "../../types/api/uploadImageRequest";
import JwtPayloadWithUser from "../../types/api/jwtPayload";

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

  if (!user) {
    res.status(401).json({error: "Unauthorized"});
    return;
  }

  const {success, data} = uploadImagesRequest.safeParse(req.body);

  if (!success) {
    res.status(400).json({error: "Invalid request"});
    return;
  }

  const imageUrls = [];

  await fs.mkdir(`profiles/${user.user.id}`);

  for (let i = 0; i < data.imagesBase64.length; i++) {
    const binData = Buffer.from(data.imagesBase64[i], 'base64');
    await fs.create(`profiles/${user.user.id}/${i}.jpg`, binData);
    imageUrls.push(`profiles/${user.user.id}/${i}.jpg`);
  }

  res.json({imageUrls});
}

