import e from "express";
import { PhotosGroup } from "./photos/Group";

export class Server {
  private app: e.Application;
  private port: number;
  private address?: string;
  private static DEFAULT_ADDRESS = "127.0.0.1";

  constructor(port: number, address?: string) {
    this.app = e();
    this.port = port;
    this.address = address;
  }

  public start() {
    this.app.use(e.json());
    // logger
    this.app.use("/resources", e.static("data"));
    this.app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });

    const photosGroup = new PhotosGroup();
    this.app.use(photosGroup.path, photosGroup.getRouter());

    this.app.get("/", (_, res) => {
      res.send("Hello World");
    });


    this.app.listen(this.port, () => {
      console.log(
        `Server listening on ${this.address || Server.DEFAULT_ADDRESS}:${
          this.port
        }`
      );
    });
  }
}
