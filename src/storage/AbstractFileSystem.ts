export interface AbstractFileSystem {
  create(buffer: Buffer, mimetype: string, path: string): Promise<string>;
  delete(path: string): Promise<void>;
  deleteFromUrl(url: string): Promise<void>;
  getUserIdfromUrl(url: string): string | null;
  // read(path: string): Promise<string>;
  // update(path: string, data: string): Promise<void>;
  // delete(path: string): Promise<void>;
  // mkdir(path: string): Promise<void>;
}