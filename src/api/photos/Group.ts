import e from "express";
import type { RouterGroup } from "../../types/server/RouterGroup";
import { completeProfile } from "./completeProfile";
import { token } from "../middleware/token";
import { FirebaseFS } from "../../storage/FirebaseFS";

export class PhotosGroup implements RouterGroup {
  public path = "/photos";
  public router = e.Router();

  getRouter(): e.Router {
    const fs = new FirebaseFS();
    this.router.use(token);

    this.router.post("/upload-images", (req, res) => {
      completeProfile(req, res, fs);
    });

    return this.router;
  }
}
