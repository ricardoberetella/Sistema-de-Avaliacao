import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC_IWOMMMbCj9AnXj_TsnMqHgIef_uJmvY",
  authDomain: "sistema-de-avaliacao-2bb07.firebaseapp.com",
  projectId: "sistema-de-avaliacao-2bb07",
  storageBucket: "sistema-de-avaliacao-2bb07.appspot.com",
  messagingSenderId: "581224749980",
  appId: "1:581224749980:web:715077a0751da70cc7083a",
  measurementId: "G-ZZJXBYXN7P"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export default app;
