import fs from "fs";
import type { AbstractFileSystem } from "./AbstractFileSystem";

export class LocalFS implements AbstractFileSystem {
  static root: string = "./data";
  async create(path: string, data: Buffer): Promise<void> {
    fs.writeFileSync(`${LocalFS.root}/${path}`, data);
  }

  async read(path: string): Promise<string> {
    return fs.readFileSync(`${LocalFS.root}/${path}`, "utf8");
  }

  async update(path: string, data: string): Promise<void> {
    fs.writeFileSync(`${LocalFS.root}/${path}`, data);
  }

  async delete(path: string): Promise<void> {
    fs.unlinkSync(`${LocalFS.root}/${path}`);
  }
}
