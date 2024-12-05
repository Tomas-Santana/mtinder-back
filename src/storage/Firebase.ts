import { bucket } from "../services/firebase";
import { getDownloadURL } from "firebase-admin/storage";


export class FirebaseFS {
  async uploadFile(file: Express.Multer.File, path: string) {
    const fileRef = bucket.file(path);
    await fileRef.save(file.buffer, {
      contentType: file.mimetype,
    });
    return getDownloadURL(fileRef);
  }


}