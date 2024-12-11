import { cert, initializeApp, ServiceAccount } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import "dotenv/config";


const serviceAccount: ServiceAccount = {
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: "mellow-mates-db93c.firebasestorage.app",
});

export const bucket = getStorage().bucket();