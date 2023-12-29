import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBRCqz8v5WR90-fHodLKUNHj6YH6KMFeuM",
  authDomain: "projectcharlie-2b470.firebaseapp.com",
  projectId: "projectcharlie-2b470",
  storageBucket: "projectcharlie-2b470.appspot.com",
  messagingSenderId: "667790183211",
  appId: "1:667790183211:web:538fd4631798386796136e",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
