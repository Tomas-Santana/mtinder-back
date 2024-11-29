import { AbstractFileSystem } from "../../storage/AbstractFileSystem";
import { Request, Response } from "express";
import { uploadImageRequest } from "../../types/api/uploadImageRequest";

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

