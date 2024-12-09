import fs from "fs";
import type { AbstractFileSystem } from "./AbstractFileSystem";

export class LocalFS implements AbstractFileSystem {
  static root: string = "./data";
  async create(buffer: Buffer, mimetype: string, path: string): Promise<string> {
    if (!fs.existsSync(LocalFS.root)) {
      fs.mkdirSync(LocalFS.root);
    }
    fs.writeFileSync(`${LocalFS.root}/${path}`, buffer);
    return `${LocalFS.root}/${path}`;
  }
  async delete(path: string): Promise<void> {
    fs.unlinkSync(`${LocalFS.root}/${path}`);
  }

  async deleteFromUrl(url: string) {
    const path = url.split("data/")[1];
    fs.unlinkSync(`${LocalFS.root}/${path}`);
  }

}
