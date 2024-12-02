export interface AbstractFileSystem {
  create(path: string, data: Buffer): Promise<void>;
  read(path: string): Promise<string>;
  update(path: string, data: string): Promise<void>;
  delete(path: string): Promise<void>;
  mkdir(path: string): Promise<void>;
}