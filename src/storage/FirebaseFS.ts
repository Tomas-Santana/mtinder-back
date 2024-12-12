import { bucket } from "../services/firebase";
import { getDownloadURL } from "firebase-admin/storage";
import { AbstractFileSystem } from "./AbstractFileSystem";


export class FirebaseFS implements AbstractFileSystem {
  async create(buffer: Buffer, mimetype: string, path: string) {
    const fileRef = bucket.file(path);
    await fileRef.save(buffer, {
      contentType: mimetype,
    });
    return getDownloadURL(fileRef);
  }
  async delete(path: string): Promise<void> {
    await bucket.file(path).delete();
  }

  async deleteFromUrl(url: string) {
    const path = getPathFromUrl(url);
    await bucket.file(path).delete();
  }

  getUserIdfromUrl(url: string) {

    if (!url.includes("profile_pics")) {
      return null;
    }

    const split = url.split("%2F");
    return split[2];
  }
}

export function getPathFromUrl(url: string) {
  return url.split("app/o/")[1].split("?")[0].replace(/%2F/g, "/").replace(/%20/g, " ");
}