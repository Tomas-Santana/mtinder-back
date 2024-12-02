import e from "express";
import type { RouterGroup } from "../../types/server/RouterGroup";
import { uploadImage, uploadProfileImages } from "./uploadImage";
import { LocalFS } from "../../storage/LocalFS";
import { token } from "../middleware/token";

export class PhotosGroup implements RouterGroup {
  public path = "/photos";
  public router = e.Router();

  getRouter(): e.Router {
    const fs = new LocalFS();
    this.router.use(token)
    this.router.get("/", (req, res) => {
      res.send("Photos");
    });

    this.router.post("/upload", (req, res) => {
      uploadImage(req, res, fs);
    });
    this.router.post("/upload-images", (req, res) => {
      uploadProfileImages(req, res, fs);
    });

    return this.router;
  }


}