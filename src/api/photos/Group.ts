import e from "express";
import type { RouterGroup } from "../../types/server/RouterGroup";
import { uploadImage } from "./uploadImage";
import { LocalFS } from "../../storage/LocalFS";

export class PhotosGroup implements RouterGroup {
  public path = "/photos";
  public router = e.Router();

  getRouter(): e.Router {
    const fs = new LocalFS();
    this.router.get("/", (req, res) => {
      res.send("Photos");
    });

    this.router.post("/upload", (req, res) => {
      uploadImage(req, res, fs);
    });

    return this.router;
  }


}