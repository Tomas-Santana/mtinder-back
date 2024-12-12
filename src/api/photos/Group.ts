import e from "express";
import type { RouterGroup } from "../../types/server/RouterGroup";
import { completeProfile } from "./completeProfile";
import { deleteProfilePic, addProfilePic, principalProfilePic } from "./profilepictures";

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
    this.router.post("/delete-profile-pic", (req, res) => {
      deleteProfilePic(req, res, fs);
    });
    this.router.post("/add-profile-pic", (req, res) => {
      addProfilePic(req, res, fs);
    });
    this.router.post("/principal-profile-pic", principalProfilePic)


    return this.router;
  }
}
