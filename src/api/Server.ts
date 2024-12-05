import e from "express";
import { PhotosGroup } from "./photos/Group";
import AuthGroup from "./auth/Group";
import UserGroup from "./users/Group";
import { createRouteHandler } from "uploadthing/express";

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
    this.app.use(e.json({limit: "50mb"})); 
    this.app.use("/resources", e.static("data"));
    this.app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });

    const authGroup = new AuthGroup();
    this.app.use(authGroup.path, authGroup.getRouter())

    const photosGroup = new PhotosGroup();
    this.app.use(photosGroup.path, photosGroup.getRouter());

    const userGroup = new UserGroup()
    this.app.use(userGroup.path, userGroup.getRouter());

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
