import e from "express";

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
    this.app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });

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
