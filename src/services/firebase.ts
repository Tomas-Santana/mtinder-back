import { cert, initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

const serviceAccount = require("../../cert/admin-cert.json");

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: "cervant-admin-panel.appspot.com",
});

export const bucket = getStorage().bucket();
