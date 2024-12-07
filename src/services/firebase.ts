import { cert, initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { Storage } from "@google-cloud/storage";

const serviceAccount = require("../../cert/admin-cert.json");

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: "mellow-mates-db93c.firebasestorage.app",
});

export const bucket = getStorage().bucket();